import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hardening = readFileSync(
  "supabase/migrations/20261016000000_stripe_webhook_hardening.sql",
  "utf8"
);

describe("stripe webhook hardening migration", () => {
  it("grants stripe_events DML to service_role", () => {
    expect(hardening).toMatch(
      /grant select, insert, update, delete on table public\.stripe_events to service_role;/
    );
  });

  it("grants execute on the claim and side-effect functions only to service_role", () => {
    const functions = [
      "claim_stripe_event(text, interval)",
      "complete_stripe_event(text)",
      "release_stripe_event(text)",
      "apply_checkout_inventory(uuid, uuid)",
      "claim_order_notification(uuid)",
    ];
    for (const signature of functions) {
      expect(hardening).toContain(
        `revoke all on function public.${signature} from public, anon, authenticated;`
      );
      expect(hardening).toContain(`grant execute on function public.${signature} to service_role;`);
    }
  });

  it("reclaims stale processing claims and keeps order side effects unique", () => {
    expect(hardening).toContain("interval '5 minutes'");
    expect(hardening).toContain("return 'reclaimed'");
    expect(hardening).toContain("return 'duplicate'");
    expect(hardening).toContain("return 'in_progress'");
    expect(hardening).toContain("'-infinity'::timestamptz");
    expect(hardening).toContain("unique (order_id, product_id)");
    expect(hardening).toContain("inventory_applied = true");
    expect(hardening).toContain("return 'already_applied'");
  });
});
