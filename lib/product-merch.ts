/** Fulfillment types from the catalog enum. */
export type FulfillmentType = "original" | "edition" | "pod";

export const FULFILLMENT_TYPES: readonly FulfillmentType[] = [
  "original",
  "edition",
  "pod",
] as const;

export function isFulfillmentType(value: string): value is FulfillmentType {
  return (FULFILLMENT_TYPES as readonly string[]).includes(value);
}

export type MerchProduct = {
  fulfillment_type: string;
  status: string;
  quantity: number;
  images: unknown;
};

/** Sold when status is sold, or an edition/pod with no remaining quantity. */
export function isProductSold(p: MerchProduct): boolean {
  if (p.status === "sold") return true;
  if (p.fulfillment_type === "original") return false;
  return p.quantity < 1;
}

export function isProductBuyable(p: MerchProduct): boolean {
  if (isProductSold(p)) return false;
  if (p.status === "available") return true;
  if (p.fulfillment_type === "edition" || p.fulfillment_type === "pod") {
    return p.quantity > 0;
  }
  return false;
}

/**
 * First usable image URL from product.images JSON.
 * Only http(s) absolute URLs or root-relative paths are accepted (XSS-safe).
 * Bare filenames (seed placeholders) return null → refined empty frame.
 */
export function getProductImageUrl(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first !== "string") return null;
  const s = first.trim();
  if (!s) return null;

  if (s.startsWith("/") && !s.startsWith("//")) {
    return s;
  }

  if (s.startsWith("https://") || s.startsWith("http://")) {
    try {
      const u = new URL(s);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return s;
    } catch {
      return null;
    }
  }

  return null;
}

export type ScarcityKind = "oneOfOne" | "editionLeft" | "madeToOrder" | "sold";

export type ScarcityInfo = {
  kind: ScarcityKind;
  type: FulfillmentType | "unknown";
  quantity?: number;
};

/** Type taxonomy → UI scarcity signal for cards and PDP. */
export function getScarcityInfo(p: MerchProduct): ScarcityInfo {
  const type = isFulfillmentType(p.fulfillment_type) ? p.fulfillment_type : "unknown";
  if (isProductSold(p)) {
    return { kind: "sold", type };
  }
  switch (type) {
    case "original":
      return { kind: "oneOfOne", type };
    case "edition":
      return { kind: "editionLeft", type, quantity: p.quantity };
    case "pod":
      return { kind: "madeToOrder", type };
    default:
      return { kind: "oneOfOne", type: "unknown" };
  }
}
