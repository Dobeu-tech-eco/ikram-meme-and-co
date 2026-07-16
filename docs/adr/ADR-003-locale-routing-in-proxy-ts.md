# ADR-003: Locale routing in `proxy.ts` with an `api|admin|auth` exclusion matcher

- **Status:** Accepted
- **Date:** 2026-07-16

## Context

The app has three top-level route trees: the bilingual public storefront
(`app/[locale]/…`), the non-localized admin dashboard (`app/admin/…`), and
non-localized API/auth routes (`app/api/…`, `app/auth/callback`). next-intl's
middleware rewrites requests to inject the active locale — but that rewriting must
**not** touch admin, API, or auth routes, which have no locale segment.

Next.js 16 renamed the middleware entrypoint from `middleware.ts` to **`proxy.ts`**
(the exported function is `proxy`, not `middleware`). This differs from most training
data and from older Next.js projects.

## Decision

Run next-intl locale routing from `proxy.ts` at the repo root:

```ts
// proxy.ts
const handleI18nRouting = createMiddleware(routing);
export function proxy(request) { return handleI18nRouting(request); }
export const config = {
  matcher: ["/((?!api|admin|auth|_next|_vercel|.*\\..*).*)"],
};
```

The matcher excludes `api`, `admin`, `auth`, `_next`, `_vercel`, and any path with a
file extension, so only storefront routes get locale rewriting.

## Consequences

- Admin, API, and auth routes bypass locale handling entirely — no `[locale]`
  segment leaks into them.
- This is Next.js 16-specific: edits to routing/middleware go in `proxy.ts`, not
  `middleware.ts`. Per `AGENTS.md`, verify Next 16 conventions in
  `node_modules/next/dist/docs/` before changing routing behavior.
- Adding a new non-localized top-level route tree means updating the matcher's
  exclusion list here.
