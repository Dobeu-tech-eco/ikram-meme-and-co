import { test, expect } from "@playwright/test";

test("home renders EN and AR with RTL", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("shop lists seeded products and PDP shows Buy now", async ({ page }) => {
  await page.goto("/en/shop");
  await page.getByText("Desert Moon — Original").click();
  await expect(page.getByRole("button", { name: /buy now/i })).toBeVisible();
});
