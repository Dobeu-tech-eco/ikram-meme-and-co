---
title: Immersive Landing - Plan
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
date: 2026-07-15
---

# Immersive Landing - Plan

## Goal Capsule

Ship an immersive spatial homepage on https://dobeu.store: distinct light/dark atmospheres, scroll-scrubbed POV stage, Vercel Blob + next/image for real product art, Supabase unchanged as SOR.

## Verification Contract

- `pnpm test:ci` covers pure media/URL helpers and reduced-motion helper
- `pnpm verify` passes
- Manual/browser: `/en`, `/ar`, theme toggle, reduced-motion, hero CTAs
- Preview then `vercel --prod`; confirm dobeu.store

## Definition of Done

All U1–U5 merged on feature branch; gates in Phase 4 green; production URL https://dobeu.store.

## Product Contract (summary)

See requirements-only sibling decisions R1–R8 in prior brainstorm: brand-led spatial stage, reduced-motion fallback, Blob CDN, Supabase SOR, dobeu.store.

## Implementation Units

### U1. Theme + design tokens

**Goal:** Distinct light/dark atmosphere via CSS variables; shop inherits automatically.

**Files:** Modify `app/globals.css`

**Approach:** Add atmosphere tokens (`--mesh-a-opacity`, `--mesh-b-opacity`, `--grain-opacity`, `--stage-vignette`); tune `.mesh-a`/`.mesh-b`/`.grain` and dark overrides; add spatial-stage CSS utilities (perspective layers, scroll-timeline scrub) with reduced-motion kill switch.

**Verification:** Visual token differences in light vs dark; no purple/cream clichés; RTL font rules unchanged.

### U2. Vercel Blob + next/image

**Goal:** Media CDN path + optimized images.

**Files:** Create `lib/media.ts`, `lib/media.test.ts`, `lib/blob.ts` (server-only put helper); Modify `next.config.ts`, `.env.example`; optional admin note later.

**Approach:** `resolveProductImageUrl(images)` returns first absolute http(s) URL or null; `isRemoteImageUrl`; configure `images.remotePatterns` for `*.public.blob.vercel-storage.com`, `*.supabase.co`; document `BLOB_READ_WRITE_TOKEN`.

**Verification:** Unit tests for URL resolution; build accepts Image with remote URLs.

### U3. Immersive spatial stage

**Goal:** Replace hero with scroll-scrubbed spatial stage.

**Files:** Create `components/landing/spatial-stage.tsx`; Modify `components/landing/hero.tsx` (re-export or thin wrapper), `app/[locale]/page.tsx`, `messages/en.json`, `messages/ar.json`

**Approach:** Client stage with sticky full-viewport layers, CSS scroll-driven transform on depth layers + pointer parallax (disabled under reduced-motion). Full-bleed featured image via `next/image` when URL resolves. Brand “Ikram & Co.” / ghost IKRAM, one H1, subtitle, CTAs. Marquee retained below stage or as depth layer.

**Execution note:** Prefer CSS scroll-driven first; no Framer unless required.

**Verification:** Reduced-motion static; EN/AR; featured image vs gradient fallback.

### U4. Vercel production hardening

**Goal:** Site URL + deploy docs + Blob env documented.

**Files:** Modify `docs/DEPLOYMENT.md`, `.env.example`; optional lean `vercel.json` security headers only if justified.

**Approach:** Document `NEXT_PUBLIC_SITE_URL=https://dobeu.store` and Blob token steps; preview then prod via CLI.

**Verification:** Docs accurate; env example complete.

### U5. Tests + verify

**Goal:** Helpers covered; suite green.

**Files:** `lib/media.test.ts`, `lib/reduced-motion.test.ts` if helper extracted; run `pnpm verify`.

**Verification:** `pnpm verify` exit 0.
