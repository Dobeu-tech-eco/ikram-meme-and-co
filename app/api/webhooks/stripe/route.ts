import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processStripeEvent } from "@/lib/stripe-events";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const seenEventIds = new Set<string>();

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

  if (seenEventIds.has(event.id)) {
    return NextResponse.json({ received: true, deduped: true });
  }
  seenEventIds.add(event.id);
  if (seenEventIds.size > 1000) {
    const oldest = seenEventIds.values().next().value;
    if (oldest) seenEventIds.delete(oldest);
  }

  try {
    await processStripeEvent({ db: createAdminClient() as never, notify }, event as never);
  } catch (err) {
    console.error("stripe webhook handler failed", err);
    return new NextResponse("handler error", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
