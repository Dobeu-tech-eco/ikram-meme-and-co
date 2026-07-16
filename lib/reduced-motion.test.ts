import { describe, expect, it, vi, afterEach } from "vitest";
import { prefersReducedMotion } from "./media";

describe("prefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when window is undefined-like (no matchMedia)", () => {
    vi.stubGlobal("window", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("reads matchMedia reduce preference", () => {
    vi.stubGlobal("window", {
      matchMedia: (q: string) => ({
        matches: q.includes("prefers-reduced-motion"),
      }),
    });
    expect(prefersReducedMotion()).toBe(true);
  });
});
