# Glass Brand, A11y UI, Partner + Forecast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the chat workstream: glass header/logo/scroll atmosphere with hooks, gallery-press visual system (not cream/terracotta), accessible spacing/focus, matching icons, plus partner-terms and drop-forecast commercial docs.

**Architecture:** Client hooks (`useScrolled`, `useScrollCssVars`) drive header condensation and CSS `--scroll-y` parallax. Design tokens in `app/globals.css` define a cool gallery wall + saffron/verdigris palette; BrandLogo + `app/icon.svg` / `apple-icon` share diamond-mark geometry. Commercial artifacts live under `docs/commercial/` and reference GTM KPIs without inventing signed contracts.

**Tech Stack:** Next.js 16 App Router, React 19, next-intl, Tailwind v4 CSS variables, Vitest, pnpm.

## Global Constraints

- Package manager: `pnpm` (on this machine prefer `& "$env:USERPROFILE\.local\bin\pnpm.ps1"` or `node_modules/.bin/*`).
- Locales: `en` / `ar` with RTL via `localeDir`; never hardcode customer-facing UI copy — use `messages/{en,ar}.json`.
- Do **not** use Anthropic cream `#faf9f5` + terracotta `#d97757` as the site identity (frontend-design rejects that AI default). Use gallery-press tokens below.
- Respect `prefers-reduced-motion: reduce` for atmosphere, header transitions, spatial stage.
- Touch targets ≥ `--touch` (2.75rem) for header interactive controls; visible `:focus-visible` rings using `--focus-ring`.
- No secrets in commits; no force-push; commit per task as specified.
- Partner/forecast docs are hypotheses/templates — never fabricate signed MSAs or live GMV.
- Ignore `ikram-meme-and-co-phase1-complete/` checkpoint trees.
- Branch: `feat/immersive-landing-dobeu-store` (already exists; do not create a new branch unless blocked).

### Locked gallery-press tokens (verbatim)

| Token | Light | Dark |
|---|---|---|
| `--color-surface` | `#f3f5f7` | `#0e1520` |
| `--color-surface-2` | `#e4e8ed` | `#162033` |
| `--color-fg` | `#151a22` | `#e8e4d9` |
| `--color-accent` (saffron) | `#c9922a` | `#e0b04a` |
| `--color-accent-2` (verdigris) | `#2f7a6b` | `#4aa894` |
| `--color-accent-3` (madder) | `#b54a5e` | `#d47284` |
| `--color-muted` | `#5c6570` | `#9aa3ad` |

Icon mark gradient: `#c9922a` → `#2f7a6b` on `#151a22`.

### Chat inventory → tasks

| Chat item | Task |
|---|---|
| Wire `useScrolled`; extract scroll CSS hook | 1 |
| Gallery tokens + quieter glass + spacing scale | 2 |
| Icons + BrandLogo fallbacks match tokens | 3 |
| Header a11y, skip link, theme toggle | 4 |
| Artist partner terms + forecast sheet | 5 |
| Verify suite + ledger closeout | 6 |

---

## File map

| File | Responsibility |
|---|---|
| `lib/hooks/use-scrolled.ts` | Existing — boolean scroll past threshold |
| `lib/hooks/use-scroll-css-vars.ts` | Sets `--scroll-y` / `--scroll-px` on `:root` |
| `lib/hooks/use-scrolled.test.ts` | Unit tests for scrolled snapshot logic |
| `lib/hooks/use-scroll-css-vars.test.ts` | Unit tests for progress clamp math (pure helper) |
| `components/site-header.tsx` | Use `useScrolled`; a11y nav |
| `components/scroll-atmosphere.tsx` | Use `useScrollCssVars` |
| `components/brand-logo.tsx` | Mark + wordmark; token fallbacks |
| `components/skip-link.tsx` | Skip to `#main-content` |
| `components/theme-toggle.tsx` | Text Light/Dark (no emoji) |
| `app/globals.css` | Tokens, spacing, glass, focus, header |
| `app/icon.svg`, `app/apple-icon.tsx`, `public/brand-mark.svg` | Favicons |
| `app/[locale]/layout.tsx` | Skip link + shell |
| `messages/en.json`, `messages/ar.json` | `a11y.skipToContent`, `a11y.primaryNav` |
| `docs/commercial/artist-partner-terms.md` | Split bands by fulfillment type |
| `docs/commercial/drop-forecast-sheet.md` | D30/D90 forecast framing |

