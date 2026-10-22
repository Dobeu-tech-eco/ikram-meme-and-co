import { describe, expect, it } from "vitest";
import { isScrolled } from "./use-scrolled";

describe("isScrolled", () => {
  it("false at or below threshold", () => {
    expect(isScrolled(24, 24)).toBe(false);
    expect(isScrolled(0, 24)).toBe(false);
  });
  it("true above threshold", () => {
    expect(isScrolled(25, 24)).toBe(true);
  });
});
