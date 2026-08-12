# ADR-001: Pure `…Core` functions written against a `Db` structural type

- **Status:** Accepted
- **Date:** 2026-07-16

## Context

Admin mutations (create product, update status, subscribe, etc.) need Supabase
access, `requireAdmin()` auth, and `revalidatePath()` cache invalidation. Writing
business logic directly against `SupabaseClient<Database>` and wrapping it in
`"use server"` actions makes the logic hard to unit-test: the real client can't
be constructed in `jsdom`, and `server-only` / `next/cache` imports fail outside a
Next.js request.

## Decision

Split every admin mutation into two layers:

1. A **pure `…Core(db, input)` function** typed against the loose, chainable
   `Db` structural interface (`lib/db-types.ts`) — no auth, no `revalidatePath`,
   no framework imports. It is the unit under test and can run against a hand-written
   stub.
2. A thin **`"use server"` action** that calls `requireAdmin()`, passes the real
   service-role client into the core with an `as never` cast, and performs
   `revalidatePath()` on success.

Reference implementation: `lib/actions/products.ts` — `createProductCore` (pure)
vs. `createProduct` (action wrapper), and `lib/actions/subscribe.ts`.

## Consequences

- Business logic is unit-testable in `jsdom` without real credentials or a live
  Supabase (`vitest.config.ts` also aliases `server-only` → a stub).
- The `as never` cast at the action boundary is deliberate and load-bearing — it
  bridges the structural `Db` type and the concrete client. Keep it at the seam,
  not scattered through the core.
- New admin logic must follow this shape; putting auth or `revalidatePath` inside a
  core function breaks testability and the layering.
