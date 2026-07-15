import type { Db } from "@/lib/db-types";

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

    const { data: product } = await db.from("products").select("*").eq("id", productId).single();
    const p = product as
      | { title_en: string; title_ar: string; fulfillment_type: string }
      | null;

    const { data: order } = await db
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

    if (order) {
      await db.from("order_items").insert({
        order_id: (order as { id: string }).id,
        product_id: productId,
        title_en: p?.title_en ?? "",
        price_cents: session.amount_total ?? 0,
        quantity: 1,
      });
    }

    if (p?.fulfillment_type === "original") {
      await db.rpc("mark_sold", { p_id: productId });
    } else if (p?.fulfillment_type === "edition") {
      await db.rpc("decrement_edition", { p_id: productId });
    }

    await notify.orderPaid({
      email: session.customer_details?.email ?? "",
      locale,
      productTitle: locale === "ar" ? p?.title_ar ?? "" : p?.title_en ?? "",
      amountCents: session.amount_total ?? 0,
    });
    return;
  }

  if (event.type === "checkout.session.expired") {
    const productId = event.data.object.metadata?.product_id;
    if (productId) await db.rpc("release_original", { p_id: productId });
    return;
  }
}
