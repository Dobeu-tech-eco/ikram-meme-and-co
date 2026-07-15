# Arab Stickers Co — Phase 1 Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a sellable, bilingual (EN/AR) ecommerce store for 1-of-1 originals and limited editions, with race-safe checkout, admin fulfillment, order emails, and consent-gated analytics, deployed on Vercel.

**Architecture:** Single Next.js 15 App Router repo; Supabase (Postgres/Auth/Storage) with RLS; Stripe hosted Checkout with a signed webhook as the sole writer of payment state; Resend for email; next-intl for `/en`+`/ar` with RTL; next-themes light/dark with glassmorphism tokens.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS v4, next-intl, next-themes, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Stripe, Resend, Zod, Vitest, Playwright, pnpm, GitHub Actions, Vercel.

## Global Constraints

- Package manager: **pnpm**, Node **>=20** (`.nvmrc` = `20`, `engines.node` = `">=20"`).
- Exactly **one** Next config file: `next.config.ts`. Never create `next.config.js`.
- `typescript.ignoreBuildErrors: false` and `eslint.ignoreDuringBuilds: false` — the build is a real verifier.
- All user-facing content columns are paired `*_en` / `*_ar`. Prices are **integer cents**, currency `usd`.
- Payment state transitions happen **only** in the Stripe webhook handler. UI never optimistically marks paid/sold.
- All layout spacing uses Tailwind **logical properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) — never `ml/mr/pl/pr/left/right` — so RTL works free.
- Analytics never initializes before cookie consent.
- Server-only modules that touch `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` must import `"server-only"`.
- `pnpm verify` = `type-check && lint && test:ci && build` and must pass before every task's commit.
- Path alias `@/*` → repo root.

---

### Task 1: Scaffold repo, tooling, CI

**Files:**
- Create: entire project via `create-next-app`, then `.nvmrc`, `vitest.config.ts`, `vitest.setup.ts`, `.github/workflows/ci.yml`, `docs/` (copy spec + this plan in)
- Modify: `package.json` (scripts, engines), `next.config.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a repo where `pnpm verify` passes; alias `@/*`; test runner wired. Later tasks rely on scripts `dev`, `verify`, `test`, `test:ci`, `type-check`, `lint`.

- [ ] **Step 1: Scaffold the app**

Repo home: Jeremy's designated local folder is `C:\Users\JeremyWilliams\repos\ikram-meme-and-co` (currently empty — scaffold into its parent and target that folder name; adjust the path if executing in a cloud workspace and sync back afterward).

```bash
cd <repos-parent-dir> && pnpm dlx create-next-app@latest ikram-meme-and-co \
  --typescript --tailwind --eslint --app --src-dir=false \
  --import-alias "@/*" --use-pnpm --turbopack --yes
cd ikram-meme-and-co
echo "20" > .nvmrc
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add @supabase/supabase-js @supabase/ssr stripe resend next-intl next-themes zod server-only
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

- [ ] **Step 3: Wire scripts and engines in `package.json`**

Merge into the existing file (keep create-next-app's `dev`/`build`/`start`/`lint`):

```json
{
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest run",
    "test:e2e": "playwright test",
    "verify": "pnpm type-check && pnpm lint && pnpm test:ci && pnpm build"
  }
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["app/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

And `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm verify
```

- [ ] **Step 6: Add a trivial smoke test so `test:ci` has something to run**

Create `lib/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs tests", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Verify everything passes**

Run: `pnpm verify`
Expected: type-check, lint, 1 test, and build all succeed.

- [ ] **Step 8: Copy docs, init git, create GitHub repo, commit**

```bash
mkdir -p docs/superpowers/specs docs/superpowers/plans
# copy the spec + this plan into those folders
git init -b main && git add -A
git commit -m "chore: scaffold Next.js 15 app with tooling, CI, and docs"
gh repo create ikram-meme-and-co --private --source=. --push
```

---

### Task 2: Bilingual routing (next-intl) + RTL

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `middleware.ts`, `messages/en.json`, `messages/ar.json`, `lib/i18n.ts`, `lib/i18n.test.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`
- Modify: `next.config.ts` (next-intl plugin), delete `app/page.tsx` and `app/layout.tsx` from scaffold (replace with a root layout passthrough)

**Interfaces:**
- Consumes: Task 1 toolchain.
- Produces: `routing` (locales `["en","ar"]`, default `en`); `localeDir(locale: string): "rtl" | "ltr"`; `Link`/`redirect` from `i18n/navigation.ts`; every page lives under `app/[locale]/`. Type `Locale = "en" | "ar"` exported from `lib/i18n.ts`.

- [ ] **Step 1: Write the failing test** — `lib/i18n.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:ci -- lib/i18n.test.ts`
Expected: FAIL — cannot resolve `@/lib/i18n`.

- [ ] **Step 3: Implement `lib/i18n.ts`**

```ts
export type Locale = "en" | "ar";
export const localeDir = (locale: string): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:ci -- lib/i18n.test.ts` — Expected: PASS (3 assertions).

- [ ] **Step 5: Create routing config**

`i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
});
```

`i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
```

`i18n/navigation.ts`:

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

`middleware.ts` (repo root — excludes `/admin` and `/api` from locale routing):

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|auth|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 6: Wire the plugin in `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Messages and layouts**

`messages/en.json`:

```json
{
  "nav": { "shop": "Shop", "artists": "Artists", "home": "Home" },
  "hero": { "title": "One of one. From real Arab artists.", "cta": "Shop the drop" },
  "product": { "buyNow": "Buy now", "sold": "SOLD", "justSold": "Someone just bought this piece.", "by": "by" },
  "footer": { "subscribe": "Get drop announcements", "emailPlaceholder": "your@email.com", "subscribed": "You're on the list." }
}
```

`messages/ar.json`:

```json
{
  "nav": { "shop": "المتجر", "artists": "الفنانون", "home": "الرئيسية" },
  "hero": { "title": "قطعة واحدة فقط. من فنانين عرب حقيقيين.", "cta": "تسوّق الإصدار" },
  "product": { "buyNow": "اشترِ الآن", "sold": "بيعت", "justSold": "اشترى أحدهم هذه القطعة للتو.", "by": "بواسطة" },
  "footer": { "subscribe": "اشترك في إعلانات الإصدارات", "emailPlaceholder": "بريدك الإلكتروني", "subscribed": "تمت إضافتك إلى القائمة." }
}
```

Replace scaffold layout: `app/layout.tsx` becomes a passthrough (required by Next for the root):

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

`app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localeDir } from "@/lib/i18n";
import "../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`app/[locale]/page.tsx` (placeholder until Task 7):

```tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("hero");
  return <h1 className="p-8 text-3xl font-bold">{t("title")}</h1>;
}
```

Delete the scaffold's `app/page.tsx`.

- [ ] **Step 8: Verify and commit**

Run: `pnpm verify` — Expected: PASS. Then `pnpm dev`, open `http://localhost:3000/ar`, confirm `dir="rtl"` and Arabic headline.

```bash
git add -A && git commit -m "feat: bilingual EN/AR routing with next-intl and RTL support"
```

---

### Task 3: Theme system — light/dark, soft corners, glassmorphism, vibrant accents

**Files:**
- Create: `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `components/glass.test.tsx`
- Modify: `app/globals.css`, `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: Task 2 locale layout.
- Produces: CSS classes `.glass` and `.glass-strong`; CSS variables `--color-surface`, `--color-fg`, `--color-accent`, `--color-accent-2`, `--radius-xl`; `<ThemeProvider>` and `<ThemeToggle />` components. All later UI tasks use these.

- [ ] **Step 1: Write the failing test** — `components/glass.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeToggle } from "@/components/theme-toggle";

describe("ThemeToggle", () => {
  it("renders a button with an accessible label", () => {
    const { getByRole } = render(<ThemeToggle />);
    expect(getByRole("button", { name: /theme/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:ci -- components/glass.test.tsx`
Expected: FAIL — cannot resolve `@/components/theme-toggle`.

- [ ] **Step 3: Implement tokens in `app/globals.css`** (Tailwind v4 style — append after the `@import "tailwindcss";` line, replacing scaffold body rules)

```css
:root {
  --color-surface: oklch(0.98 0.005 90);
  --color-surface-2: oklch(0.94 0.01 90);
  --color-fg: oklch(0.2 0.02 270);
  --color-accent: oklch(0.68 0.21 25);   /* vibrant coral-red */
  --color-accent-2: oklch(0.75 0.16 160); /* vibrant teal-green */
  --radius-xl: 1.25rem;
}
.dark {
  --color-surface: oklch(0.17 0.015 270);
  --color-surface-2: oklch(0.22 0.02 270);
  --color-fg: oklch(0.95 0.01 90);
  --color-accent: oklch(0.72 0.19 25);
  --color-accent-2: oklch(0.78 0.15 160);
}

