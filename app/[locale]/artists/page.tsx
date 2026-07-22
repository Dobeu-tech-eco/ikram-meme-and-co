import { createClient } from "@/lib/supabase/server";
import { getArtists } from "@/lib/catalog";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Db } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const db = (await createClient()) as unknown as Db;
  const artists = await getArtists(db);
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const isAr = locale === "ar";
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <h1 className="font-display mb-8 text-3xl font-semibold sm:text-4xl">{t("artists")}</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((a) => {
          const name = isAr ? a.name_ar : a.name_en;
          const photo =
            a.photo_url &&
            (a.photo_url.startsWith("http://") ||
              a.photo_url.startsWith("https://") ||
              a.photo_url.startsWith("/"))
              ? a.photo_url
              : null;
          return (
            <Link key={a.id} href={`/artists/${a.slug}`} className="group block">
              <div className="frame relative mb-4 aspect-square overflow-hidden">
                {photo ? (
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={photo.startsWith("http")}
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs tracking-wide text-[--color-muted]">
                    {name}
                  </div>
                )}
              </div>
              <h2 className="font-display text-xl font-semibold">{name}</h2>
              {(isAr ? a.bio_ar : a.bio_en) && (
                <p className="mt-2 line-clamp-3 text-sm text-[--color-muted]">
                  {isAr ? a.bio_ar : a.bio_en}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
