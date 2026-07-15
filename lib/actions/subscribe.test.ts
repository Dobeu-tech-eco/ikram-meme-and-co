import { describe, it, expect } from "vitest";
import { subscribeCore } from "@/lib/actions/subscribe";
import { buildStubClient } from "@/lib/__test-helpers";

describe("subscribeCore", () => {
  it("upserts a valid email with locale", async () => {
    const db = buildStubClient({ subscribers: { data: null, error: null } });
    const r = await subscribeCore(db as never, { email: "fan@example.com", locale: "ar" });
    expect(r.ok).toBe(true);
    expect(db.calls["subscribers.upsert"]).toHaveLength(1);
  });
  it("rejects garbage emails without touching the db", async () => {
    const db = buildStubClient({});
    const r = await subscribeCore(db as never, { email: "not-an-email", locale: "en" });
    expect(r.ok).toBe(false);
    expect(db.from).not.toHaveBeenCalled();
  });
});