---

### Task 1: Scroll hooks + wire header/atmosphere

**Files:**
- Create: `lib/hooks/use-scroll-css-vars.ts`
- Create: `lib/hooks/scroll-progress.ts` (pure `clampScrollProgress(scrollY, maxScroll): number`)
- Create: `lib/hooks/use-scrolled.test.ts`
- Create: `lib/hooks/use-scroll-css-vars.test.ts` (test pure helper)
- Modify: `components/site-header.tsx` — replace inline `useSyncExternalStore` with `useScrolled`
- Modify: `components/scroll-atmosphere.tsx` — call `useScrollCssVars()` instead of inline effect

**Interfaces:**
- Consumes: existing `useScrolled(threshold?: number): boolean` from `lib/hooks/use-scrolled.ts`
- Produces: `clampScrollProgress(scrollY: number, maxScroll: number): number`; `useScrollCssVars(): void`

- [ ] **Step 1: Write failing tests for clamp + scrolled threshold**

```ts
// lib/hooks/use-scroll-css-vars.test.ts
import { describe, expect, it } from "vitest";
import { clampScrollProgress } from "./scroll-progress";

describe("clampScrollProgress", () => {
  it("returns 0 at top", () => {
    expect(clampScrollProgress(0, 1000)).toBe(0);
  });
  it("returns 1 at/beyond bottom", () => {
    expect(clampScrollProgress(1000, 1000)).toBe(1);
    expect(clampScrollProgress(2000, 1000)).toBe(1);
  });
  it("clamps mid-page", () => {
    expect(clampScrollProgress(250, 1000)).toBe(0.25);
  });
  it("treats non-positive max as 1 denominator", () => {
    expect(clampScrollProgress(0, 0)).toBe(0);
  });
});
```

```ts
// lib/hooks/use-scrolled.test.ts
import { describe, expect, it, vi, afterEach } from "vitest";

// Test the snapshot helper by exporting getScrolledSnapshot from use-scrolled.ts
// OR duplicate threshold logic in a tiny pure export `isScrolled(scrollY, threshold)`.
import { isScrolled } from "./use-scrolled";

describe("isScrolled", () => {
  it("false at or below threshold", () => {
    expect(isScrolled(24, 24)).toBe(false);
    expect(isScrolled(0, 24)).toBe(false);
  });
  it("true above threshold", () => {
    expect(isScrolled(25, 24)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test:ci lib/hooks/use-scroll-css-vars.test.ts lib/hooks/use-scrolled.test.ts`  
Expected: FAIL (modules/exports missing)

- [ ] **Step 3: Implement pure helpers + hooks**

```ts
// lib/hooks/scroll-progress.ts
export function clampScrollProgress(scrollY: number, maxScroll: number): number {
  const max = Math.max(1, maxScroll);
  return Math.min(1, Math.max(0, scrollY / max));
}
```

Export `isScrolled(scrollY, threshold)` from `use-scrolled.ts` and use it inside the snapshot. Implement `useScrollCssVars` with rAF-throttled scroll/resize writing `--scroll-y` (4 decimals) and `--scroll-px`.

- [ ] **Step 4: Wire components**