@theme inline {
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-fg: var(--color-fg);
  --color-accent: var(--color-accent);
  --color-accent-2: var(--color-accent-2);
}

body {
  background: var(--color-surface);
  color: var(--color-fg);
}

.glass {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: color-mix(in oklab, var(--color-surface) 60%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-fg) 12%, transparent);
  border-radius: var(--radius-xl);
}

.glass-strong {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  background: color-mix(in oklab, var(--color-surface) 75%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px color-mix(in oklab, var(--color-fg) 8%, transparent);
}
```

- [ ] **Step 4: Implement `components/theme-provider.tsx` and `components/theme-toggle.tsx`**

```tsx
// components/theme-provider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

```tsx
// components/theme-toggle.tsx
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      aria-label="Toggle theme"
      className="glass px-3 py-2 text-sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
```

Wrap `<ThemeProvider>` around `<NextIntlClientProvider>`'s children in `app/[locale]/layout.tsx` (inside `<body>`).

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test:ci -- components/glass.test.tsx` — Expected: PASS.

- [ ] **Step 6: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: light/dark theme system with glassmorphism and vibrant accent tokens"
```

---

### Task 4: Supabase schema, RLS, race-guard RPCs, clients, seed

**Files:**
- Create: `supabase/migrations/20260715000000_initial_schema.sql`, `supabase/seed.sql`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/database.types.ts` (generated), `lib/__test-helpers.ts`
- Modify: `package.json` (supabase scripts)

**Interfaces:**
- Consumes: Task 1 toolchain.
- Produces: `createClient(): Promise<SupabaseClient<Database>>` (cookie-bound) and `createAdminClient(): SupabaseClient<Database>` (service-role, throws if key missing) from `@/lib/supabase/server`; SQL functions `reserve_original(p_id uuid, p_minutes int)` → boolean, `release_original(p_id uuid)` → void, `mark_sold(p_id uuid)` → void, `decrement_edition(p_id uuid)` → boolean; `buildStubClient(results)` test helper from `@/lib/__test-helpers` whose `rpc`/`from` calls are recorded in `.calls`.

- [ ] **Step 1: Init supabase and add scripts**

```bash
pnpm add -D supabase
pnpm supabase init
```

Add to `package.json` scripts: `"db:types": "supabase gen types typescript --local > lib/database.types.ts"`.

- [ ] **Step 2: Write the migration** — `supabase/migrations/20260715000000_initial_schema.sql`

```sql
create type fulfillment_type as enum ('original','edition','pod');
create type product_status as enum ('draft','available','reserved','sold','archived');
create type order_status as enum ('pending','paid','failed','refunded','fulfilled');

create table artists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  bio_en text,
  bio_ar text,
  photo_url text,
  instagram text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  artist_id uuid not null references artists(id),
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'usd',
  fulfillment_type fulfillment_type not null default 'original',
  status product_status not null default 'draft',
  quantity integer not null default 1 check (quantity >= 0),
  reserved_until timestamptz,
  images jsonb not null default '[]',
  created_at timestamptz not null default now(),
  constraint originals_qty_one check (fulfillment_type <> 'original' or quantity <= 1)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status order_status not null default 'pending',
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent_id text,
  amount_total_cents integer not null default 0,
  currency text not null default 'usd',
  shipping_name text,
  shipping_address jsonb,
  tracking_number text,
  carrier text,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  title_en text not null,
  price_cents integer not null,
  quantity integer not null default 1
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

-- Race-guard functions -------------------------------------------------

create or replace function reserve_original(p_id uuid, p_minutes integer default 35)
returns boolean language plpgsql security definer as $$
begin
  update products
     set status = 'reserved',
         reserved_until = now() + make_interval(mins => p_minutes)
   where id = p_id and status = 'available' and fulfillment_type = 'original';
  return found;
end; $$;

create or replace function release_original(p_id uuid)
returns void language plpgsql security definer as $$
begin
  update products set status = 'available', reserved_until = null
   where id = p_id and status = 'reserved';
end; $$;

create or replace function mark_sold(p_id uuid)
returns void language plpgsql security definer as $$
begin
  update products set status = 'sold', reserved_until = null, quantity = 0
   where id = p_id;
end; $$;

create or replace function decrement_edition(p_id uuid)
returns boolean language plpgsql security definer as $$
begin
  update products set quantity = quantity - 1
   where id = p_id and fulfillment_type = 'edition' and quantity > 0;
  if not found then return false; end if;
  update products set status = 'sold'
   where id = p_id and quantity = 0;
  return true;
end; $$;

revoke execute on function reserve_original(uuid, integer) from anon, authenticated;
revoke execute on function release_original(uuid) from anon, authenticated;
revoke execute on function mark_sold(uuid) from anon, authenticated;
revoke execute on function decrement_edition(uuid) from anon, authenticated;

-- RLS -------------------------------------------------------------------

alter table artists enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscribers enable row level security;

create policy "public read artists" on artists for select using (true);
create policy "public read live products" on products for select using (status <> 'draft');
-- orders, order_items, subscribers: no anon policies; service-role only.

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
```

- [ ] **Step 3: Write `supabase/seed.sql`**

```sql
insert into artists (slug, name_en, name_ar, bio_en, bio_ar) values
('layla-h', 'Layla H.', 'ليلى ح.', 'Cairo-born illustrator working in ink and gouache.', 'رسامة من القاهرة تعمل بالحبر والغواش.');

insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity, images)
select 'desert-moon-original', id, 'Desert Moon — Original', 'قمر الصحراء — أصلية', 24000, 'original', 'available', 1, '["placeholder-1.jpg"]'
from artists where slug = 'layla-h';

insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity, images)
select 'desert-moon-sticker-edition', id, 'Desert Moon Sticker Sheet — Edition of 50', 'ملصقات قمر الصحراء — إصدار من ٥٠', 1800, 'edition', 'available', 50, '["placeholder-2.jpg"]'
from artists where slug = 'layla-h';
```

- [ ] **Step 4: Apply locally and generate types**

```bash
pnpm supabase start
pnpm supabase db reset   # applies migrations + seed
pnpm db:types
```

Expected: `lib/database.types.ts` exists and contains `products`, `orders`, `reserve_original` under `Functions`.

- [ ] **Step 5: Implement the three-client pattern**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```ts
// lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) =>
          all.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );
}

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 6: Implement the chainable stub for action tests** — `lib/__test-helpers.ts`

```ts
import { vi } from "vitest";

export type StubResult = { data: unknown; error: { message: string } | null };

export function buildStubClient(results: Record<string, StubResult | StubResult[]>) {
  const calls: Record<string, unknown[][]> = {};
  const take = (key: string): StubResult => {
    const r = results[key];
    if (!r) return { data: null, error: null };
    return Array.isArray(r) ? (r.shift() as StubResult) ?? { data: null, error: null } : r;
  };
  const chain = (table: string) => {
    const c: Record<string, unknown> = {};
    for (const m of ["select", "insert", "update", "upsert", "delete", "eq", "neq", "order", "limit", "single", "maybeSingle"]) {
      c[m] = vi.fn((...args: unknown[]) => {
        (calls[`${table}.${m}`] ??= []).push(args);
        return c;
      });
    }
    (c as { then: (resolve: (r: StubResult) => void) => void }).then = (resolve) =>
      resolve(take(table));
    return c;
  };
  return {
    calls,
    from: vi.fn((table: string) => chain(table)),
    rpc: vi.fn(async (fn: string, args?: unknown) => {
      (calls[`rpc.${fn}`] ??= []).push([args]);
      return take(`rpc.${fn}`);
    }),
  };
}
```

- [ ] **Step 7: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: supabase schema with 1-of-1 race-guard RPCs, RLS, clients, and seed"
```

---

### Task 5: Checkout core logic (race-safe Buy Now)

**Files:**
- Create: `lib/checkout.ts`, `lib/checkout.test.ts`

**Interfaces:**
- Consumes: `buildStubClient` (Task 4); SQL functions `reserve_original`/`release_original` (Task 4).
- Produces: `createCheckoutForProduct(deps, input): Promise<CheckoutResult>` where `deps = { db, stripe, siteUrl: string }` (`db` is a SupabaseClient-shaped object; `stripe` needs only `checkout.sessions.create`), `input = { productId: string; locale: "en" | "ar" }`, and `CheckoutResult = { ok: true; url: string } | { ok: false; error: "not_found" | "sold_out" | "stripe_error" }`. Task 7's Buy Now server action calls this. Stripe session metadata carries `product_id` and `locale` — Task 6 depends on those exact keys.

- [ ] **Step 1: Write the failing tests** — `lib/checkout.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { createCheckoutForProduct } from "@/lib/checkout";
import { buildStubClient } from "@/lib/__test-helpers";

const product = {
  id: "p1", slug: "desert-moon-original", title_en: "Desert Moon", title_ar: "قمر الصحراء",
  price_cents: 24000, currency: "usd", fulfillment_type: "original", status: "available", quantity: 1,
};

function stubStripe(url: string | null = "https://checkout.stripe.com/s/abc") {
  return { checkout: { sessions: { create: vi.fn(async () => ({ url })) } } };
}

