import { describe, expect, it } from "vitest";
import { clampScrollProgress } from "./scroll-progress";

describe("clampScrollProgress", () => {
  it("returns 0 at top", () => {
    expect(clampScrollProgress(0, 1000)).toBe(0);
  });
  it("returns 1 at/beyond bottom", () => {
    expect(clampScrollProgress(1000, 1000)).toBe(1);
    expect(clampScrollProgress(2000, 1000)).toBe(1);
  });
  it("clamps mid-page", () => {
    expect(clampScrollProgress(250, 1000)).toBe(0.25);
  });
  it("treats non-positive max as 1 denominator", () => {
    expect(clampScrollProgress(0, 0)).toBe(0);
  });
});