`SiteHeader`: `const scrolled = useScrolled();`  
`ScrollAtmosphere`: call `useScrollCssVars()` at top of component; keep JSX layers.

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test:ci lib/hooks/use-scroll-css-vars.test.ts lib/hooks/use-scrolled.test.ts`

- [ ] **Step 6: Commit**

```bash
git add lib/hooks/components/site-header.tsx components/scroll-atmosphere.tsx
git commit -m "refactor(ui): extract scroll hooks for header and atmosphere"
```

---

### Task 2: Gallery-press tokens, spacing, quieter glass

**Files:**
- Modify: `app/globals.css` — replace `:root` / `.dark` tokens with locked table; add spacing scale; tighten glass-nav; improve muted contrast; add focus utilities; registration-mark accents optional on `.site-header`

**Interfaces:**
- Consumes: locked token table from Global Constraints
- Produces: CSS variables `--space-1`…`--space-8`, `--touch`, `--focus-ring`, `--header-offset`

- [ ] **Step 1: Replace palette block in `:root` and `.dark`** with locked hex values exactly.

- [ ] **Step 2: Add spacing + a11y tokens**

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.5rem;
--space-6: 2rem;
--space-7: 3rem;
--space-8: 4.5rem;
--touch: 2.75rem;
--header-offset: 5.5rem;
--focus-ring: 2px solid var(--color-accent-2);
--focus-offset: 3px;
```

Lower mesh/grain opacities for readability: light `--mesh-a-opacity: 0.28`, `--mesh-b-opacity: 0.22`, `--grain-opacity: 0.18`.

- [ ] **Step 3: Quieter glass-nav + header focus** (from [accessible UI research](f51049a0-9da5-4253-ad21-6129fe1ec5e5))

- Header fill ~75–85% opaque; `backdrop-filter` blur ≤16px (opacity = WCAG lever; blur = chrome only)
- Ensure `.site-header__link`, `.site-header__chip` have `min-height: var(--touch)` and `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-offset); }`
- Add `.skip-link` styles (visually hidden until focus)
- `@media (prefers-reduced-transparency: reduce)` → solid header background, no `backdrop-filter`
- `html { scroll-padding-top: var(--header-offset); }` so sticky chrome does not fully obscure focused targets (WCAG 2.4.11)

- [ ] **Step 4: Spot-check** — search `globals.css` for `#faf9f5`, `#d97757`, `#141413` (Anthropic leftovers); remove from site tokens (icons updated in Task 3).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "style(ui): gallery-press tokens, spacing scale, quieter glass"
```

---

### Task 3: Icons + BrandLogo match gallery mark

**Files:**
- Modify: `app/icon.svg`
- Modify: `app/apple-icon.tsx`
- Modify: `public/brand-mark.svg`
- Modify: `components/brand-logo.tsx` — fallbacks `#c9922a` / `#2f7a6b` / `#f3f5f7`

- [ ] **Step 1: Update all three icon assets** — diamond paths unchanged; gradient stops `#c9922a` → `#2f7a6b`; background `#151a22`.

- [ ] **Step 2: BrandLogo stopColor fallbacks** match tokens.

- [ ] **Step 3: Commit**

```bash
git add app/icon.svg app/apple-icon.tsx public/brand-mark.svg components/brand-logo.tsx
git commit -m "feat(brand): sync favicon and logo mark to gallery-press accents"
```

---

### Task 4: Skip link, i18n a11y strings, theme toggle

**Files:**
- Create: `components/skip-link.tsx`
- Modify: `app/[locale]/layout.tsx` — `<SkipLink />` first inside body shell; wrap `{children}` in `<main id="main-content">` OR add `id="main-content"` on a wrapper
- Modify: `messages/en.json`, `messages/ar.json` — add `a11y` namespace
- Modify: `components/theme-toggle.tsx` — show `Light` / `Dark` text (or SVG), `min-height: var(--touch)`, focus-visible
- Modify: `components/site-header.tsx` — `aria-label={tA11y("primaryNav")}` via `useTranslations("a11y")`

**Interfaces:**
- Produces: `SkipLink` client or server component linking to `#main-content`

