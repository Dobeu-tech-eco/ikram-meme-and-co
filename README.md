# ikram-meme-and-co — Ikram & Co. gallery store (dobeu.store)

Production: https://dobeu.store · Vercel: `ikram-meme-and-co` (team dobeutechnology) · Status: active

## What it does

Bilingual (EN/AR) art-gallery storefront selling originals, editions, and print-on-demand merchandise for Ikram & Co. Customers browse the artwork-first catalog, check out via Stripe, and receive transactional email via Resend. Includes admin surfaces gated by `ADMIN_EMAILS` and legal/info pages in both languages.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Supabase (`@supabase/ssr`) for data + auth · Stripe Checkout + webhooks · Resend · next-intl (EN/AR) · Tailwind 4 · PostHog · Vitest + Playwright · pnpm 10 / Node 24.

## Getting started

```bash
pnpm install
cp .env.example .env.local      # fill in Supabase/Stripe/Resend values
pnpm dev                        # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev / production build / serve |
| `pnpm verify` | type-check + lint + unit tests + build (CI gate) |
| `pnpm test` / `pnpm test:e2e` | Vitest / Playwright |
| `pnpm verify:deploy` | post-deploy smoke check |
| `pnpm db:types` | regenerate `lib/database.types.ts` from local Supabase |

## Deployment

Push → Vercel preview; promote to production (promote-over-redeploy convention, see `docs/`). Env vars live in Vercel project settings — keep `.env.example` in sync the day a new var is read. Rollback: Vercel → previous READY production deployment → Promote.

## Analytics

PostHog is live today. Amplitude rubric verdict per `../_standards/amplitude-instrumentation-policy.md`: **INSTALL** (e-commerce funnel + Session Replay) — pending an explicit decision to run Amplitude alongside or instead of PostHog. Don't add a second analytics SDK without recording that decision here.

## Documentation

`docs/` — deploy/perf hygiene plans and design notes. SECURITY: dependabot SLA 7 days; dependency audit 2026-07-23 found 6 high (fixed by Next 16.2.11 bump + sharp/postcss patches).
