-- =============================================================================
-- Durable Stripe webhook idempotency (2026-07-25)
--
-- Replaces the in-memory Set in app/api/webhooks/stripe/route.ts, which does
-- not survive across serverless instances: a retried Stripe event hitting a
-- different lambda could be processed twice, double-inserting order_items.
-- (The Set also had a correctness bug — it marked an event "seen" before
-- processing, so a handler failure returned 500 while the retry was deduped
-- and silently dropped.)
--
-- The webhook now CLAIMS an event by inserting its id here before processing
-- (a unique-violation => already handled => dedup), and RELEASES the claim
-- (deletes the row) if processing throws, so Stripe's retry can reprocess it.
-- =============================================================================
create table if not exists public.stripe_events (
  event_id    text primary key,
  received_at timestamptz not null default now()
);

-- Only the service-role admin client (which bypasses RLS) reads/writes this
-- table. RLS enabled with zero policies = deny-all for anon/authenticated,
-- matching the project's other server-only tables.
alter table public.stripe_events enable row level security;
