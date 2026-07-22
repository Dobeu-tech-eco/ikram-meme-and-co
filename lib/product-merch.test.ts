import { describe, expect, it } from "vitest";
import {
  getProductImageUrl,
  getScarcityInfo,
  isFulfillmentType,
  isProductBuyable,
  isProductSold,
} from "@/lib/product-merch";

describe("isFulfillmentType", () => {
  it("accepts catalog enums", () => {
    expect(isFulfillmentType("original")).toBe(true);
    expect(isFulfillmentType("edition")).toBe(true);
    expect(isFulfillmentType("pod")).toBe(true);
    expect(isFulfillmentType("sticker")).toBe(false);
  });
});

describe("isProductSold / isProductBuyable", () => {
  it("marks status sold", () => {
    const p = { fulfillment_type: "original", status: "sold", quantity: 1, images: [] };
    expect(isProductSold(p)).toBe(true);
    expect(isProductBuyable(p)).toBe(false);
  });

  it("marks edition with zero qty as sold", () => {
    const p = { fulfillment_type: "edition", status: "available", quantity: 0, images: [] };
    expect(isProductSold(p)).toBe(true);
    expect(isProductBuyable(p)).toBe(false);
  });

  it("keeps available original buyable", () => {
    const p = { fulfillment_type: "original", status: "available", quantity: 1, images: [] };
    expect(isProductSold(p)).toBe(false);
    expect(isProductBuyable(p)).toBe(true);
  });
});

describe("getProductImageUrl", () => {
  it("returns https URLs", () => {
    expect(getProductImageUrl(["https://cdn.example.com/a.jpg"])).toBe(
      "https://cdn.example.com/a.jpg"
    );
  });

  it("returns root-relative paths", () => {
    expect(getProductImageUrl(["/art/piece.jpg"])).toBe("/art/piece.jpg");
  });

  it("rejects bare seed placeholders and javascript URLs", () => {
    expect(getProductImageUrl(["placeholder-1.jpg"])).toBeNull();
    expect(getProductImageUrl(["javascript:alert(1)"])).toBeNull();
    expect(getProductImageUrl([])).toBeNull();
    expect(getProductImageUrl(null)).toBeNull();
  });
});

describe("getScarcityInfo", () => {
  it("maps original / edition / pod", () => {
    expect(
      getScarcityInfo({
        fulfillment_type: "original",
        status: "available",
        quantity: 1,
        images: [],
      })
    ).toEqual({ kind: "oneOfOne", type: "original" });

    expect(
      getScarcityInfo({
        fulfillment_type: "edition",
        status: "available",
        quantity: 12,
        images: [],
      })
    ).toEqual({ kind: "editionLeft", type: "edition", quantity: 12 });

    expect(
      getScarcityInfo({
        fulfillment_type: "pod",
        status: "available",
        quantity: 999,
        images: [],
      })
    ).toEqual({ kind: "madeToOrder", type: "pod" });
  });

  it("maps sold", () => {
    expect(
      getScarcityInfo({
        fulfillment_type: "original",
        status: "sold",
        quantity: 0,
        images: [],
      }).kind
    ).toBe("sold");
  });
});
