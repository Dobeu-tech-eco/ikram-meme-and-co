---
title: Immersive Landing - Plan
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: ce-brainstorm
execution: code
date: 2026-07-15
---

# Immersive Landing - Plan

## Goal Capsule

**Objective:** Replace the homepage first viewport with a brand-led spatial stage that uses scroll/pointer depth, distinct light/dark atmospheres, and real product imagery via Vercel Blob when available — shipped on https://dobeu.store without migrating off Supabase.

**Product authority:** Locked sign-off plan (domain dobeu.store; Supabase SOR + Blob CDN; homepage + shared tokens only).

**Open blockers:** None for product scope. Blob token must be provisioned in Vercel before prod media uploads.

## Product Contract

### Primary actor

Shoppers on the bilingual storefront (`en` / `ar`), including RTL Arabic readers and users who prefer reduced motion or system theme.

### Outcome

First viewport feels like entering a spatial gallery (Ikram & Co.), not a generic marketing scroll — then settles into the existing “New this drop” grid.

### Requirements

- **R1.** First viewport is one composition: brand-level signal, one headline, one support sentence, one CTA group, one dominant full-bleed visual plane.
- **R2.** Spatial POV: layered parallax / scroll-scrubbed depth with 2–3 intentional motions; sticky stage then continues to catalog section.
- **R3.** `prefers-reduced-motion: reduce` disables scrub/parallax and shows a static brand-led hero.
- **R4.** Light and dark themes each feel intentional (distinct atmosphere), sharing the same token system across shop/product.
- **R5.** Featured product shows a real image URL when present (Blob or Supabase Storage); gradient fallback otherwise.
- **R6.** All hero/home copy remains in `messages/en.json` and `messages/ar.json`; RTL layout remains correct.
- **R7.** Supabase remains system of record for catalog, auth, inventory, checkout; Vercel Blob is media CDN only.
- **R8.** Production site URL remains https://dobeu.store.

### Scope Boundaries (non-goals)

- Full shop/product/about redesign beyond shared tokens
- Migrating Postgres/Auth/orders off Supabase
- dobeu.shop DNS
- Checkout/Stripe/webhook changes

### Success criteria

- EN + AR homepage pass visual/a11y smoke; theme toggle works; reduced-motion static path works
- `pnpm verify` green; preview then production on dobeu.store
- Featured image path works when URL is absolute http(s)

### Outstanding Questions

None — decisions locked in sign-off plan.
