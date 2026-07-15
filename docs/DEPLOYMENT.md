# Deployment — Arab Stickers Co (Phase 1 → Production)

Push + deploy must run in **your own terminal** (network + your GitHub/Vercel logins).
The cloud agent can't do it: the desktop VM has no network, and the cloud sandbox has no
credentials for the `dobeu-tech-eco` org, Vercel, Supabase, Stripe, or Resend.

Repo: `C:\Users\JeremyWilliams\repos\ikram-meme-and-co` · Next.js 16 · pnpm.

## 0. Clean the delivery artifacts (once)
```powershell
cd C:\Users\JeremyWilliams\repos\ikram-meme-and-co
del _deliver.zip ikram-meme-and-co-phase1-complete.zip SYNC-README.txt 2>$null
Remove-Item -Recurse -Force ikram-meme-and-co-phase1-complete 2>$null
```

## 1. Install + local verify
```powershell
pnpm install
pnpm verify          # type-check + lint + 22 unit tests + next build
```

## 2. Commit + push to GitHub (dobeu-tech-eco)
```powershell
git add -A
git commit -m "feat: complete Phase 1 (checkout, webhook, emails, storefront, admin, analytics) + deploy-verify"
git branch -M main
git remote get-url origin 2>$null; if ($LASTEXITCODE -ne 0) { git remote add origin https://github.com/dobeu-tech-eco/ikram-meme-and-co.git }
# Create the repo under the org and push (needs `gh auth login` once):
gh repo create dobeu-tech-eco/ikram-meme-and-co --private --source=. --remote=origin --push
#   If the repo already exists, skip gh and just:  git push -u origin main
```
CI (`.github/workflows/ci.yml`) runs `pnpm verify` on every push.

## 3. Production Supabase
```powershell
pnpm supabase link --project-ref <prod-ref>
pnpm supabase db push
# optional demo rows:  pnpm supabase db execute --file supabase/seed.sql
```

## 4. Vercel project + env + deploy
```powershell
vercel link          # create/link the project (needs `vercel login` once)
# Add each env var (interactive — paste the real secret when prompted):
foreach ($k in @(
  "NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY","RESEND_API_KEY","RESEND_FROM_EMAIL","ADMIN_EMAILS","NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_POSTHOG_KEY","NEXT_PUBLIC_POSTHOG_HOST"
)) { vercel env add $k production }
vercel --prod
```

## 5. Stripe webhook
Dashboard → Developers → Webhooks → Add endpoint (test mode first):
- URL: `https://<domain>/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`
Copy the signing secret, then:
```powershell
vercel env add STRIPE_WEBHOOK_SECRET production
vercel --prod
```

## 6. Verify (automation)
```powershell
# one-shot smoke against the live URL:
node scripts/verify-deployment.mjs https://<domain>
# enable the recurring GitHub Action check (runs on-demand + every 6h):
gh variable set PRODUCTION_URL --body "https://<domain>"
gh workflow run "Deploy Verify"
```
`scripts/verify-deployment.mjs` asserts: `/en` renders, `/ar` is RTL, `/en/shop` loads,
the Stripe webhook rejects unsigned POSTs (400), and `/admin` gates to login. Non-zero exit on
any failure, so CI blocks a bad deploy.

## 7. Manual smoke checklist (Stripe test mode, card 4242 4242 4242 4242)
1. `/en` + `/ar` render; Arabic `dir="rtl"`; theme toggle persists.
2. Buy the seeded original → success page → SOLD on `/shop` → order in `/admin/orders` → emails sent.
3. Second checkout on the same original before paying → "Someone just bought this piece."
4. Abandon checkout → ~31 min later the piece returns to `available` (expired webhook).
5. Buy the edition twice → quantity 50 → 48.
6. Cookie banner: decline → no PostHog; accept → events arrive.
7. Admin magic-link login works for an `ADMIN_EMAILS` address; others redirect to `/admin/login`.

## 8. Go live
Swap Stripe to live keys + live webhook secret; redeploy.

## Env vars
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_KEY` (opt), `NEXT_PUBLIC_POSTHOG_HOST` (opt).
