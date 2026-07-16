import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductRow } from "@/lib/catalog";

const fulfillmentGradient: Record<string, string> = {
  original:
    "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 55%, transparent), color-mix(in oklab, var(--color-accent-2) 45%, transparent))",
  edition:
    "linear-gradient(135deg, color-mix(in oklab, var(--color-accent-2) 55%, transparent), color-mix(in oklab, var(--color-accent) 35%, transparent))",
  pod: "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 40%, transparent), color-mix(in oklab, var(--color-surface-2) 60%, transparent))",
};

export function Hero({ featured }: { featured?: ProductRow | null }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const ticker = [t("tickerA"), t("tickerB"), t("tickerC"), t("tickerD")];

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden pt-24">
      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="mesh-a" />
        <div className="mesh-b" />
        <div className="grain" />
      </div>

      {/* oversized ghost wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[42%] -z-10 select-none text-center"
      >
        <span className="font-display text-[24vw] font-extrabold leading-none tracking-tighter opacity-[0.05]">
          IKRAM
        </span>
      </div>

      <div className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          {/* copy */}
          <div className="reveal">
            <span className="chip">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[--color-accent]" />
              {t("eyebrow")}
            </span>
            <h1 className="font-display mt-6 text-6xl font-extrabold leading-[0.92] text-balance sm:text-7xl lg:text-8xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed opacity-70">
              {t("subtitle")}
            </p>
            <div className="reveal reveal-2 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-accent">
                {t("cta")} <span aria-hidden>→</span>
              </Link>
              <Link href="/artists" className="btn-ghost">
                {t("cta2")}
              </Link>
            </div>
          </div>

          {/* featured piece */}
          {featured && (
            <div className="reveal reveal-3 mx-auto w-full max-w-sm">
              <div className="float">
                <Link
                  href={`/product/${featured.slug}`}
                  className="glass-strong group block overflow-hidden"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[--color-surface-2]">
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                      style={{
                        background:
                          fulfillmentGradient[featured.fulfillment_type] ??
                          fulfillmentGradient.original,
                      }}
                    />
                    <span className="absolute start-4 top-4 rounded-full bg-[--color-fg] px-3 py-1 text-xs font-bold text-[--color-surface]">
                      {featured.fulfillment_type === "original" ? t("badge") : t("featuredLabel")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-widest opacity-50">
                        {t("featuredLabel")}
                      </p>
                      <h2 className="font-display mt-1 truncate text-lg font-bold">
                        {locale === "ar" ? featured.title_ar : featured.title_en}
                      </h2>
                    </div>
                    <span className="font-display shrink-0 text-2xl font-extrabold text-[--color-accent]">
                      ${(featured.price_cents / 100).toFixed(0)}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* marquee ticker */}
      <div className="border-y border-[--color-fg]/10 bg-[--color-surface]/60 backdrop-blur">
        <div className="marquee py-3">
          <div className="marquee-track font-display text-sm font-bold uppercase tracking-widest">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0">
                {ticker.map((word, i) => (
                  <span key={`${copy}-${i}`} className="mx-6 flex items-center gap-6">
                    <span>{word}</span>
                    <span className="text-[--color-accent]">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
