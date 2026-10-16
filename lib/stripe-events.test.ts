import { describe, it, expect, vi } from "vitest";
import {
  handleStripeWebhook,
  processStripeEvent,
  STRIPE_CLAIM_STALE_AFTER,
} from "@/lib/stripe-events";
import { buildStubClient, type StubResult } from "@/lib/__test-helpers";

const baseSession = {
  id: "cs_123",
  payment_intent: "pi_123",
  amount_total: 24000,
  currency: "usd",
  customer_details: { email: "buyer@example.com", name: "Buyer", address: { country: "US" } },
  metadata: { product_id: "p1", locale: "ar" },
};

const completedEvent = {
  id: "evt_1",
  type: "checkout.session.completed",
  data: { object: baseSession },
};

function makeDeps(
  fulfillment: string,
  overrides: Record<string, StubResult | StubResult[]> = {}
) {
  const db = buildStubClient({
    products: {
      data: {
        id: "p1",
        title_en: "Desert Moon",
        title_ar: "قمر الصحراء",
        fulfillment_type: fulfillment,
      },
      error: null,
    },
    orders: { data: { id: "o1" }, error: null },
    order_items: { data: null, error: null },
    "rpc.apply_checkout_inventory": { data: "applied", error: null },
    "rpc.claim_order_notification": { data: true, error: null },
    "rpc.mark_sold": { data: null, error: null },
    "rpc.decrement_edition": { data: true, error: null },
    "rpc.release_original": { data: null, error: null },
    "rpc.claim_stripe_event": { data: "claimed", error: null },
    "rpc.complete_stripe_event": { data: null, error: null },
    "rpc.release_stripe_event": { data: null, error: null },
    ...overrides,
  });
  const notify = { orderPaid: vi.fn(async () => {}) };
  return { db, notify };
}

