import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getArtistWithWorks } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = (await createClient()) as unknown as Db;
  const data = await getArtistWithWorks(db, slug);
  if (!data) notFound();

  const { artist, works } = data;
  const locale = await getLocale();
  const t = await getTranslations("artists");
  const isAr = locale === "ar";
  const available = works.filter((w) => w.status !== "sold");
  const soldArchive = works.filter((w) => w.status === "sold");

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-semibold">
          {isAr ? artist.name_ar : artist.name_en}
        </h1>
        {(isAr ? artist.bio_ar : artist.bio_en) && (
          <p className="mt-3 max-w-2xl leading-relaxed text-[--color-muted]">
            {isAr ? artist.bio_ar : artist.bio_en}
          </p>
        )}
      </header>

      {available.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display mb-6 text-2xl font-semibold">{t("available")}</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {soldArchive.length > 0 && (
        <section>
          <h2 className="font-display mb-6 text-2xl font-semibold text-[--color-muted]">
            {t("soldArchive")}
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {soldArchive.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
