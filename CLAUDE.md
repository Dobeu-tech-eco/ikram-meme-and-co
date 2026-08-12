# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ The `@AGENTS.md` import above is the single most important rule: **this is Next.js 16 — treat
> APIs/conventions as potentially different from training data. Read the relevant guide in
> `node_modules/next/dist/docs/` before writing Next.js code.**

## What this is

"Ikram & Co." (Arabic: إكرام; operated by Dobeu Tech Solutions LLC) — a bilingual (English / Arabic + RTL)
e-commerce storefront selling original art by Arab artists, limited editions, and print-on-demand.
Public catalog + Stripe checkout + a service-role admin dashboard.
Stack: Next.js 16 App Router, React 19, next-intl v4, Supabase (Postgres + Auth + Storage), Stripe,
Resend (email), PostHog (consent-gated analytics), Tailwind v4, Zod.

## Commands (package manager is pnpm)

```bash
pnpm dev                       # dev server
pnpm build                     # production build
pnpm verify                    # type-check + lint + test:ci + build (run before committing)
pnpm type-check                # tsc --noEmit
pnpm lint  /  pnpm lint:fix    # eslint
pnpm test                      # vitest watch
pnpm test:ci                   # vitest run (CI)
pnpm test:e2e                  # playwright
pnpm db:types                  # regenerate lib/database.types.ts from local Supabase
```

Run a single unit test: `pnpm test:ci lib/checkout.test.ts` (or any path under `app|lib|components`).
Supabase migrations/seed and the full deploy runbook live in `docs/DEPLOYMENT.md`.

## Architecture

**Route layout (App Router).** Three top-level trees under `app/`:
- `app/[locale]/…` — the public, bilingual storefront (`en`/`ar`). All customer pages live here.
- `app/admin/…` — admin dashboard, **not** localized. `(dash)` route group is gated; `login` is public.
- `app/api/…` (Stripe webhook) and `app/auth/callback` (Supabase magic-link exchange).

**i18n (next-intl v4).** Locales `en`/`ar`, default `en`, configured in `i18n/routing.ts`,
`i18n/request.ts`, `i18n/navigation.ts`; strings in `messages/{en,ar}.json`. The plugin is wired in
`next.config.ts`. `app/[locale]/layout.tsx` sets `<html dir>` via `localeDir()` in `lib/i18n.ts`
(`ar` → `rtl`). Never hardcode UI copy — add keys to both message files.
Locale routing runs in **`proxy.ts`** (Next 16's rename of `middleware.ts` — the export is
`proxy`, not `middleware`): `createMiddleware(routing)` with a matcher that **excludes**
`api|admin|auth|_next|_vercel` and any path with a file extension, so admin/API/auth routes
bypass locale rewriting. See `docs/adr/ADR-003`.

**Supabase access — two clients (`lib/supabase/server.ts`).**
- `createClient()` — cookie-bound anon SSR client for public reads and reading the logged-in user.
- `createAdminClient()` — service-role client, **server-only**, bypasses RLS. Use only behind auth or
  in the Stripe webhook.
RLS (see the migration): anon can read `artists` and non-draft `products` only; `orders`, `order_items`,
`subscribers` are service-role only. Respect this boundary — never fetch orders/subscribers with the anon client.

**The `Db` structural type (`lib/db-types.ts`) is deliberate.** Business logic is written against this
loose, chainable interface rather than `SupabaseClient<Database>`, so pure "core" functions stay
unit-testable with a stub. Pattern: a pure `…Core(db, input)` function (no auth, no `revalidatePath`)
wrapped by a `"use server"` action that calls `requireAdmin()` and passes the real client with an
`as never` cast. See `lib/actions/products.ts` (`createProductCore` vs `createProduct`) and
`lib/actions/subscribe.ts`. Keep new logic in this shape.

**Inventory & checkout are race-guarded in the database.** SECURITY DEFINER Postgres functions
(`reserve_original`, `release_original`, `mark_sold`, `decrement_edition`) are the only correct way to
mutate stock; they are `revoke`d from anon/authenticated and granted to `service_role` only. Checkout
(`lib/checkout.ts`) reserves an original for a 35-min DB hold and opens a Stripe session that expires
~31 min out; on Stripe failure it releases the hold. Do inventory transitions through these RPCs, not
ad-hoc `update`s.

**Stripe webhook (`app/api/webhooks/stripe/route.ts` → `lib/stripe-events.ts`).** Verifies the
signature, dedupes by event id (in-memory), and handles `checkout.session.completed` (idempotent order
upsert on `stripe_checkout_session_id`, then `mark_sold`/`decrement_edition`, then Resend
confirmation) and `checkout.session.expired` (releases the hold). `runtime = "nodejs"`,
`dynamic = "force-dynamic"`.

**Admin auth (`lib/actions/auth.ts`).** Supabase magic-link only. `requireAdmin()` checks the session
user's email against `ADMIN_EMAILS` (`isAdminEmail` in `lib/utils.ts`) and returns a service-role
`admin` client. The `(dash)` layout is `force-dynamic` and redirects `AuthError` → `/admin/login`.

**Analytics/email are opt-in.** PostHog stays off unless `NEXT_PUBLIC_POSTHOG_KEY` is set and the user
accepts the cookie banner (`components/cookie-consent.tsx`, `analytics-provider.tsx`, `lib/analytics.ts`).
Transactional email via Resend (`lib/resend.ts`, `lib/notify.ts`, `lib/email-templates.ts`).

**Data pages are `force-dynamic`** and fetch through `lib/catalog.ts` helpers — they need a live
Supabase, so `pnpm build` will fail rendering them without the `NEXT_PUBLIC_SUPABASE_*` env vars.

## Testing notes

Vitest runs in `jsdom`. `vitest.config.ts` aliases `server-only` → `test/server-only-stub.ts` so the
`"use server"` core functions (which transitively import `server-only`) remain unit-testable. Unit tests
target the pure cores + helpers; Playwright (`e2e/`) covers smoke flows. Env var reads use `!`
non-null assertions, so tests must not depend on real credentials.

## Environment

Required vars (`.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
`RESEND_FROM_EMAIL`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`. Optional: `NEXT_PUBLIC_POSTHOG_KEY`,
`NEXT_PUBLIC_POSTHOG_HOST`.

## Repo hygiene

`ikram-meme-and-co-phase1-complete/` and `ikram-meme-and-co-phase1-complete.zip` are cloud-build
checkpoint artifacts (a duplicate copy of the tree). **Ignore them — never edit code there;** the
source of truth is the repo root. They should be gitignored or removed.
