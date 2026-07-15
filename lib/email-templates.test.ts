import { describe, it, expect } from "vitest";
import { orderConfirmation, adminOrderNotice } from "@/lib/email-templates";

const input = {
  email: "b@x.co",
  locale: "ar" as const,
  productTitle: "قمر الصحراء",
  amountCents: 24000,
};

describe("email templates", () => {
  it("renders Arabic confirmation with RTL markup and formatted price", () => {
    const { subject, html } = orderConfirmation(input);
    expect(subject).toContain("قمر الصحراء");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("$240.00");
  });

  it("renders English confirmation LTR", () => {
    const { html } = orderConfirmation({ ...input, locale: "en", productTitle: "Desert Moon" });
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("Desert Moon");
  });

  it("admin notice always includes buyer email and amount", () => {
    const { subject, html } = adminOrderNotice(input);
    expect(subject).toContain("New order");
    expect(html).toContain("b@x.co");
    expect(html).toContain("$240.00");
  });
});