describe("createCheckoutForProduct", () => {
  it("reserves an original and returns the checkout url", async () => {
    const db = buildStubClient({
      products: { data: product, error: null },
      "rpc.reserve_original": { data: true, error: null },
    });
    const stripe = stubStripe();
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stripe as never, siteUrl: "https://arabstickers.co" },
      { productId: "p1", locale: "ar" }
    );
    expect(result).toEqual({ ok: true, url: "https://checkout.stripe.com/s/abc" });
    expect(db.calls["rpc.reserve_original"]).toHaveLength(1);
    const params = stripe.checkout.sessions.create.mock.calls[0][0] as Record<string, never>;
    expect(params.metadata).toEqual({ product_id: "p1", locale: "ar" });
  });

  it("returns sold_out when the reserve rpc reports no row updated", async () => {
    const db = buildStubClient({
      products: { data: product, error: null },
      "rpc.reserve_original": { data: false, error: null },
    });
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stubStripe() as never, siteUrl: "x" },
      { productId: "p1", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "sold_out" });
  });

  it("returns sold_out for an edition with zero quantity", async () => {
    const db = buildStubClient({
      products: { data: { ...product, fulfillment_type: "edition", quantity: 0 }, error: null },
    });
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stubStripe() as never, siteUrl: "x" },
      { productId: "p1", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "sold_out" });
  });

  it("releases the hold and returns stripe_error when session creation throws", async () => {
    const db = buildStubClient({
      products: { data: product, error: null },
      "rpc.reserve_original": { data: true, error: null },
      "rpc.release_original": { data: null, error: null },
    });
    const stripe = { checkout: { sessions: { create: vi.fn(async () => { throw new Error("boom"); }) } } };
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stripe as never, siteUrl: "x" },
      { productId: "p1", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "stripe_error" });
    expect(db.calls["rpc.release_original"]).toHaveLength(1);
  });

  it("returns not_found for a missing product", async () => {
    const db = buildStubClient({ products: { data: null, error: null } });
    const result = await createCheckoutForProduct(
      { db: db as never, stripe: stubStripe() as never, siteUrl: "x" },
      { productId: "nope", locale: "en" }
    );
    expect(result).toEqual({ ok: false, error: "not_found" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:ci -- lib/checkout.test.ts`
Expected: FAIL — cannot resolve `@/lib/checkout`.

- [ ] **Step 3: Implement `lib/checkout.ts`**

```ts
const HOLD_MINUTES = 35; // DB hold; Stripe session expires slightly earlier

type Db = {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};
type StripeLike = {
  checkout: { sessions: { create: (params: Record<string, unknown>) => Promise<{ url: string | null }> } };
};

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: "not_found" | "sold_out" | "stripe_error" };

export async function createCheckoutForProduct(
  deps: { db: Db; stripe: StripeLike; siteUrl: string },
  input: { productId: string; locale: "en" | "ar" }
): Promise<CheckoutResult> {
  const { db, stripe, siteUrl } = deps;
  const { data: product } = await db
    .from("products").select("*").eq("id", input.productId).single();
  if (!product) return { ok: false, error: "not_found" };

  const p = product as {
    id: string; slug: string; title_en: string; title_ar: string;
    price_cents: number; currency: string; fulfillment_type: string; status: string; quantity: number;
  };

  if (p.fulfillment_type === "original") {
    const { data: reserved } = await db.rpc("reserve_original", { p_id: p.id, p_minutes: HOLD_MINUTES });
    if (!reserved) return { ok: false, error: "sold_out" };
  } else if (p.status !== "available" || p.quantity < 1) {
    return { ok: false, error: "sold_out" };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Stripe requires expires_at >= 30 min from now; 31 min leaves clock-skew room.
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: p.currency,
          unit_amount: p.price_cents,
          product_data: { name: input.locale === "ar" ? p.title_ar : p.title_en },
        },
      }],
      metadata: { product_id: p.id, locale: input.locale },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "DE", "FR", "AE", "SA", "EG", "JO", "LB", "KW", "QA", "BH", "OM"],
      },
      success_url: `${siteUrl}/${input.locale}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${input.locale}/product/${p.slug}`,
    });
    if (!session.url) return { ok: false, error: "stripe_error" };
    return { ok: true, url: session.url };
  } catch {
    if (p.fulfillment_type === "original") {
      await db.rpc("release_original", { p_id: p.id });
    }
    return { ok: false, error: "stripe_error" };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:ci -- lib/checkout.test.ts` — Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/checkout.ts lib/checkout.test.ts
git commit -m "feat: race-safe checkout core for originals and editions"
```

---

### Task 6: Stripe webhook — the only writer of payment state

**Files:**
- Create: `lib/stripe-events.ts`, `lib/stripe-events.test.ts`, `app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Consumes: RPCs `mark_sold`/`decrement_edition`/`release_original` (Task 4); metadata keys `product_id`/`locale` (Task 5); `notify.orderPaid` (Task 7 defines the real one; here we define the type and tests inject a stub).
- Produces: `processStripeEvent(deps, event)` where `deps = { db, notify: { orderPaid(input: { email: string; locale: "en" | "ar"; productTitle: string; amountCents: number }): Promise<void> } }`; a POST route at `/api/webhooks/stripe` with `runtime = "nodejs"`, signature verification, per-event-id dedupe. Orders are idempotent via upsert on `stripe_checkout_session_id`.

- [ ] **Step 1: Write the failing tests** — `lib/stripe-events.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { processStripeEvent } from "@/lib/stripe-events";
import { buildStubClient } from "@/lib/__test-helpers";

const baseSession = {
  id: "cs_123",
  payment_intent: "pi_123",
  amount_total: 24000,
  currency: "usd",
  customer_details: { email: "buyer@example.com", name: "Buyer", address: { country: "US" } },
  metadata: { product_id: "p1", locale: "ar" },
};

function makeDeps(fulfillment: string) {
  const db = buildStubClient({
    products: { data: { id: "p1", title_en: "Desert Moon", title_ar: "قمر الصحراء", fulfillment_type: fulfillment }, error: null },
    orders: { data: { id: "o1" }, error: null },
    order_items: { data: null, error: null },
    "rpc.mark_sold": { data: null, error: null },
    "rpc.decrement_edition": { data: true, error: null },
    "rpc.release_original": { data: null, error: null },
  });
  const notify = { orderPaid: vi.fn(async () => {}) };
  return { db, notify };
}

describe("processStripeEvent", () => {
  it("completed: records order, marks original sold, notifies in buyer locale", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } } as never
    );
    expect(db.calls["orders.upsert"]).toHaveLength(1);
    expect(db.calls["order_items.insert"]).toHaveLength(1);
    expect(db.calls["rpc.mark_sold"]).toHaveLength(1);
    expect(notify.orderPaid).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@example.com", locale: "ar", productTitle: "قمر الصحراء", amountCents: 24000 })
    );
  });

  it("completed: decrements editions instead of marking sold", async () => {
    const { db, notify } = makeDeps("edition");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.completed", data: { object: baseSession } } as never
    );
    expect(db.calls["rpc.decrement_edition"]).toHaveLength(1);
    expect(db.calls["rpc.mark_sold"]).toBeUndefined();
  });

  it("expired: releases the hold", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "checkout.session.expired", data: { object: { metadata: { product_id: "p1" } } } } as never
    );
    expect(db.calls["rpc.release_original"]).toHaveLength(1);
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });

  it("ignores unrelated events", async () => {
    const { db, notify } = makeDeps("original");
    await processStripeEvent(
      { db: db as never, notify },
      { type: "invoice.paid", data: { object: {} } } as never
    );
    expect(db.from).not.toHaveBeenCalled();
    expect(notify.orderPaid).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:ci -- lib/stripe-events.test.ts`
Expected: FAIL — cannot resolve `@/lib/stripe-events`.

- [ ] **Step 3: Implement `lib/stripe-events.ts`**

```ts
export type Notify = {
  orderPaid: (input: { email: string; locale: "en" | "ar"; productTitle: string; amountCents: number }) => Promise<void>;
};

type Db = {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

type SessionLike = {
  id: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null; name?: string | null; address?: unknown } | null;
  metadata?: Record<string, string> | null;
};

export async function processStripeEvent(
  deps: { db: Db; notify: Notify },
  event: { type: string; data: { object: SessionLike } }
): Promise<void> {
  const { db, notify } = deps;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const productId = session.metadata?.product_id;
    if (!productId) return;
    const locale: "en" | "ar" = session.metadata?.locale === "ar" ? "ar" : "en";

    const { data: product } = await db.from("products").select("*").eq("id", productId).single();
    const p = product as { title_en: string; title_ar: string; fulfillment_type: string } | null;

    const { data: order } = await db
      .from("orders")
      .upsert(
        {
          email: session.customer_details?.email ?? "",
          status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          amount_total_cents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          shipping_name: session.customer_details?.name ?? null,
          shipping_address: session.customer_details?.address ?? null,
          locale,
        },
        { onConflict: "stripe_checkout_session_id" }
      )
      .select()
      .single();

    if (order) {
      await db.from("order_items").insert({
        order_id: (order as { id: string }).id,
        product_id: productId,
        title_en: p?.title_en ?? "",
        price_cents: session.amount_total ?? 0,
        quantity: 1,
      });
    }

    if (p?.fulfillment_type === "original") {
      await db.rpc("mark_sold", { p_id: productId });
    } else if (p?.fulfillment_type === "edition") {
      await db.rpc("decrement_edition", { p_id: productId });
    }

    await notify.orderPaid({
      email: session.customer_details?.email ?? "",
      locale,
      productTitle: locale === "ar" ? p?.title_ar ?? "" : p?.title_en ?? "",
      amountCents: session.amount_total ?? 0,
    });
    return;
  }

  if (event.type === "checkout.session.expired") {
    const productId = event.data.object.metadata?.product_id;
    if (productId) await db.rpc("release_original", { p_id: productId });
    return;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:ci -- lib/stripe-events.test.ts` — Expected: PASS (4 tests).

- [ ] **Step 5: Implement the route** — `app/api/webhooks/stripe/route.ts`

```ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processStripeEvent } from "@/lib/stripe-events";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const seenEventIds = new Set<string>();

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("missing signature", { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (seenEventIds.has(event.id)) return NextResponse.json({ received: true, deduped: true });
  seenEventIds.add(event.id);
  if (seenEventIds.size > 1000) {
    const oldest = seenEventIds.values().next().value;
    if (oldest) seenEventIds.delete(oldest);
  }

  try {
    await processStripeEvent({ db: createAdminClient() as never, notify }, event as never);
  } catch (err) {
    console.error("stripe webhook handler failed", err);
    return new NextResponse("handler error", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
```

Note: `@/lib/notify` doesn't exist yet — create a temporary stub so the build passes; Task 7 replaces it:

```ts
// lib/notify.ts (temporary stub, replaced in Task 7)
import type { Notify } from "@/lib/stripe-events";
export const notify: Notify = { orderPaid: async () => {} };
```

- [ ] **Step 6: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: stripe webhook as sole writer of payment state, with dedupe and idempotent orders"
```

---

### Task 7: Order emails (Resend) — bilingual templates

**Files:**
- Create: `lib/resend.ts`, `lib/email-templates.ts`, `lib/email-templates.test.ts`
- Modify: `lib/notify.ts` (replace the Task 6 stub)

**Interfaces:**
- Consumes: `Notify` type (Task 6).
- Produces: `sendEmail({ to, subject, html }): Promise<void>` (non-fatal — logs and swallows failures, no-ops without `RESEND_API_KEY`); `orderConfirmation(input)` and `adminOrderNotice(input)` returning `{ subject: string; html: string }`; real `notify` used by the webhook.

- [ ] **Step 1: Write the failing tests** — `lib/email-templates.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { orderConfirmation, adminOrderNotice } from "@/lib/email-templates";

const input = { email: "b@x.co", locale: "ar" as const, productTitle: "قمر الصحراء", amountCents: 24000 };

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:ci -- lib/email-templates.test.ts`
Expected: FAIL — cannot resolve `@/lib/email-templates`.

- [ ] **Step 3: Implement `lib/email-templates.ts`**

```ts
type OrderEmailInput = { email: string; locale: "en" | "ar"; productTitle: string; amountCents: number };

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const shell = (dir: "rtl" | "ltr", body: string) => `<!doctype html>
<html dir="${dir}"><body style="font-family:sans-serif;background:#faf9f7;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;">${body}</div>
</body></html>`;

export function orderConfirmation(i: OrderEmailInput): { subject: string; html: string } {
  if (i.locale === "ar") {
    return {
      subject: `تأكيد طلبك — ${i.productTitle}`,
      html: shell("rtl", `<h1>شكراً لك!</h1><p>تم تأكيد شرائك لقطعة <strong>${i.productTitle}</strong> بمبلغ ${usd(i.amountCents)}.</p><p>سنرسل لك رقم التتبع فور شحن القطعة.</p>`),
    };
  }
  return {
    subject: `Order confirmed — ${i.productTitle}`,
    html: shell("ltr", `<h1>Thank you!</h1><p>Your purchase of <strong>${i.productTitle}</strong> for ${usd(i.amountCents)} is confirmed.</p><p>We'll email tracking as soon as it ships.</p>`),
  };
}

export function adminOrderNotice(i: OrderEmailInput): { subject: string; html: string } {
  return {
    subject: `New order: ${i.productTitle} (${usd(i.amountCents)})`,
    html: shell("ltr", `<h1>New order</h1><p><strong>${i.productTitle}</strong> — ${usd(i.amountCents)}</p><p>Buyer: ${i.email}</p><p>Ship it, then mark fulfilled in /admin/orders.</p>`),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:ci -- lib/email-templates.test.ts` — Expected: PASS (3 tests).

- [ ] **Step 5: Implement `lib/resend.ts` and the real `lib/notify.ts`**

```ts
// lib/resend.ts
import "server-only";
import { Resend } from "resend";

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await new Resend(key).emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Arab Stickers Co <orders@updates.arabstickers.co>",
      ...opts,
    });
  } catch (err) {
    console.error("resend send failed (non-fatal)", err);
  }
}
```

```ts
// lib/notify.ts (replaces Task 6 stub)
import "server-only";
import type { Notify } from "@/lib/stripe-events";
import { sendEmail } from "@/lib/resend";
import { orderConfirmation, adminOrderNotice } from "@/lib/email-templates";

export const notify: Notify = {
  async orderPaid(input) {
    if (input.email) await sendEmail({ to: input.email, ...orderConfirmation(input) });
    const admin = process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
    if (admin) await sendEmail({ to: admin, ...adminOrderNotice(input) });
  },
};
```

- [ ] **Step 6: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: bilingual order emails via Resend, wired into webhook notify"
```

---

### Task 8: Storefront — immersive hero, shop, product page with Buy Now, artists

**Files:**
- Create: `lib/catalog.ts`, `components/site-header.tsx`, `components/landing/hero.tsx`, `components/product-card.tsx`, `components/buy-now-button.tsx`, `app/[locale]/product/[slug]/page.tsx`, `app/[locale]/product/[slug]/actions.ts`, `app/[locale]/shop/page.tsx`, `app/[locale]/artists/page.tsx`, `app/[locale]/artists/[slug]/page.tsx`, `app/[locale]/order/success/page.tsx`, `playwright.config.ts`, `e2e/smoke.spec.ts`
- Modify: `app/[locale]/page.tsx` (real home), `app/[locale]/layout.tsx` (header)

**Interfaces:**
- Consumes: `createCheckoutForProduct` (Task 5), `createClient`/`createAdminClient` (Task 4), `.glass`/`.glass-strong`/accent tokens (Task 3), `Link` from `i18n/navigation` (Task 2).
- Produces: `getLiveProducts(db)`, `getProductBySlug(db, slug)`, `getArtists(db)`, `getArtistWithWorks(db, slug)` in `lib/catalog.ts`; server action `buyNow(productId, locale)` that redirects to Stripe or returns `{ ok: false, error }`.

- [ ] **Step 1: Implement `lib/catalog.ts`** (thin, typed query layer — pages never call supabase directly)

```ts
import "server-only";

type Db = { from: (table: string) => any };

export async function getLiveProducts(db: Db) {
  const { data } = await db
    .from("products")
    .select("*, artists(slug, name_en, name_ar)")
    .neq("status", "draft")
    .neq("status", "archived")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProductBySlug(db: Db, slug: string) {
  const { data } = await db
    .from("products")
    .select("*, artists(slug, name_en, name_ar)")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getArtists(db: Db) {
  const { data } = await db.from("artists").select("*").order("name_en");
  return data ?? [];
}

export async function getArtistWithWorks(db: Db, slug: string) {
  const { data: artist } = await db.from("artists").select("*").eq("slug", slug).single();
  if (!artist) return null;
  const { data: works } = await db
    .from("products")
    .select("*")
    .eq("artist_id", (artist as { id: string }).id)
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  return { artist, works: works ?? [] };
}
```

- [ ] **Step 2: Glass header and immersive hero**

```tsx
// components/site-header.tsx
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const other = locale === "ar" ? "en" : "ar";
  return (
    <header className="glass-strong fixed top-4 inset-x-4 z-50 flex items-center justify-between px-6 py-3">
      <Link href="/" className="text-lg font-black tracking-tight">
        Arab Stickers Co <span className="text-[--color-accent]">◆</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/shop">{t("shop")}</Link>
        <Link href="/artists">{t("artists")}</Link>
        <a href={`/${other}`} className="glass px-3 py-2" aria-label="Switch language">
          {other === "ar" ? "عربي" : "EN"}
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

```tsx
// components/landing/hero.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden">
      {/* layered gradient mesh — the immersive signature moment */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-1/4 start-[-10%] h-[70svh] w-[70svh] rounded-full blur-3xl opacity-40"
             style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }} />
        <div className="absolute bottom-[-20%] end-[-10%] h-[80svh] w-[80svh] rounded-full blur-3xl opacity-30"
             style={{ background: "radial-gradient(circle, var(--color-accent-2), transparent 70%)" }} />
      </div>
      <div className="glass max-w-3xl mx-4 p-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-black leading-tight text-balance">{t("title")}</h1>
        <Link href="/shop"
              className="mt-8 inline-block rounded-[--radius-xl] px-8 py-4 font-bold text-white"
              style={{ background: "var(--color-accent)" }}>
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
```

Update `app/[locale]/page.tsx` to render `<Hero />` plus a "latest pieces" grid of `<ProductCard />` from `getLiveProducts(createAdminClient())` (admin client is fine server-side for public non-draft reads, but prefer `await createClient()` — RLS already permits it; use the cookie-bound client). Add `<SiteHeader />` to `app/[locale]/layout.tsx` inside providers, above `{children}`.

- [ ] **Step 3: Product card and PDP with Buy Now**

```tsx
// components/product-card.tsx
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export function ProductCard({ p }: { p: any }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const sold = p.status === "sold" || (p.fulfillment_type === "edition" && p.quantity < 1);
  return (
    <Link href={`/product/${p.slug}`} className="glass block overflow-hidden transition hover:scale-[1.02]">
      <div className="aspect-square bg-[--color-surface-2]" />
      <div className="p-4">
        <h3 className="font-bold">{locale === "ar" ? p.title_ar : p.title_en}</h3>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-black text-[--color-accent]">${(p.price_cents / 100).toFixed(0)}</span>
          {sold && <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: "var(--color-accent)" }}>{t("sold")}</span>}
          {p.fulfillment_type === "original" && !sold && (
            <span className="text-xs opacity-70">1 of 1</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

```ts
// app/[locale]/product/[slug]/actions.ts
"use server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { createCheckoutForProduct, type CheckoutResult } from "@/lib/checkout";

export async function buyNow(productId: string, locale: "en" | "ar"): Promise<CheckoutResult> {
  const result = await createCheckoutForProduct(
    {
      db: createAdminClient() as never,
      stripe: new Stripe(process.env.STRIPE_SECRET_KEY!),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    },
    { productId, locale }
  );
  if (result.ok) redirect(result.url); // throws NEXT_REDIRECT
  return result;
}
```

```tsx
// components/buy-now-button.tsx
"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buyNow } from "@/app/[locale]/product/[slug]/actions";

export function BuyNowButton({ productId }: { productId: string }) {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("product");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const r = await buyNow(productId, locale);
          if (r && !r.ok) setError(r.error === "sold_out" ? t("justSold") : "Something went wrong.");
        })}
        className="w-full rounded-[--radius-xl] px-8 py-4 text-lg font-black text-white disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        {pending ? "…" : t("buyNow")}
      </button>
      {error && <p className="mt-2 text-sm font-bold text-[--color-accent]">{error}</p>}
    </div>
  );
}
```

PDP `app/[locale]/product/[slug]/page.tsx`: fetch via `getProductBySlug(await createClient(), slug)`; `notFound()` if missing; render title (locale-aware), artist link, price, description, `<BuyNowButton productId={p.id} />` when status is `available` (or edition with quantity ≥ 1), a SOLD badge otherwise. `export const dynamic = "force-dynamic"` (stock state must never be stale-cached).

- [ ] **Step 4: Shop, artists, and success pages**

- `app/[locale]/shop/page.tsx`: grid of `ProductCard` from `getLiveProducts`; `dynamic = "force-dynamic"`.
- `app/[locale]/artists/page.tsx`: cards linking to each artist.
- `app/[locale]/artists/[slug]/page.tsx`: bio + two sections — available works and a **Sold archive** (`status = 'sold'`) rendered with SOLD badges (the authenticity flex).
- `app/[locale]/order/success/page.tsx`: static bilingual thank-you (“check your email for confirmation”). Do not mark anything paid here — webhook owns state.

- [ ] **Step 5: Playwright smoke test**

`playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true },
});
```

`e2e/smoke.spec.ts`:

```ts
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
```

Run: `pnpm test:e2e` (with `pnpm supabase start` running and `.env.local` pointing at local Supabase). Expected: 2 passed.

- [ ] **Step 6: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: bilingual storefront with immersive hero, shop, race-safe buy now, artist pages"
```

---

### Task 9: Admin panel — gate, product CRUD, order fulfillment

**Files:**
- Create: `lib/utils.ts`, `lib/utils.test.ts`, `lib/actions/auth.ts`, `lib/actions/products.ts`, `lib/actions/products.test.ts`, `lib/actions/orders.ts`, `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/auth/callback/route.ts`, `app/admin/page.tsx`, `app/admin/products/page.tsx`, `app/admin/products/new/page.tsx`, `app/admin/orders/page.tsx`

**Interfaces:**
- Consumes: `createClient`/`createAdminClient` (Task 4), `buildStubClient` (Task 4).
- Produces: `isAdminEmail(email): boolean`; `requireAdmin()` (throws `AuthError("not_authenticated" | "forbidden")`, returns `{ admin }` service-role client); server actions returning `{ ok: true, data } | { ok: false, error }` (dobeu discriminated-result convention): `createProduct`, `updateProductStatus`, `markOrderFulfilled`.

- [ ] **Step 1: Write the failing tests** — `lib/utils.test.ts`

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { isAdminEmail } from "@/lib/utils";

describe("isAdminEmail", () => {
  beforeEach(() => { process.env.ADMIN_EMAILS = "jeremy@dobeu.net, ops@arabstickers.co"; });
  it("matches case-insensitively and trims", () => {
    expect(isAdminEmail("Jeremy@Dobeu.net")).toBe(true);
    expect(isAdminEmail("ops@arabstickers.co")).toBe(true);
  });
  it("rejects others and empties", () => {
    expect(isAdminEmail("evil@x.co")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify fail, implement `lib/utils.ts`, verify pass**

Run: `pnpm test:ci -- lib/utils.test.ts` → FAIL. Then:

```ts
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}
```

Run again → PASS (2 tests, 5 assertions).

- [ ] **Step 3: Auth guard + login**

```ts
// lib/actions/auth.ts
import "server-only";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export class AuthError extends Error {
  constructor(public code: "not_authenticated" | "forbidden") { super(code); }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AuthError("not_authenticated");
  if (!isAdminEmail(user.email)) throw new AuthError("forbidden");
  return { user, admin: createAdminClient() };
}
```

`app/admin/layout.tsx`: call `requireAdmin()` in a try/catch; on `AuthError` `redirect("/admin/login")`. Render a plain sidebar (Products / Orders) — no locale routing here (middleware already excludes `/admin`).

`app/admin/login/page.tsx`: client component with an email input; calls `createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/admin` } })`; shows "check your email."

`app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
```

- [ ] **Step 4: Product CRUD actions (TDD)** — `lib/actions/products.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { createProductCore } from "@/lib/actions/products";
import { buildStubClient } from "@/lib/__test-helpers";

describe("createProductCore", () => {
  it("validates and inserts a product", async () => {
    const db = buildStubClient({ products: { data: { id: "p9" }, error: null } });
    const result = await createProductCore(db as never, {
      slug: "new-piece", artist_id: "a1", title_en: "New Piece", title_ar: "قطعة جديدة",
      price_cents: 5000, fulfillment_type: "original", quantity: 1,
    });
    expect(result.ok).toBe(true);
    expect(db.calls["products.insert"]).toHaveLength(1);
  });

  it("rejects invalid input without touching the db", async () => {
    const db = buildStubClient({});
    const result = await createProductCore(db as never, { slug: "", price_cents: -5 } as never);
    expect(result.ok).toBe(false);
    expect(db.from).not.toHaveBeenCalled();
  });
});
```

Run → FAIL. Implement `lib/actions/products.ts`:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/auth";

const productInput = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  artist_id: z.string().uuid(),
  title_en: z.string().min(1),
  title_ar: z.string().min(1),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  price_cents: z.number().int().positive(),
  fulfillment_type: z.enum(["original", "edition", "pod"]),
  quantity: z.number().int().min(0),
});

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

