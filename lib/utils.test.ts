import { describe, it, expect, beforeEach } from "vitest";
import { isAdminEmail } from "@/lib/utils";

describe("isAdminEmail", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = "jeremy@dobeu.net, ops@arabstickers.co";
  });
  it("matches case-insensitively and trims", () => {
    expect(isAdminEmail("Jeremy@Dobeu.net")).toBe(true);
    expect(isAdminEmail("ops@arabstickers.co")).toBe(true);
  });
  it("rejects others and empties", () => {
    expect(isAdminEmail("evil@x.co")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
