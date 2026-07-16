import { Hero } from "@/components/landing/hero";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import { getLiveProducts } from "@/lib/catalog";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = (await createClient()) as unknown as Db;
  const products = await getLiveProducts(db);
  const t = await getTranslations("home");
  const featured = products[0] ?? null;
  const rest = products.slice(1, 7);
  return (
    <>
      <Hero featured={featured} />
      {rest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{t("dropTitle")}</h2>
            <Link
              href="/shop"
              className="shrink-0 text-sm font-bold text-[--color-accent] hover:underline"
            >
              {t("viewAll")} <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
