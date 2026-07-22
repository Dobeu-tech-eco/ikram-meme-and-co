import { createClient } from "@/lib/supabase/server";
import { getLiveProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ShopFilters, parseShopType } from "@/components/shop-filters";
import { getTranslations } from "next-intl/server";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const db = (await createClient()) as unknown as Db;
  const products = await getLiveProducts(db);
  const t = await getTranslations("nav");
  const tShop = await getTranslations("shop");
  const params = await searchParams;
  const active = parseShopType(params.type);
  const filtered =
    active === "all"
      ? products
      : products.filter((p) => p.fulfillment_type === active);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <h1 className="font-display mb-6 text-3xl font-semibold sm:text-4xl">{t("shop")}</h1>
      <ShopFilters active={active} />
      {filtered.length === 0 ? (
        <p className="text-[--color-muted]">{tShop("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
