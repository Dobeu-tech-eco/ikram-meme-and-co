import { describe, expect, it } from "vitest";
import { isAllowedProductImageHost, isRemoteImageUrl, resolveProductImageUrl } from "./media";

describe("isAllowedProductImageHost", () => {
  it("allows Blob and Supabase hosts", () => {
    expect(isAllowedProductImageHost("abc.public.blob.vercel-storage.com")).toBe(true);
    expect(isAllowedProductImageHost("xyz.supabase.co")).toBe(true);
  });
  it("rejects other hosts", () => {
    expect(isAllowedProductImageHost("evil.example.com")).toBe(false);
  });
});

describe("isRemoteImageUrl", () => {
  it("accepts https CDN URLs", () => {
    expect(isRemoteImageUrl("https://example.public.blob.vercel-storage.com/a.jpg")).toBe(true);
  });
  it("rejects relative, http, and non-CDN hosts", () => {
    expect(isRemoteImageUrl("placeholder-1.jpg")).toBe(false);
    expect(isRemoteImageUrl("http://x.supabase.co/a.jpg")).toBe(false);
    expect(isRemoteImageUrl("https://cdn.example.com/art.webp")).toBe(false);
    expect(isRemoteImageUrl(null)).toBe(false);
  });
});

describe("resolveProductImageUrl", () => {
  it("returns first allowed absolute URL from array", () => {
    expect(
      resolveProductImageUrl([
        "placeholder.jpg",
        "https://cdn.example.com/art.webp",
        "https://proj.supabase.co/storage/v1/object/public/product-images/a.webp",
      ]),
    ).toBe("https://proj.supabase.co/storage/v1/object/public/product-images/a.webp");
  });
  it("returns null when no absolute URLs", () => {
    expect(resolveProductImageUrl(["placeholder-1.jpg"])).toBeNull();
    expect(resolveProductImageUrl([])).toBeNull();
    expect(resolveProductImageUrl(null)).toBeNull();
  });
  it("accepts a bare Blob URL string", () => {
    expect(resolveProductImageUrl("https://x.public.blob.vercel-storage.com/a.jpg")).toBe(
      "https://x.public.blob.vercel-storage.com/a.jpg",
    );
  });
});
