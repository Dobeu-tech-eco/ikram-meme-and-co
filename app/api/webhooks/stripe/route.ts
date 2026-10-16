import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { handleStripeWebhook } from "@/lib/stripe-events";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("missing signature", { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("invalid signature", { status: 400 });
  }

  const db = createAdminClient();

  try {
    const result = await handleStripeWebhook(
      { db: db as never, notify },
      event as never
    );
    if (!result.ok) {
      switch (result.reason) {
        case "in_progress":
          console.warn("stripe event still in progress", event.id);
          return new NextResponse("event in progress", { status: 500 });
        default: {
          const _exhaustive: never = result.reason;
          throw new Error(`unexpected webhook result: ${String(_exhaustive)}`);
        }
      }
    }
    return NextResponse.json(
      result.deduped ? { received: true, deduped: true } : { received: true }
    );
  } catch (err) {
    console.error("stripe webhook handler failed", err);
    return new NextResponse("handler error", { status: 500 });
  }
}