- [ ] **Step 1: Add messages**

```json
"a11y": {
  "skipToContent": "Skip to content",
  "primaryNav": "Primary"
}
```

Arabic:

```json
"a11y": {
  "skipToContent": "تخطّ إلى المحتوى",
  "primaryNav": "التنقل الرئيسي"
}
```

- [ ] **Step 2: Implement SkipLink + layout main landmark**

```tsx
// components/skip-link.tsx
import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("a11y");
  return (
    <a href="#main-content" className="skip-link">
      {t("skipToContent")}
    </a>
  );
}
```

(`"use client"` if required by `useTranslations` usage pattern in this repo — match `SiteFooter`.)

Wrap children:

```tsx
<main id="main-content">{children}</main>
```

- [ ] **Step 3: Theme toggle** — no emoji; `aria-label` stays; visible label Light/Dark based on target theme.

- [ ] **Step 4: Commit**

```bash
git add components/skip-link.tsx components/theme-toggle.tsx components/site-header.tsx app/[locale]/layout.tsx messages/en.json messages/ar.json
git commit -m "feat(a11y): skip link, nav labels, accessible theme toggle"
```

---

### Task 5: Partner terms + drop forecast docs

**Files:**
- Create: `docs/commercial/artist-partner-terms.md`
- Create: `docs/commercial/drop-forecast-sheet.md`

**Content requirements (verbatim bands from commercial handoff):**

Artist splits (recommended defaults, owner-confirmable):
- Originals: 50–70% artist net after payment fees
- Editions: 30–50%
- POD: artist design fee **or** % of contribution margin after Printful + ship + return + Stripe

Forecast sheet must cite GTM table:
- List D30=500 / D90=2,500
- Sell-through 72h D30=70% / D90=90%
- CAC Reddit ≤$8, paid ≤$15, organic ≤$5 (D90)
- Repeat 15% by D90
- Explicit placeholders: session→checkout 1.5–3%, checkout→paid 40–60% until PostHog proves otherwise
- Label illustrative GMV as non-commitment
- Grill note: refuse 80% POD artist share if Printful+Stripe consume ~40–55% without raising list or cutting SKU

- [ ] **Step 1: Write both markdown files** with status `Draft — not a signed agreement` / `Planning model — not a board target`.

- [ ] **Step 2: Commit**

```bash
git add docs/commercial/artist-partner-terms.md docs/commercial/drop-forecast-sheet.md
git commit -m "docs(commercial): artist partner terms draft and drop forecast sheet"
```

---

### Task 6: Verify + progress ledger

**Files:**
- Modify: `.superpowers/sdd/progress.md` — append this plan’s task lines

- [ ] **Step 1: Run** `pnpm type-check`

- [ ] **Step 2: Run** `pnpm test:ci`

- [ ] **Step 3: Run** `pnpm lint` (fix any errors introduced by this plan only)

- [ ] **Step 4: Update ledger** with Tasks 1–6 complete SHAs

- [ ] **Step 5: Final commit if ledger/docs dirty**

```bash
git add .superpowers/sdd/progress.md
git commit -m "chore: record glass-brand-a11y-partner-forecast SDD progress"
```

---

## Self-review

1. **Spec coverage:** Glass logo/header/atmosphere ✅; gallery redesign/a11y ✅; icons ✅; partner+forecast ✅; hooks/patterns ✅. Adversarial-review / cs-research are read-only — not implementation tasks. Push/PR and Blob token remain residual (out of scope unless owner asks).
2. **Placeholders:** None intentional; GMV numbers labeled illustrative.
3. **Types:** `clampScrollProgress`, `isScrolled`, `useScrolled`, `useScrollCssVars` consistent across tasks 1↔4.

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-15-glass-brand-a11y-partner-forecast.md`.

**Execution:** Subagent-Driven Development (this session), falling through to inline executing-plans only if subagent dispatch fails.