// Pure core, testable with a stub client (no auth inside).
export async function createProductCore(
  db: { from: (t: string) => any },
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = productInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const { data, error } = await db.from("products")
    .insert({ ...parsed.data, status: "draft" }).select().single();
  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function createProduct(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const { admin } = await requireAdmin();
  const result = await createProductCore(admin as never, raw);
  if (result.ok) revalidatePath("/admin/products");
  return result;
}

export async function updateProductStatus(
  id: string,
  status: "draft" | "available" | "archived"
): Promise<ActionResult<null>> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("products").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true, data: null };
}
```

Run → PASS (2 tests).

- [ ] **Step 5: Orders action + admin pages**

`lib/actions/orders.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/products";

export async function markOrderFulfilled(
  id: string,
  tracking: { tracking_number: string; carrier: string }
): Promise<ActionResult<null>> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("orders")
    .update({ status: "fulfilled", ...tracking }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true, data: null };
}
```

Admin pages are plain tables/forms (no design flourish needed): `/admin/products` lists all products with status dropdown wired to `updateProductStatus`; `/admin/products/new` posts a form to `createProduct` (image upload Phase 1 = paste a Supabase Storage URL after uploading via Supabase Studio; signed-URL browser upload is a Phase 2 nicety); `/admin/orders` lists orders newest-first with a fulfill form (tracking number + carrier) wired to `markOrderFulfilled`.

- [ ] **Step 6: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: admin panel with email-gated auth, product CRUD, order fulfillment"
```

