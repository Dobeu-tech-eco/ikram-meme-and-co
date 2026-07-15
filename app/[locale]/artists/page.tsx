import { createClient } from "@/lib/supabase/server";
import { getArtists } from "@/lib/catalog";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const db = (await createClient()) as unknown as Db;
  const artists = await getArtists(db);
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const isAr = locale === "ar";
  return (
    <main className="mx-auto max-w-6xl px-4 pt-28 pb-24">
      <h1 className="mb-8 text-3xl font-black">{t("artists")}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((a) => (
          <Link key={a.id} href={`/artists/${a.slug}`} className="glass block p-6">
            <div className="mb-4 aspect-square rounded-[--radius-xl] bg-[--color-surface-2]" />
            <h2 className="text-xl font-bold">{isAr ? a.name_ar : a.name_en}</h2>
            {(isAr ? a.bio_ar : a.bio_en) && (
              <p className="mt-2 line-clamp-3 text-sm opacity-80">
                {isAr ? a.bio_ar : a.bio_en}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
