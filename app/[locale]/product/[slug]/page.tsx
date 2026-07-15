import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/catalog";
import { BuyNowButton } from "@/components/buy-now-button";
import { Link } from "@/i18n/navigation";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = (await createClient()) as unknown as Db;
  const p = await getProductBySlug(db, slug);
  if (!p) notFound();

  const locale = await getLocale();
  const t = await getTranslations("product");
  const isAr = locale === "ar";
  const sold = p.status === "sold" || (p.fulfillment_type === "edition" && p.quantity < 1);
  const buyable = !sold && (p.status === "available" || (p.fulfillment_type === "edition" && p.quantity > 0));
  const artist = p.artists ?? null;

  return (
    <main className="mx-auto max-w-5xl px-4 pt-28 pb-24">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="glass aspect-square bg-[--color-surface-2]" />
        <div>
          <h1 className="text-3xl font-black">{isAr ? p.title_ar : p.title_en}</h1>
          {artist && (
            <p className="mt-2 opacity-80">
              {t("by")}{" "}
              <Link href={`/artists/${artist.slug}`} className="font-bold underline">
                {isAr ? artist.name_ar : artist.name_en}
              </Link>
            </p>
          )}
          <p className="mt-4 text-2xl font-black text-[--color-accent]">
            ${(p.price_cents / 100).toFixed(0)}
          </p>
          {(isAr ? p.description_ar : p.description_en) && (
            <p className="mt-4 leading-relaxed opacity-90">
              {isAr ? p.description_ar : p.description_en}
            </p>
          )}
          <div className="mt-8">
            {buyable ? (
              <BuyNowButton productId={p.id} />
            ) : (
              <span
                className="inline-block rounded-full px-4 py-2 text-sm font-black text-white"
                style={{ background: "var(--color-accent)" }}
              >
                {t("sold")}
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
