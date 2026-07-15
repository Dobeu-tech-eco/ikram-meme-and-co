import { describe, it, expect } from "vitest";
import { createProductCore } from "@/lib/actions/products";
import { buildStubClient } from "@/lib/__test-helpers";

describe("createProductCore", () => {
  it("validates and inserts a product", async () => {
    const db = buildStubClient({ products: { data: { id: "p9" }, error: null } });
    const result = await createProductCore(db as never, {
      slug: "new-piece",
      artist_id: "11111111-1111-4111-8111-111111111111",
      title_en: "New Piece",
      title_ar: "قطعة جديدة",
      price_cents: 5000,
      fulfillment_type: "original",
      quantity: 1,
    });
    expect(result.ok).toBe(true);
    expect(db.calls["products.insert"]).toHaveLength(1);
  });

  it("rejects invalid input without touching the db", async () => {
    const db = buildStubClient({});
    const result = await createProductCore(db as never, { slug: "", price_cents: -5 } as never);
    expect(result.ok).toBe(false);
    expect(db.from).not.toHaveBeenCalled();
  });
});
