import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/catalog";
import { BuyNowButton } from "@/components/buy-now-button";
import { ProductImage } from "@/components/product-image";
import { ProductScarcity, ProductTypeBadge } from "@/components/product-type-badge";
import { isProductBuyable } from "@/lib/product-merch";
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
  const title = isAr ? p.title_ar : p.title_en;
  const buyable = isProductBuyable(p);
  const artist = p.artists ?? null;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductImage
          images={p.images}
          alt={title}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div>
          <div className="mb-3">
            <ProductTypeBadge p={p} />
          </div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
          {artist && (
            <p className="mt-2 text-[--color-muted]">
              {t("by")}{" "}
              <Link href={`/artists/${artist.slug}`} className="font-semibold text-[--color-fg] underline-offset-4 hover:underline">
                {isAr ? artist.name_ar : artist.name_en}
              </Link>
            </p>
          )}
          <p className="mt-4 text-2xl font-semibold tabular-nums">
            ${(p.price_cents / 100).toFixed(0)}
          </p>
          <div className="mt-2">
            <ProductScarcity p={p} />
          </div>
          {(isAr ? p.description_ar : p.description_en) && (
            <p className="mt-6 leading-relaxed text-[--color-muted]">
              {isAr ? p.description_ar : p.description_en}
            </p>
          )}
          <div className="mt-8">
            {buyable ? (
              <BuyNowButton productId={p.id} />
            ) : (
              <span className="inline-block border border-[--color-border] px-4 py-2 text-sm font-semibold tracking-wide text-[--color-accent]">
                {t("sold")}
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
