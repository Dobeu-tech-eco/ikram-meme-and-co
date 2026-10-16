import type { Db, DbResult } from "@/lib/db-types";

export type Notify = {
  orderPaid: (input: {
    email: string;
    locale: "en" | "ar";
    productTitle: string;
    amountCents: number;
  }) => Promise<void>;
};

type SessionLike = {
  id: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    address?: unknown;
  } | null;
  metadata?: Record<string, string> | null;
};

export type IncomingStripeEvent = {
  id: string;
  type: string;
  data: { object: SessionLike };
};

/** Postgres interval passed to claim_stripe_event. Matches the SQL default. */
export const STRIPE_CLAIM_STALE_AFTER = "00:05:00";

export type StripeClaimState = "claimed" | "reclaimed" | "duplicate" | "in_progress";

export type WebhookDispatch =
  | { ok: true; deduped: boolean }
  | { ok: false; reason: "in_progress" };

type InventoryResult = "applied" | "already_applied" | "order_missing" | "product_missing";

type ProductRow = {
  title_en: string;
  title_ar: string;
  fulfillment_type: string;
};

type OrderRow = { id: string };

function unwrap(result: DbResult, context: string): unknown {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

function assertClaimState(value: unknown): StripeClaimState {
  switch (value) {
    case "claimed":
    case "reclaimed":
    case "duplicate":
    case "in_progress":
      return value;
    default:
      throw new Error(`claim stripe event: unexpected result ${String(value)}`);
  }
}

function assertInventoryResult(value: unknown): InventoryResult {
  switch (value) {
    case "applied":
    case "already_applied":
    case "order_missing":
    case "product_missing":
      return value;
    default:
      throw new Error(`apply inventory: unexpected result ${String(value)}`);
  }
}

async function claimStripeEvent(db: Db, eventId: string): Promise<StripeClaimState> {
  const result = await db.rpc("claim_stripe_event", {
    p_event_id: eventId,
    p_stale_after: STRIPE_CLAIM_STALE_AFTER,
  });
  return assertClaimState(unwrap(result, "claim stripe event"));
}

async function completeStripeEvent(db: Db, eventId: string): Promise<void> {
  const result = await db.rpc("complete_stripe_event", { p_event_id: eventId });
  unwrap(result, "complete stripe event");
}

async function releaseStripeEvent(db: Db, eventId: string): Promise<void> {
  try {
    const result = await db.rpc("release_stripe_event", { p_event_id: eventId });
    if (result.error) {
      console.error("stripe event release failed", {
        eventId,
        message: result.error.message,
      });
    }
  } catch (err) {
    console.error("stripe event release failed", { eventId, err });
  }
}

/**
 * Durable claim around processStripeEvent.
 * duplicate: another worker already finished this event.
 * in_progress: a live claim is younger than the stale window; caller returns 500
 * so Stripe retries without starting a second worker.
 * claimed / reclaimed: this worker owns processing. On failure the claim is
 * released for an immediate retry. A crash that skips the release is recovered
 * when claimed_at ages past STRIPE_CLAIM_STALE_AFTER.
 */
export async function handleStripeWebhook(
  deps: { db: Db; notify: Notify },
  event: IncomingStripeEvent
): Promise<WebhookDispatch> {
  const claim = await claimStripeEvent(deps.db, event.id);
  switch (claim) {
    case "duplicate":
      return { ok: true, deduped: true };
    case "in_progress":
      return { ok: false, reason: "in_progress" };
    case "claimed":
    case "reclaimed":
      break;
    default: {
      const _exhaustive: never = claim;
      throw new Error(`claim stripe event: unexpected result ${String(_exhaustive)}`);
    }
  }

  try {
    await processStripeEvent(deps, event);
    await completeStripeEvent(deps.db, event.id);
    return { ok: true, deduped: false };
  } catch (err) {
    await releaseStripeEvent(deps.db, event.id);
    throw err;
  }
}

export async function processStripeEvent(
  deps: { db: Db; notify: Notify },
  event: { type: string; data: { object: SessionLike } }
): Promise<void> {
  const { db, notify } = deps;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const productId = session.metadata?.product_id;
    if (!productId) return;
    const locale: "en" | "ar" = session.metadata?.locale === "ar" ? "ar" : "en";

    const productResult = await db.from("products").select("*").eq("id", productId).single();
    const product = unwrap(productResult, "load product") as ProductRow | null;
    if (!product) throw new Error("load product: not found");

    const orderResult = await db
      .from("orders")
      .upsert(
        {
          email: session.customer_details?.email ?? "",
          status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          amount_total_cents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          shipping_name: session.customer_details?.name ?? null,
          shipping_address: session.customer_details?.address ?? null,
          locale,
        },
        { onConflict: "stripe_checkout_session_id" }
      )
      .select()
      .single();
    const order = unwrap(orderResult, "upsert order") as OrderRow | null;
    if (!order?.id) throw new Error("upsert order: no row");

    // Unique (order_id, product_id) makes a retry a no-op instead of a second line.
    const itemResult = await db.from("order_items").upsert(
      {
        order_id: order.id,
        product_id: productId,
        title_en: product.title_en,
        price_cents: session.amount_total ?? 0,
        quantity: 1,
      },
      { onConflict: "order_id,product_id", ignoreDuplicates: true }
    );
    unwrap(itemResult, "upsert order item");

    const inventoryResult = await db.rpc("apply_checkout_inventory", {
      p_order_id: order.id,
      p_product_id: productId,
    });
    const inventory = assertInventoryResult(unwrap(inventoryResult, "apply inventory"));
    switch (inventory) {
      case "applied":
      case "already_applied":
        break;
      case "order_missing":
      case "product_missing":
        throw new Error(`apply inventory: ${inventory}`);
      default: {
        const _exhaustive: never = inventory;
        throw new Error(`apply inventory: unexpected result ${String(_exhaustive)}`);
      }
    }

    const notificationResult = await db.rpc("claim_order_notification", {
      p_order_id: order.id,
    });
    const claimedNotification = unwrap(notificationResult, "claim order notification");
    if (typeof claimedNotification !== "boolean") {
      throw new Error(
        `claim order notification: unexpected result ${String(claimedNotification)}`
      );
    }
    if (claimedNotification) {
      try {
        await notify.orderPaid({
          email: session.customer_details?.email ?? "",
          locale,
          productTitle: locale === "ar" ? product.title_ar : product.title_en,
          amountCents: session.amount_total ?? 0,
        });
      } catch (err) {
        const reset = await db
          .from("orders")
          .update({ notified_at: null })
          .eq("id", order.id);
        if (reset.error) {
          console.error("stripe order notification reset failed", {
            orderId: order.id,
            message: reset.error.message,
          });
        }
        throw err;
      }
    }
    return;
  }

  if (event.type === "checkout.session.expired") {
    const productId = event.data.object.metadata?.product_id;
    if (!productId) return;
    const released = await db.rpc("release_original", { p_id: productId });
    unwrap(released, "release original");
  }
}