---

### Task 10: Consent-gated analytics + email capture

**Files:**
- Create: `lib/analytics.ts`, `components/cookie-consent.tsx`, `lib/actions/subscribe.ts`, `lib/actions/subscribe.test.ts`, `components/subscribe-form.tsx`, `components/analytics-provider.tsx`
- Modify: `app/[locale]/layout.tsx` (mount provider + banner), footer of storefront pages (subscribe form)

**Interfaces:**
- Consumes: `buildStubClient` (Task 4), theme classes (Task 3).
- Produces: `initAnalytics(consent: boolean)` and `track(event: string, props?: Record<string, unknown>)` — both hard no-ops until consent; `subscribeCore(db, raw)` → `ActionResult<null>`; `<CookieConsent />` banner and `<SubscribeForm />`.

- [ ] **Step 1: Write the failing tests** — `lib/actions/subscribe.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { subscribeCore } from "@/lib/actions/subscribe";
import { buildStubClient } from "@/lib/__test-helpers";

describe("subscribeCore", () => {
  it("upserts a valid email with locale", async () => {
    const db = buildStubClient({ subscribers: { data: null, error: null } });
    const r = await subscribeCore(db as never, { email: "fan@example.com", locale: "ar" });
    expect(r.ok).toBe(true);
    expect(db.calls["subscribers.upsert"]).toHaveLength(1);
  });
  it("rejects garbage emails without touching the db", async () => {
    const db = buildStubClient({});
    const r = await subscribeCore(db as never, { email: "not-an-email", locale: "en" });
    expect(r.ok).toBe(false);
    expect(db.from).not.toHaveBeenCalled();
  });
});
```

