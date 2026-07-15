import { Hero } from "@/components/landing/hero";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import { getLiveProducts } from "@/lib/catalog";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = (await createClient()) as unknown as Db;
  const products = await getLiveProducts(db);
  return (
    <>
      <Hero />
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
