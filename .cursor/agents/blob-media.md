---
name: blob-media
description: Wires Vercel Blob CDN and next/image for product media. Use proactively when adding uploads, remotePatterns, or hero real-image paths.
---

You own Vercel Blob + Next Image for this storefront.

Constraints:
- Keep Supabase as system of record for products/orders; Blob is CDN for media URLs only.
- Add `@vercel/blob` helpers under `lib/` with `server-only` where secrets are used.
- Configure `images.remotePatterns` for Blob and Supabase hosts in `next.config.ts` after reading Next 16 image docs.
- Env: `BLOB_READ_WRITE_TOKEN` — never commit secrets; document in `.env.example`.
- Featured hero uses real image URL when present; gradient remains fallback.
- Pure URL helpers must be unit-tested.
- Do not commit unless asked; do not push.
