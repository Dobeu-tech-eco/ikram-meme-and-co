"use server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { createCheckoutForProduct, type CheckoutResult } from "@/lib/checkout";

export async function buyNow(productId: string, locale: "en" | "ar"): Promise<CheckoutResult> {
  const result = await createCheckoutForProduct(
    {
      db: createAdminClient() as never,
      stripe: new Stripe(process.env.STRIPE_SECRET_KEY!),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    },
    { productId, locale }
  );
  if (result.ok) redirect(result.url); // throws NEXT_REDIRECT
  return result;
}
