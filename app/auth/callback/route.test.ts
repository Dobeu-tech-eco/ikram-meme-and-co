// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { exchange } = vi.hoisted(() => ({ exchange: vi.fn().mockResolvedValue({}) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { exchangeCodeForSession: exchange } }),
}));
const origin = "https://friends.chimacomics.shop";

async function redirect(next?: string) {
  const url = new URL("/auth/callback?code=test-code", origin);
  if (next !== undefined) url.searchParams.set("next", next);
  return (await GET(new Request(url))).headers.get("location");
}

describe("auth callback redirect", () => {
  it.each([
    "https://evil.example/path", "//evil.example", "/\\\\evil.example",
    "https://friends.chimacomics.shop.evil.example", "https://friends.chimacomics.shop@evil.example",
    "http://friends.chimacomics.shop", "https://friends.chimacomics.shop:444/path",
    "javascript:alert(1)", "data:text/html,hello", "https://[invalid",
  ])("rejects unsafe destination %s", async (next) => {
    expect(await redirect(next)).toBe(`${origin}/`);
  });
  it.each(["/admin", "/ar?view=orders#recent", `${origin}/en`])("allows same-origin destination %s", async (next) => {
    expect(await redirect(next)).toBe(new URL(next, origin).href);
  });
  it("defaults to home and exchanges the auth code", async () => {
    expect(await redirect()).toBe(`${origin}/`);
    expect(exchange).toHaveBeenCalledWith("test-code");
  });
});