Run: `pnpm test:ci -- lib/actions/subscribe.test.ts` → FAIL.

- [ ] **Step 2: Implement `lib/actions/subscribe.ts`**

```ts
"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/products";

const input = z.object({ email: z.string().email(), locale: z.enum(["en", "ar"]) });

export async function subscribeCore(
  db: { from: (t: string) => any },
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_email" };
  const { error } = await db.from("subscribers")
    .upsert({ email: parsed.data.email.toLowerCase(), locale: parsed.data.locale }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}

export async function subscribe(raw: unknown): Promise<ActionResult<null>> {
  return subscribeCore(createAdminClient() as never, raw);
}
```

Run → PASS (2 tests). (Mirroring to a Resend Audience is a one-line non-fatal add inside `subscribe` once the Audience ID exists — add `// resend.contacts.create` behind `RESEND_AUDIENCE_ID` env presence.)

- [ ] **Step 3: Consent-gated analytics** — `lib/analytics.ts`

```ts
"use client";

let enabled = false;
let posthog: { capture: (e: string, p?: Record<string, unknown>) => void; init: (k: string, o: Record<string, unknown>) => void } | null = null;

export async function initAnalytics(consent: boolean): Promise<void> {
  if (!consent || enabled) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // feature-flagged by env presence
  const mod = await import("posthog-js");
  posthog = mod.default;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    persistence: "localStorage+cookie",
  });
  enabled = true;
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!enabled || !posthog) return; // hard no-op before consent
  posthog.capture(event, props);
}
```