describe("processStripeEvent", () => {
  it("completed: records order, applies inventory once, notifies in buyer locale", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } }
    );
    expect(db.calls["orders.upsert"]).toHaveLength(1);
    expect(db.calls["order_items.upsert"]).toEqual([
      [
        expect.objectContaining({ order_id: "o1", product_id: "p1", quantity: 1 }),
        { onConflict: "order_id,product_id", ignoreDuplicates: true },
      ],
    ]);
    expect(db.calls["order_items.insert"]).toBeUndefined();
    expect(db.calls["rpc.apply_checkout_inventory"]).toEqual([
      [{ p_order_id: "o1", p_product_id: "p1" }],
    ]);
    expect(db.calls["rpc.mark_sold"]).toBeUndefined();
    expect(db.calls["rpc.decrement_edition"]).toBeUndefined();
    expect(notify.orderPaid).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "buyer@example.com",
        locale: "ar",
        productTitle: "قمر الصحراء",
        amountCents: 24000,
      })
    );
  });

  it("completed: does not call the legacy inventory rpcs for editions", async () => {
    const { db, notify } = makeDeps("edition");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } }
    );
    expect(db.calls["rpc.apply_checkout_inventory"]).toHaveLength(1);
    expect(db.calls["rpc.decrement_edition"]).toBeUndefined();
    expect(db.calls["rpc.mark_sold"]).toBeUndefined();
  });

  it("replay skips email and treats an already-applied inventory claim as success", async () => {
    const { db, notify } = makeDeps("edition", {
      "rpc.apply_checkout_inventory": { data: "already_applied", error: null },
      "rpc.claim_order_notification": { data: false, error: null },
    });
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } }
    );
    expect(db.calls["order_items.upsert"]).toHaveLength(1);
    expect(db.calls["order_items.insert"]).toBeUndefined();
    expect(db.calls["rpc.decrement_edition"]).toBeUndefined();
    expect(db.calls["rpc.mark_sold"]).toBeUndefined();
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });

  it("throws when the order upsert returns an error and does not write further", async () => {
    const { db, notify } = makeDeps("original", {
      orders: { data: null, error: { message: "permission denied for table orders" } },
    });
    await expect(
      processStripeEvent(
        { db: db as never, notify },
        { type: "checkout.session.completed", data: { object: baseSession } }
      )
    ).rejects.toThrow(/upsert order: permission denied/);
    expect(db.calls["order_items.upsert"]).toBeUndefined();
    expect(db.calls["rpc.apply_checkout_inventory"]).toBeUndefined();
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });

  it("throws when the line item write fails before inventory or email", async () => {
    const { db, notify } = makeDeps("edition", {
      order_items: { data: null, error: { message: "connection reset" } },
    });
    await expect(
      processStripeEvent(
        { db: db as never, notify },
        { type: "checkout.session.completed", data: { object: baseSession } }
      )
    ).rejects.toThrow(/upsert order item: connection reset/);
    expect(db.calls["rpc.apply_checkout_inventory"]).toBeUndefined();
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });

  it("throws when apply_checkout_inventory returns an error", async () => {
    const { db, notify } = makeDeps("original", {
      "rpc.apply_checkout_inventory": { data: null, error: { message: "statement timeout" } },
    });
    await expect(
      processStripeEvent(
        { db: db as never, notify },
        { type: "checkout.session.completed", data: { object: baseSession } }
      )
    ).rejects.toThrow(/apply inventory: statement timeout/);
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });

  it("clears the notification claim when email fails so a retry can send", async () => {
    const { db, notify } = makeDeps("original");
    notify.orderPaid.mockRejectedValueOnce(new Error("resend down"));
    await expect(
      processStripeEvent(
        { db: db as never, notify },
        { type: "checkout.session.completed", data: { object: baseSession } }
      )
    ).rejects.toThrow(/resend down/);
    expect(db.calls["orders.update"]).toEqual([[{ notified_at: null }]]);
  });

  it("expired: releases the hold and throws if that rpc returns an error", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      {
        type: "checkout.session.expired",
        data: { object: { id: "cs_123", metadata: { product_id: "p1" } } },
      }
    );
    expect(db.calls["rpc.release_original"]).toHaveLength(1);
    expect(notify.orderPaid).not.toHaveBeenCalled();

    const failing = makeDeps("original", {
      "rpc.release_original": { data: null, error: { message: "rpc down" } },
    });
    await expect(
      processStripeEvent(
        { db: failing.db as never, notify: failing.notify },
        {
          type: "checkout.session.expired",
          data: { object: { id: "cs_123", metadata: { product_id: "p1" } } },
        }
      )
    ).rejects.toThrow(/release original: rpc down/);
  });

  it("ignores unrelated events", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "invoice.paid", data: { object: { id: "cs_123" } } }
    );
    expect(db.from).not.toHaveBeenCalled();
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });
});

