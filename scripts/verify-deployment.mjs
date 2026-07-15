#!/usr/bin/env node
// Post-deploy smoke check. Zero dependencies (Node 20+ global fetch).
// Usage: node scripts/verify-deployment.mjs https://your-domain.example
// Exits non-zero if any check fails — safe to gate CI on.

const base = (process.argv[2] || process.env.PRODUCTION_URL || "").replace(/\/$/, "");
if (!base) {
  console.error("Usage: node scripts/verify-deployment.mjs <production-url>");
  process.exit(2);
}

let failures = 0;
const pass = (m) => console.log(`  ok   ${m}`);
const fail = (m) => {
  console.error(`  FAIL ${m}`);
  failures++;
};

async function get(path) {
  const res = await fetch(base + path, { redirect: "follow" });
  const body = await res.text();
  return { status: res.status, body };
}

async function main() {
  console.log(`Verifying deployment: ${base}\n`);

  // 1. English home renders with an <h1>.
  try {
    const r = await get("/en");
    if (r.status === 200 && /<h1[\s>]/i.test(r.body)) pass("/en renders (200, has <h1>)");
    else fail(`/en expected 200 + <h1>, got ${r.status}`);
  } catch (e) {
    fail(`/en threw: ${e.message}`);
  }

  // 2. Arabic home is RTL.
  try {
    const r = await get("/ar");
    if (r.status === 200 && /dir="rtl"/i.test(r.body)) pass('/ar renders RTL (dir="rtl")');
    else fail(`/ar expected 200 + dir="rtl", got ${r.status}`);
  } catch (e) {
    fail(`/ar threw: ${e.message}`);
  }

  // 3. Shop page reachable.
  try {
    const r = await get("/en/shop");
    if (r.status === 200) pass("/en/shop reachable (200)");
    else fail(`/en/shop expected 200, got ${r.status}`);
  } catch (e) {
    fail(`/en/shop threw: ${e.message}`);
  }

  // 4. Security: the Stripe webhook must reject unsigned POSTs (never accept payment state
  //    from an unsigned request). Expect 400.
  try {
    const res = await fetch(base + "/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });
    if (res.status === 400) pass("/api/webhooks/stripe rejects unsigned POST (400)");
    else fail(`webhook expected 400 for unsigned POST, got ${res.status}`);
  } catch (e) {
    fail(`webhook check threw: ${e.message}`);
  }

  // 5. Admin is gated: /admin should redirect unauthenticated users to /admin/login.
  try {
    const res = await fetch(base + "/admin", { redirect: "manual" });
    const loc = res.headers.get("location") || "";
    const redirected = (res.status >= 300 && res.status < 400 && /\/admin\/login/.test(loc));
    // Some hosts follow server redirects; also accept a rendered login page.
    if (redirected) pass("/admin redirects to /admin/login when unauthenticated");
    else {
      const followed = await get("/admin");
      if (followed.status === 200 && /sign in/i.test(followed.body))
        pass("/admin surfaces the login screen when unauthenticated");
      else fail(`/admin should gate to login; got status ${res.status} loc="${loc}"`);
    }
  } catch (e) {
    fail(`/admin check threw: ${e.message}`);
  }

  console.log("");
  if (failures) {
    console.error(`Deployment verification FAILED: ${failures} check(s) failed.`);
    process.exit(1);
  }
  console.log("Deployment verification passed.");
}

main().catch((e) => {
  console.error("verifier crashed:", e);
  process.exit(1);
});
