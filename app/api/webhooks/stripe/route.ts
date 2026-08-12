import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processStripeEvent } from "@/lib/stripe-events";
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

  // Durable idempotency (replaces the previous in-memory Set, which did not
  // survive across serverless instances). Claim the event by inserting its id
  // BEFORE processing: a unique-violation (23505) means another instance
  // already handled it, so we dedup. If the claim store itself errors, fail
  // closed so Stripe retries rather than silently dropping the event.
  const claim = await db.from("stripe_events").insert({ event_id: event.id });
  if (claim.error) {
    if (claim.error.code === "23505") {
      return NextResponse.json({ received: true, deduped: true });
    }
    console.error("stripe_events claim failed", claim.error);
    return new NextResponse("dedup store error", { status: 500 });
  }

  try {
    await processStripeEvent({ db: db as never, notify }, event as never);
  } catch (err) {
    console.error("stripe webhook handler failed", err);
    // Release the claim so Stripe's retry can reprocess this event (rather than
    // being deduped against a claim whose processing never completed).
    await db.from("stripe_events").delete().eq("event_id", event.id);
    return new NextResponse("handler error", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