describe("handleStripeWebhook", () => {
  it("acks a duplicate delivery without processing again", async () => {
    const { db, notify } = makeDeps("original", {
      "rpc.claim_stripe_event": { data: "duplicate", error: null },
    });
    await expect(handleStripeWebhook({ db: db as never, notify }, completedEvent)).resolves.toEqual({
      ok: true,
      deduped: true,
    });
    expect(db.from).not.toHaveBeenCalled();
    expect(notify.orderPaid).not.toHaveBeenCalled();
    expect(db.calls["rpc.complete_stripe_event"]).toBeUndefined();
    expect(db.calls["rpc.release_stripe_event"]).toBeUndefined();
  });

  it("does not process or release a claim another worker still holds", async () => {
    const { db, notify } = makeDeps("original", {
      "rpc.claim_stripe_event": { data: "in_progress", error: null },
    });
    await expect(handleStripeWebhook({ db: db as never, notify }, completedEvent)).resolves.toEqual({
      ok: false,
      reason: "in_progress",
    });
    expect(db.from).not.toHaveBeenCalled();
    expect(db.calls["rpc.release_stripe_event"]).toBeUndefined();
    expect(db.calls["rpc.complete_stripe_event"]).toBeUndefined();
  });

  it("processes a reclaimed stale claim and marks it complete", async () => {
    const { db, notify } = makeDeps("original", {
      "rpc.claim_stripe_event": { data: "reclaimed", error: null },
    });
    await expect(handleStripeWebhook({ db: db as never, notify }, completedEvent)).resolves.toEqual({
      ok: true,
      deduped: false,
    });
    expect(db.calls["rpc.claim_stripe_event"]).toEqual([
      [{ p_event_id: "evt_1", p_stale_after: STRIPE_CLAIM_STALE_AFTER }],
    ]);
    expect(STRIPE_CLAIM_STALE_AFTER).toBe("00:05:00");
    expect(notify.orderPaid).toHaveBeenCalledTimes(1);
    expect(db.calls["rpc.apply_checkout_inventory"]).toHaveLength(1);
    expect(db.calls["rpc.complete_stripe_event"]).toEqual([[{ p_event_id: "evt_1" }]]);
    expect(db.calls["rpc.release_stripe_event"]).toBeUndefined();
  });

  it("releases the claim after a partial failure so a later delivery can finish once", async () => {
    const first = makeDeps("edition", {
      order_items: { data: null, error: { message: "connection reset" } },
    });
    await expect(
      handleStripeWebhook({ db: first.db as never, notify: first.notify }, completedEvent)
    ).rejects.toThrow(/upsert order item/);
    expect(first.db.calls["rpc.release_stripe_event"]).toEqual([[{ p_event_id: "evt_1" }]]);
    expect(first.db.calls["rpc.complete_stripe_event"]).toBeUndefined();
    expect(first.db.calls["rpc.apply_checkout_inventory"]).toBeUndefined();
    expect(first.notify.orderPaid).not.toHaveBeenCalled();

    const second = makeDeps("edition", {
      "rpc.claim_stripe_event": { data: "reclaimed", error: null },
    });
    await expect(
      handleStripeWebhook({ db: second.db as never, notify: second.notify }, completedEvent)
    ).resolves.toEqual({ ok: true, deduped: false });
    expect(second.db.calls["order_items.insert"]).toBeUndefined();
    expect(second.db.calls["order_items.upsert"]).toHaveLength(1);
    expect(second.db.calls["rpc.apply_checkout_inventory"]).toHaveLength(1);
    expect(second.db.calls["rpc.decrement_edition"]).toBeUndefined();
    expect(second.notify.orderPaid).toHaveBeenCalledTimes(1);
    expect(second.db.calls["rpc.complete_stripe_event"]).toHaveLength(1);
    expect(second.db.calls["rpc.release_stripe_event"]).toBeUndefined();
  });

  it("fails closed when the claim store returns an error", async () => {
    const { db, notify } = makeDeps("original", {
      "rpc.claim_stripe_event": {
        data: null,
        error: { message: "permission denied for table stripe_events" },
      },
    });
    await expect(
      handleStripeWebhook({ db: db as never, notify }, completedEvent)
    ).rejects.toThrow(/permission denied for table stripe_events/);
    expect(db.from).not.toHaveBeenCalled();
    expect(db.calls["rpc.release_stripe_event"]).toBeUndefined();
    expect(db.calls["rpc.complete_stripe_event"]).toBeUndefined();
  });

  it("logs a release failure and still surfaces the handler error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { db, notify } = makeDeps("original", {
        orders: { data: null, error: { message: "timeout" } },
        "rpc.release_stripe_event": { data: null, error: { message: "could not release" } },
      });
      await expect(
        handleStripeWebhook({ db: db as never, notify }, completedEvent)
      ).rejects.toThrow(/upsert order: timeout/);
      expect(errorSpy).toHaveBeenCalledWith(
        "stripe event release failed",
        expect.objectContaining({ eventId: "evt_1", message: "could not release" })
      );
      expect(db.calls["rpc.complete_stripe_event"]).toBeUndefined();
    } finally {
      errorSpy.mockRestore();
    }
  });
});
