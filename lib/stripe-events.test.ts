import { describe, it, expect, vi } from "vitest";
import { processStripeEvent } from "@/lib/stripe-events";
import { buildStubClient } from "@/lib/__test-helpers";

const baseSession = {
  id: "cs_123",
  payment_intent: "pi_123",
  amount_total: 24000,
  currency: "usd",
  customer_details: { email: "buyer@example.com", name: "Buyer", address: { country: "US" } },
  metadata: { product_id: "p1", locale: "ar" },
};

function makeDeps(fulfillment: string) {
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
    "rpc.mark_sold": { data: null, error: null },
    "rpc.decrement_edition": { data: true, error: null },
    "rpc.release_original": { data: null, error: null },
  });
  const notify = { orderPaid: vi.fn(async () => {}) };
  return { db, notify };
}

describe("processStripeEvent", () => {
  it("completed: records order, marks original sold, notifies in buyer locale", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } } as never
    );
    expect(db.calls["orders.upsert"]).toHaveLength(1);
    expect(db.calls["order_items.insert"]).toHaveLength(1);
    expect(db.calls["rpc.mark_sold"]).toHaveLength(1);
    expect(notify.orderPaid).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "buyer@example.com",
        locale: "ar",
        productTitle: "قمر الصحراء",
        amountCents: 24000,
      })
    );
  });

  it("completed: decrements editions instead of marking sold", async () => {
    const { db, notify } = makeDeps("edition");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } } as never
    );
    expect(db.calls["rpc.decrement_edition"]).toHaveLength(1);
    expect(db.calls["rpc.mark_sold"]).toBeUndefined();
  });

  it("expired: releases the hold", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      {
        type: "checkout.session.expired",
        data: { object: { metadata: { product_id: "p1" } } },
      } as never
    );
    expect(db.calls["rpc.release_original"]).toHaveLength(1);
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });

  it("ignores unrelated events", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "invoice.paid", data: { object: {} } } as never
    );
    expect(db.from).not.toHaveBeenCalled();
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });
});
