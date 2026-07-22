# Ikram & Co. (إكرام)

A bilingual (English / Arabic + RTL) e-commerce storefront for **original one-of-one artwork,
limited-edition sticker sheets & prints, and print-on-demand** pieces by Arab artists. Public
catalog + Stripe checkout + a service-role admin dashboard. Operated by Dobeu Tech Solutions LLC.

**Stack:** Next.js 16 (App Router) · React 19 · next-intl v4 · Supabase (Postgres + Auth + Storage) ·
Stripe · Resend · PostHog (consent-gated) · Tailwind v4 · Zod.

> ⚠️ This is **Next.js 16** — APIs/conventions can differ from older versions and from training data.
> See `AGENTS.md` and read the relevant guide in `node_modules/next/dist/docs/` before changing
> Next.js code. (Note: middleware lives in `proxy.ts`, not `middleware.ts` — see `docs/adr/ADR-003`.)

## Prerequisites

- **Node 24.x** (see `.nvmrc` / `package.json` engines)
- **pnpm 10.x** (`packageManager` is pinned)
- A local **Supabase** instance for development (Postgres + Auth + Storage)

## Setup

```bash
pnpm install
cp .env.example .env.local        # then fill in the values below
# start local Supabase (see docs/DEPLOYMENT.md for the full runbook)
pnpm db:types                     # regenerate lib/database.types.ts from local Supabase
pnpm dev
```

### Environment

Required (`.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
`RESEND_FROM_EMAIL`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`.
Optional: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.

> `pnpm build` renders `force-dynamic` catalog pages against a live Supabase, so it needs at least the
> `NEXT_PUBLIC_SUPABASE_*` vars set.

## Commands

```bash
pnpm dev            # dev server
pnpm build          # production build
pnpm verify         # type-check + lint + test:ci + build (run before committing)
pnpm type-check     # tsc --noEmit
pnpm lint           # eslint  (pnpm lint:fix to autofix)
pnpm test           # vitest (watch)   ·   pnpm test:ci = vitest run
pnpm test:e2e       # playwright smoke flows
pnpm db:types       # regenerate lib/database.types.ts
```

Run a single unit test: `pnpm test:ci lib/checkout.test.ts` (any path under `app|lib|components`).

## Architecture

See **`CLAUDE.md`** for the full picture and **`docs/adr/`** for the key decisions. In brief:

- **Routes** (`app/`): `app/[locale]/…` bilingual storefront · `app/admin/…` (non-localized, gated) ·
  `app/api/webhooks/stripe` · `app/auth/callback`. Locale routing runs in `proxy.ts` (Next 16).
- **Business logic** is written as pure `…Core(db, input)` functions against a loose `Db` structural
  type, wrapped by `"use server"` actions that call `requireAdmin()` — keeps cores unit-testable
  (`docs/adr/ADR-001`).
- **Inventory is DB-enforced**: `SECURITY DEFINER` RPCs (`reserve_original`, `mark_sold`, …) revoked
  from anon, granted to `service_role` only — never ad-hoc `update`s (`docs/adr/ADR-002`).
- **Two Supabase clients** (`lib/supabase/server.ts`): cookie-bound anon SSR vs. server-only
  service-role. RLS restricts anon to `artists` + non-draft `products`.

## Deployment

Full Supabase migration/seed + Vercel deploy runbook: **`docs/DEPLOYMENT.md`**.
