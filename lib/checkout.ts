import type { Db } from "@/lib/db-types";

const HOLD_MINUTES = 35; // DB hold; Stripe session expires slightly earlier

type StripeLike = {
  checkout: {
    sessions: {
      create: (params: Record<string, unknown>) => Promise<{ url: string | null }>;
    };
  };
};

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: "not_found" | "sold_out" | "stripe_error" };

export async function createCheckoutForProduct(
  deps: { db: Db; stripe: StripeLike; siteUrl: string },
  input: { productId: string; locale: "en" | "ar" }
): Promise<CheckoutResult> {
  const { db, stripe, siteUrl } = deps;
  const { data: product } = await db
    .from("products")
    .select("*")
    .eq("id", input.productId)
    .single();
  if (!product) return { ok: false, error: "not_found" };

  const p = product as {
    id: string;
    slug: string;
    title_en: string;
    title_ar: string;
    price_cents: number;
    currency: string;
    fulfillment_type: string;
    status: string;
    quantity: number;
  };

  if (p.fulfillment_type === "original") {
    const { data: reserved } = await db.rpc("reserve_original", {
      p_id: p.id,
      p_minutes: HOLD_MINUTES,
    });
    if (!reserved) return { ok: false, error: "sold_out" };
  } else if (p.status !== "available" || p.quantity < 1) {
    return { ok: false, error: "sold_out" };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Stripe requires expires_at >= 30 min from now; 31 min leaves clock-skew room.
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: p.currency,
            unit_amount: p.price_cents,
            product_data: {
              name: input.locale === "ar" ? p.title_ar : p.title_en,
            },
          },
        },
      ],
      metadata: { product_id: p.id, locale: input.locale },
      shipping_address_collection: {
        allowed_countries: [
          "US", "CA", "GB", "DE", "FR", "AE", "SA", "EG", "JO", "LB", "KW", "QA", "BH", "OM",
        ],
      },
      success_url: `${siteUrl}/${input.locale}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${input.locale}/product/${p.slug}`,
    });
    if (!session.url) return { ok: false, error: "stripe_error" };
    return { ok: true, url: session.url };
  } catch {
    if (p.fulfillment_type === "original") {
      await db.rpc("release_original", { p_id: p.id });
    }
    return { ok: false, error: "stripe_error" };
  }
}
