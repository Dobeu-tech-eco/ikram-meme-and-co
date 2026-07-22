import { Hero } from "@/components/landing/hero";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import { getLiveProducts } from "@/lib/catalog";
import { getProductImageUrl } from "@/lib/product-merch";
import { getLocale, getTranslations } from "next-intl/server";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = (await createClient()) as unknown as Db;
  const products = await getLiveProducts(db);
  const locale = await getLocale();
  const brand = await getTranslations("brand");
  const featured = products[0];
  const imageUrl = featured ? getProductImageUrl(featured.images) : null;
  const imageAlt = featured
    ? locale === "ar"
      ? featured.title_ar
      : featured.title_en
    : undefined;

  return (
    <>
      <Hero brandName={brand("name")} imageUrl={imageUrl} imageAlt={imageAlt} />
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
