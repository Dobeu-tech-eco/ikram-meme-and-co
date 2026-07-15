import { describe, it, expect } from "vitest";
import { localeDir } from "@/lib/i18n";

describe("localeDir", () => {
  it("returns rtl for Arabic", () => {
    expect(localeDir("ar")).toBe("rtl");
  });
  it("returns ltr for English and unknowns", () => {
    expect(localeDir("en")).toBe("ltr");
    expect(localeDir("fr")).toBe("ltr");
  });
});
