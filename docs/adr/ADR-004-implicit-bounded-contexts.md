# ADR-004: Implicit bounded contexts (conceptual context map)

- **Status:** Accepted
- **Date:** 2026-07-16

## Context

The codebase does **not** use a classic DDD `src/<context>/domain/` layout (see ADR-001
for the actual pure-`Core`/`Db` pattern). But it *does* have clear implicit bounded
contexts, and naming them sharpens the module boundaries that already exist. This ADR is
**conceptual documentation only** — it prescribes no directory scaffolding, aggregates, or
entity classes.

## Decision

Recognize five implicit bounded contexts and the boundaries between them.

### Contexts

| Context | Responsibility | Primary code |
|---|---|---|
| **Catalog** | Public browsing of products/artists (read models) | `app/[locale]/{shop,product,artists}`, `lib/catalog.ts` |
| **Checkout & Inventory** | Reserve originals, timed DB holds, open Stripe session | `lib/checkout.ts`, RPCs `reserve_original` / `release_original` / `decrement_edition` |
| **Orders & Fulfillment** | Post-payment order lifecycle, finalize stock, confirmation email, admin fulfillment | `app/api/webhooks/stripe`, `lib/stripe-events.ts`, `mark_sold`, `lib/actions/orders.ts` |
| **Identity & Admin** | Magic-link auth, `requireAdmin`, `ADMIN_EMAILS` gating | `lib/actions/auth.ts`, `app/admin` |
| **Subscriptions & Marketing** | Newsletter opt-in, consent-gated analytics, transactional email | `lib/actions/subscribe.ts`, `lib/{analytics,resend,notify}.ts` |

### Relationships

- **Catalog → Checkout** — Catalog publishes the product/artist read model that Checkout
  consumes (published language).
- **Checkout → Orders** — upstream/downstream: Checkout opens the Stripe session; the
  webhook in Orders creates the order on `checkout.session.completed`. Their **shared
  kernel** is the set of inventory RPCs.
- **Identity & Admin** — a supporting context gating all service-role writes across
  Orders and Catalog.
- **Subscriptions & Marketing** — largely independent; touches Identity only for admin
  views of subscribers.

### The boundary is enforced in the database, not in app layers

The anti-corruption / enforcement layer is **Postgres itself**:
- **RLS**: anon may read `artists` and non-draft `products` only; `orders`,
  `order_items`, `subscribers` are service-role only.
- **`SECURITY DEFINER` RPCs** (ADR-002): stock transitions are revoked from
  anon/authenticated and granted to `service_role` only.

So the trust boundary runs between anon-facing contexts (Catalog) and service-role
contexts (Checkout/Inventory, Orders, Identity), and it is guaranteed at the data layer.

## Consequences

- A shared vocabulary for the modules without importing DDD scaffolding that would
  contradict ADR-001.
- New features should be placed against these contexts, and any cross-context write must
  continue to go through the DB-enforced boundary (RLS + RPCs), never the anon client.
- If the app ever outgrows this and needs formal aggregates, this map is the starting
  point — but that would be a new ADR superseding the "no DDD scaffolding" stance.
