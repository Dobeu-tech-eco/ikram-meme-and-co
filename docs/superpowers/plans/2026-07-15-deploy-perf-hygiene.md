# Deploy Performance Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the agreed P0→P1→P2 deploy/runtime hygiene from the Vercel performance analysis without chasing already-fast (~21s) builds.

**Architecture:** Pin toolchain versions for reproducible installs; remove unused/heavy install weight; split CI so GitHub verifies without duplicating Vercel’s `next build`; make static legal/info pages CDN-friendly while keeping shop/checkout/admin/webhook dynamic.

**Tech Stack:** Next.js 16 App Router, pnpm, GitHub Actions, Vercel.

## Global Constraints

- Package manager: pnpm (pin via `packageManager`; CI uses pnpm 10).
- Node: pin to **24.x** (matches Vercel project + local runtime); update `.nvmrc` accordingly.
- Do **not** add a custom `vercel build --prebuilt` CI pipeline.
- Do **not** remove `force-dynamic` from shop, product, artists, home, admin, webhook, order/success, or auth/callback.
- Do **not** enable `cacheComponents` / aggressive inventory CDN caching.
- Ignore `ikram-meme-and-co-phase1-complete/` checkpoint trees.
- Branch: `chore/deploy-perf-hygiene` from `origin/master` (clean PR).

## File map

| File | Responsibility |
|------|----------------|
| `package.json` | engines, packageManager, deps, scripts |
| `.nvmrc` | Node major for CI/local |
| `pnpm-lock.yaml` | Lockfile after dep removals |
| `.github/workflows/ci.yml` | PR verify without next build |
| `.vercelignore` | Exclude docs/e2e from upload |
| `app/[locale]/{about,contact,faq,tos,privacy,cookies,refunds,shipping}/page.tsx` | force-static legal/info |
| `docs/DEPLOYMENT.md` | Promote-over-redeploy + Node pin notes |

---

### Task 1: P0 — Toolchain pin + remove unused toolbar

**Files:** Modify `package.json`, `.nvmrc`; update lockfile; remove `@vercel/toolbar`.

- [ ] **Step 1:** Set `"engines": { "node": "24.x" }`, `"packageManager": "pnpm@10.28.0"`, write `.nvmrc` as `24`.
- [ ] **Step 2:** Remove `@vercel/toolbar` from dependencies (unused; zero imports).
- [ ] **Step 3:** Change `db:types` to `pnpm dlx supabase@2.109.1 gen types typescript --local > lib/database.types.ts` and remove `supabase` from `devDependencies`.
- [ ] **Step 4:** Run `pnpm install` to refresh lockfile.
- [ ] **Step 5:** Commit `chore(deps): pin node 24 + pnpm; drop unused toolbar and supabase CLI`.

**Verification:** `rg "@vercel/toolbar" package.json` empty; `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')).engines.node==='24.x'"`; lockfile updates.

---

### Task 2: P1 — Split CI + `.vercelignore`

**Files:** Modify `.github/workflows/ci.yml`; create `.vercelignore`; touch `docs/DEPLOYMENT.md` CI note.

- [ ] **Step 1:** Change CI to run `pnpm type-check`, `pnpm lint`, `pnpm test:ci` (not `pnpm verify` / no build). Keep `pnpm verify` for local/pre-release.
- [ ] **Step 2:** Add `.vercelignore` with `e2e/`, `docs/`, `*.md` (except do not break needed config — prefer `docs/`, `e2e/`, `.superpowers/`).
- [ ] **Step 3:** Document in `docs/DEPLOYMENT.md`: CI is verify-without-build; Vercel owns production build; prefer `vercel promote` after preview smoke.
- [ ] **Step 4:** Commit `ci: drop next build from PR verify; add vercelignore`.

**Verification:** CI yaml has no `pnpm verify`; `.vercelignore` exists.

---

### Task 3: P2 — Static legal/info pages

**Files:** Modify legal/info `page.tsx` files under `app/[locale]/`.

- [ ] **Step 1:** Add `export const dynamic = "force-static";` to: about, contact, faq, tos, privacy, cookies, refunds, shipping.
- [ ] **Step 2:** Confirm shop/product/artists/home/admin/webhook still `force-dynamic`.
- [ ] **Step 3:** Commit `perf: force-static bilingual legal and info pages`.

**Verification:** `pnpm type-check`; optional `pnpm build` route table shows ○ for those pages when env allows.

---

### Task 4: Verify + finish

- [ ] **Step 1:** `pnpm type-check && pnpm lint && pnpm test:ci`
- [ ] **Step 2:** Use finishing-a-development-branch (options: PR / merge / keep).
