import { describe, it, expect, vi } from "vitest";
import { createCheckoutForProduct } from "@/lib/checkout";
import { buildStubClient } from "@/lib/__test-helpers";

const product = {
  id: "p1",
  slug: "desert-moon-original",
  title_en: "Desert Moon",
  title_ar: "قمر الصحراء",
  price_cents: 24000,
  currency: "usd",
  fulfillment_type: "original",
  status: "available",
  quantity: 1,
};

function stubStripe(url: string | null = "https://checkout.stripe.com/s/abc") {
  return {
    checkout: {
      sessions: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        create: vi.fn(async (_params: Record<string, unknown>) => ({ url })),
      },
    },
  };
}

describe("createCheckoutForProduct", () => {
  it("reserves an original and returns the checkout url", async () => {
    const db = buildStubClient({
      products: { data: product, error: null },
      "rpc.reserve_original": { data: true, error: null },
    });
    const stripe = stubStripe();
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stripe as never, siteUrl: "https://arabstickers.co" },
      { productId: "p1", locale: "ar" }
    );
    expect(result).toEqual({ ok: true, url: "https://checkout.stripe.com/s/abc" });
    expect(db.calls["rpc.reserve_original"]).toHaveLength(1);
    const params = stripe.checkout.sessions.create.mock.calls[0][0] as { metadata?: unknown };
    expect(params.metadata).toEqual({ product_id: "p1", locale: "ar" });
  });

  it("returns sold_out when the reserve rpc reports no row updated", async () => {
    const db = buildStubClient({
      products: { data: product, error: null },
      "rpc.reserve_original": { data: false, error: null },
    });
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stubStripe() as never, siteUrl: "x" },
      { productId: "p1", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "sold_out" });
  });

  it("returns sold_out for an edition with zero quantity", async () => {
    const db = buildStubClient({
      products: { data: { ...product, fulfillment_type: "edition", quantity: 0 }, error: null },
    });
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stubStripe() as never, siteUrl: "x" },
      { productId: "p1", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "sold_out" });
  });

  it("releases the hold and returns stripe_error when session creation throws", async () => {
    const db = buildStubClient({
      products: { data: product, error: null },
      "rpc.reserve_original": { data: true, error: null },
      "rpc.release_original": { data: null, error: null },
    });
    const stripe = {
      checkout: {
        sessions: {
          create: vi.fn(async () => {
            throw new Error("boom");
          }),
        },
      },
    };
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stripe as never, siteUrl: "x" },
      { productId: "p1", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "stripe_error" });
    expect(db.calls["rpc.release_original"]).toHaveLength(1);
  });

  it("returns not_found for a missing product", async () => {
    const db = buildStubClient({ products: { data: null, error: null } });
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stubStripe() as never, siteUrl: "x" },
      { productId: "nope", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "not_found" });
  });
});
