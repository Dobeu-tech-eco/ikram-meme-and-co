# Arab Stickers Co — Store Design Spec

Date: 2026-07-15 · Status: Approved (brainstorm session with Jeremy)
Companion docs: `2026-07-15-arab-stickers-gtm-brand.md` (GTM & brand workstream), `../plans/2026-07-15-arab-stickers-phase1.md` (Phase 1 implementation plan)

## 1. What this is

A curated bilingual (EN/AR) ecommerce store for **Arab Stickers Co**: authentic artwork by real Arab artists sold as (a) true 1-of-1 physical originals, (b) limited pre-printed editions, and (c) print-on-demand merch of the artwork. Single seller (the company), artists are paid outside the system in v1.

## 2. Decisions log

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Business model | Curated store (company lists & sells) | Multi-artist marketplace (Stripe Connect, 3-5x scope); hybrid deferred to later phase |
| Catalog | Mixed: `original` (qty 1) + `edition` (limited run, self-shipped) + `pod` (partner-fulfilled) | Originals-only; POD-only |
| Build pipeline | GitHub-first → Vercel from day 1, porting proven dobeu.net patterns | Replit-first build (migration tax: Replit DB/auth/hosting unwind) |
| Architecture | Custom Next.js 15 + Supabase + Stripe (Approach A) | Shopify headless (fees, offers don't fit); Medusa (needs long-running server) |
| i18n | Bilingual EN/AR from day 1, next-intl, RTL via logical properties | English-only; "Arabic accents" |
| v1 scope (phased) | Artist profiles, accounts, make-an-offer, email capture/drops, social/meme page | — |

## 3. Design language

- **Themes:** clean modern light + dark via `next-themes` (`attribute="class"`), soft corners (radius tokens, `--radius-xl` and up on cards/buttons).
- **Glassmorphism:** headers, sticky nav, and highlighted items use a `.glass` treatment — `backdrop-blur`, translucent surface via `color-mix`, 1px translucent border. Works in both themes.
- **Vibrant accents:** saturated accent palette (oklch-based) reserved for emphasis — CTAs, price tags, SOLD/drop badges — against calm neutral surfaces.
- **Immersive landing header:** full-viewport hero with layered gradient-mesh background, featured 1-of-1 artwork, glass nav overlay, bilingual headline. This is the brand's signature moment.
- **RTL-safe:** all spacing/positioning via Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).

## 4. Architecture

One Next.js 15 App Router repo on GitHub → Vercel. Three surfaces:

1. **Public storefront** — `/{en|ar}/…` (next-intl): home (immersive hero), shop, product detail, artist pages (available + sold archive), order success, meme/social page (Phase 3).
2. **Customer account** — `/{locale}/account/*` (Phase 2; v1 ships guest checkout only).
3. **Admin** — `/admin` (English-only), gated by Supabase Auth + `ADMIN_EMAILS` / `isAdminEmail()` (dobeu pattern). All admin reads via service-role client.

Supabase: Postgres + Auth + Storage (product/artist images). Stripe hosted Checkout; a signed webhook (`runtime="nodejs"`) is the only writer of payment state. Resend: transactional email + drop broadcasts (Audiences). Exactly one `next.config.ts` (never a `.js` twin — imported dobeu lesson).

## 5. Data model

Bilingual content = paired columns (`*_en` / `*_ar`), not a translations table. Prices are integer cents, USD.

- `artists` — slug, name/bio (en/ar), photo_url, instagram.
- `products` — artist_id, slug, title/description (en/ar), price_cents, currency, `fulfillment_type` enum (`original|edition|pod`), `status` enum (`draft|available|reserved|sold|archived`), quantity (originals hard-capped at 1), reserved_until, images jsonb.
- `orders` — guest-friendly (email required), stripe_checkout_session_id (unique — idempotency key), payment_intent, amount, shipping json, tracking, `status` enum (`pending|paid|failed|refunded|fulfilled`), locale.
- `order_items` — order_id, product_id, title snapshot, price_cents, quantity.
- `offers` (Phase 2) — product_id, email, amount_cents, status (`pending|accepted|declined|expired`), expires_at.
- `subscribers` — email unique, locale; mirrored to Resend Audience.
- Variants (sizes) deferred to Phase 2 with POD.

**RLS everywhere.** Anon can read artists and non-draft products only. Orders/subscribers: service-role only.

### The 1-of-1 race guard

Buy click → SQL function `reserve_original(id)`: atomic `UPDATE … SET status='reserved', reserved_until=… WHERE id=$1 AND status='available'` → returns `found`. Zero rows = "just sold." Stripe Checkout session created with ~31-min `expires_at`; `checkout.session.completed` → `mark_sold()`, `checkout.session.expired` → `release_original()`. Stripe's expiry webhook is the hold timer — no cron. Editions decrement via `decrement_edition()` (atomic `quantity = quantity - 1 WHERE quantity > 0`).

## 6. Commerce flows

- **Buy original:** PDP → Buy Now (server action) → reserve → Stripe Checkout (shipping address collection on) → webhook `completed` → order row upserted on session id, product sold, confirmation email (buyer, in their locale) + admin notification → admin marks fulfilled with tracking.
- **Edition:** same, but quantity check at checkout creation + atomic decrement at webhook; status flips to sold at quantity 0.
- **POD (Phase 2):** paid webhook → push to Printful API → tracking webhook → customer email.
- **Make-an-offer (Phase 2):** offer form on original PDPs → admin accept/decline → accept reserves piece + emails buyer a private Checkout link (48h expiry).
- **Drops:** products carry publish-at; announcement broadcast via Resend to subscribers; scarcity mechanics per GTM doc.

## 7. Analytics, data capture & personalization

- **Consent-gated fan-out** (dobeu pattern): cookie-consent banner; `initAnalytics(consent)` no-ops until accepted. Phase 1 providers: PostHog (feature-flagged by env presence), GA4 optional.
- **Events:** `product_view`, `buy_click`, `sold_out_hit`, `checkout_started`, `email_subscribed`; `purchase` captured server-side in the Stripe webhook (survives ad-blockers).
- **Capture surfaces:** footer + hero email signup, post-purchase list opt-in, sold-out page "notify me about the next drop", (Phase 2) wishlist requiring email, exit-intent drop reminder.
- **Personalization (Phase 2):** recently-viewed rail, preferred locale/theme persistence, PostHog cohorts → Customer.io segments for drop targeting. All personalization storage sits behind consent.

## 8. Phasing

- **Phase 1 (this plan): sellable store.** Bilingual storefront + themes/glass design system, immersive hero, catalog, originals + editions purchase with race guard, Stripe webhook, admin CRUD + order fulfillment, order emails, artist pages, email capture, consent-gated analytics, deployed on Vercel.
- **Phase 2:** customer accounts + order history, make-an-offer, POD (Printful) + variants, personalization rails, Customer.io deep segmentation.
- **Phase 3:** meme/social page, drop scheduler + countdowns, offer automation polish, AJO journey orchestration if warranted.

## 9. Tooling (verified via Composio, 2026-07-15)

ACTIVE and usable in automation: Instagram publishing, Canva (create/export), Figma, SendGrid, Gmail, Firecrawl. Not connected: Reddit, TikTok posting → Reddit remains deliberate manual engagement (per GTM doc §4). Store email stays on Resend; marketing automation on Customer.io (native MCP connected).

## 10. Environment variables (Phase 1)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_KEY` (optional), `NEXT_PUBLIC_POSTHOG_HOST` (optional).
