import { createClient } from "@/lib/supabase/server";
import { getLiveProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { getTranslations } from "next-intl/server";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const db = (await createClient()) as unknown as Db;
  const products = await getLiveProducts(db);
  const t = await getTranslations("nav");
  return (
    <main className="mx-auto max-w-6xl px-4 pt-28 pb-24">
      <h1 className="mb-8 text-3xl font-black">{t("shop")}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </main>
  );
}
