import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // Compare parsed origins so protocol-relative URLs and backslashes cannot
  // bypass the allowlist. Malformed and off-origin targets fall back to home.
  let destination = new URL("/", url.origin);
  try {
    const candidate = new URL(next, url.origin);
    if (candidate.origin === url.origin && !candidate.username && !candidate.password) {
      destination = candidate;
    }
  } catch {
    // Keep the safe fallback for invalid URLs.
  }
  return NextResponse.redirect(destination);
}