(Adds dependency: `pnpm add posthog-js`.) Canonical events fired from the storefront: `product_view` (PDP mount), `buy_click` (BuyNowButton), `sold_out_hit` (justSold error shown), `email_subscribed` (SubscribeForm success). `purchase` is captured **server-side** later via PostHog's Node lib in the webhook — Phase 2; note it in code with a comment, not a TODO task.

- [ ] **Step 4: Consent banner + provider + subscribe form**

`components/cookie-consent.tsx`: client component; reads/writes a `cookie_consent` cookie (`"accepted" | "declined"`, 180-day max-age, `document.cookie`); renders a fixed bottom `.glass-strong` bar with bilingual copy (use `useTranslations`, add `consent.message`, `consent.accept`, `consent.decline` keys to both message files) and two buttons; on accept calls `initAnalytics(true)`; hidden once a choice exists.

`components/analytics-provider.tsx`: client component mounted in the locale layout; on mount, if `cookie_consent=accepted`, calls `initAnalytics(true)` (returning visitors).

`components/subscribe-form.tsx`: client form (email input + button, `.glass` styling) calling the `subscribe` server action, success state shows `footer.subscribed`, fires `track("email_subscribed")`. Mount it in a site footer on home and shop pages.

- [ ] **Step 5: Verify and commit**

Run: `pnpm verify` — Expected: PASS.

```bash
git add -A && git commit -m "feat: consent-gated analytics with posthog, cookie banner, email capture"
```

---

### Task 11: Deploy to Vercel + Stripe/Supabase production wiring

**Files:**
- Create: `vercel.json` (optional; defaults fine), `docs/DEPLOYMENT.md`
- Modify: none

**Interfaces:**
- Consumes: everything.
- Produces: live production site; Stripe webhook endpoint registered; manual smoke checklist run.

- [ ] **Step 1: Create the production Supabase project and push schema**

```bash
pnpm supabase link --project-ref <new-project-ref>
pnpm supabase db push
```

Expected: migration applies cleanly; verify tables + RPCs in the Supabase dashboard.

- [ ] **Step 2: Create Vercel project and set env vars**

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add ADMIN_EMAILS production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel --prod
```

- [ ] **Step 3: Register the Stripe webhook**

In the Stripe dashboard (test mode first): add endpoint `https://<domain>/api/webhooks/stripe`, events `checkout.session.completed` and `checkout.session.expired`. Copy the signing secret:

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
vercel --prod
```

- [ ] **Step 4: Manual production smoke checklist (Stripe test mode)**

1. `/en` and `/ar` render; `dir="rtl"` on Arabic; theme toggle persists.
2. Buy the seeded original with card `4242 4242 4242 4242` → redirected to success page → product shows SOLD on `/shop` → order appears in `/admin/orders` → confirmation email received (buyer + admin).
3. Start a checkout on a second browser for the same original **before paying** in the first → second buyer sees "Someone just bought this piece."
4. Abandon a checkout → after ~31 min the piece returns to `available` (session expired webhook).
5. Buy the edition twice → quantity drops 50 → 48.
6. Cookie banner: decline → no PostHog network requests; accept → `product_view` events arrive.
7. Admin login via magic link works for an `ADMIN_EMAILS` address and 403-redirects for others.

- [ ] **Step 5: Switch Stripe to live keys, final commit**

```bash
git add -A && git commit -m "chore: production deployment wiring and smoke checklist"
git push
```

---

## Out of scope for this plan (next plans)

- **Phase 2 plan:** customer accounts + order history, make-an-offer flow, Printful POD + variants, signed-URL admin image upload, personalization rails, server-side purchase analytics, Customer.io segmentation.
- **Phase 3 plan:** meme/social page, drop scheduler + on-site countdown, offer expiry automation.
- **GTM workstream:** see `docs/superpowers/specs/2026-07-15-arab-stickers-gtm-brand.md` — logo/brand creation, brand-voice enforcement, Adobe Express social variations pipeline, Reddit-first channel plan, Nimble brand-mention monitoring cadence.
