# ADR-002: Database-enforced inventory via `SECURITY DEFINER` RPCs

- **Status:** Accepted
- **Date:** 2026-07-16

## Context

Originals are one-of-one; editions have finite stock. Two buyers racing on the same
piece — or a webhook retrying — must never oversell. Enforcing this in application
code (read stock → decide → `update`) is racy across concurrent requests and across
the checkout/webhook split.

## Decision

Make the database the single source of truth for stock transitions. Four
`SECURITY DEFINER` Postgres functions (`supabase/migrations/20260715000000_initial_schema.sql`)
are the **only** correct way to mutate inventory:

- `reserve_original(p_id, p_minutes default 35)` — atomic reserve with a timed hold
- `release_original(p_id)` — release the hold
- `mark_sold(p_id)` — finalize an original
- `decrement_edition(p_id)` — atomic edition decrement

Execute is **revoked** from `public`, `anon`, and `authenticated`, and **granted only
to `service_role`**. Checkout (`lib/checkout.ts`) reserves a 35-minute DB hold and
opens a Stripe session that expires ~31 min out; on Stripe failure it releases the
hold. The Stripe webhook (`lib/stripe-events.ts`) calls `mark_sold` /
`decrement_edition` on `checkout.session.completed` and `release_original` on
`checkout.session.expired`.

## Consequences

- Race conditions are resolved atomically in Postgres, not in Node.
- Inventory can only change from server-side code holding the service-role client
  (webhook or authenticated admin) — never from the anon/public client.
- **Do not** write ad-hoc `update`s to stock columns; add a new `SECURITY DEFINER`
  RPC (revoked from anon/authenticated, granted to `service_role`) for any new
  transition and go through it.
