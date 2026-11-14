/** Pure helpers for product media URLs (Blob or Supabase Storage). */

export function isAllowedProductImageHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h.endsWith(".public.blob.vercel-storage.com")) return true;
  if (h === "public.blob.vercel-storage.com") return true;
  if (h.endsWith(".supabase.co")) return true;
  return false;
}

export function isRemoteImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 8) return false;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    return isAllowedProductImageHost(u.hostname);
  } catch {
    return false;
  }
}

/** First absolute https CDN URL from a products.images jsonb value, else null. */
export function resolveProductImageUrl(images: unknown): string | null {
  if (images == null) return null;
  if (isRemoteImageUrl(images)) return images;
  if (!Array.isArray(images)) return null;
  for (const item of images) {
    if (isRemoteImageUrl(item)) return item;
  }
  return null;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
