"use client";

import Image from "next/image";
import { useCallback, useRef, useSyncExternalStore, type PointerEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductRow } from "@/lib/catalog";
import { resolveProductImageUrl } from "@/lib/media";

const fulfillmentGradient: Record<string, string> = {
  original:
    "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 55%, transparent), color-mix(in oklab, var(--color-accent-2) 45%, transparent))",
  edition:
    "linear-gradient(135deg, color-mix(in oklab, var(--color-accent-2) 55%, transparent), color-mix(in oklab, var(--color-accent) 35%, transparent))",
  pod: "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 40%, transparent), color-mix(in oklab, var(--color-surface-2) 60%, transparent))",
};

function subscribeReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function SpatialStage({ featured }: { featured?: ProductRow | null }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const imageUrl = featured ? resolveProductImageUrl(featured.images) : null;

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (reduced || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      rootRef.current.style.setProperty("--px", String(px.toFixed(3)));
      rootRef.current.style.setProperty("--py", String(py.toFixed(3)));
    },
    [reduced],
  );

  const onPointerLeave = useCallback(() => {
    if (!rootRef.current) return;
    rootRef.current.style.setProperty("--px", "0");
    rootRef.current.style.setProperty("--py", "0");
  }, []);

  const ticker = [t("tickerA"), t("tickerB"), t("tickerC"), t("tickerD")];
  const title = featured
    ? locale === "ar"
      ? featured.title_ar
      : featured.title_en
    : null;

  const art = featured ? (
    <div className="spatial-art glass-strong relative">
      <Link href={`/product/${featured.slug}`} className="block">
        <div className="spatial-art-media bg-[--color-surface-2]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title ?? t("featuredLabel")}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  fulfillmentGradient[featured.fulfillment_type] ??
                  fulfillmentGradient.original,
              }}
            />
          )}
          <span className="absolute start-4 top-4 z-10 rounded-full bg-[--color-fg] px-3 py-1 text-xs font-bold text-[--color-surface]">
            {featured.fulfillment_type === "original" ? t("badge") : t("featuredLabel")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest opacity-50">{t("featuredLabel")}</p>
            <h2 className="font-display mt-1 truncate text-lg font-bold">{title}</h2>
          </div>
          <span className="font-display shrink-0 text-2xl font-extrabold text-[--color-accent]">
            ${(featured.price_cents / 100).toFixed(0)}
          </span>
        </div>
      </Link>
    </div>
  ) : null;

  return (
    <div className="spatial-scroll">
      <div
        ref={rootRef}
        className="spatial-sticky spatial-parallax-root"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div className="spatial-layer spatial-layer--far" aria-hidden>
          <div className="spatial-plane" />
          <div className="mesh-a" />
          <div className="mesh-b" />
          <div className="grain" />
        </div>

        <div className="spatial-layer spatial-layer--mid" aria-hidden>
          <div className="pointer-events-none absolute inset-x-0 top-[38%] select-none text-center">
            <span className="font-display text-[22vw] font-extrabold leading-none tracking-tighter opacity-[0.06]">
              {t("brandGhost")}
            </span>
          </div>
        </div>

        <div className="spatial-layer spatial-layer--near">
          {art}
          <div className="spatial-copy reveal">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[--color-accent]">
              {t("brand")}
            </p>
            <span className="chip mt-4">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-[--color-accent] ${reduced ? "" : "animate-pulse"}`}
              />
              {t("eyebrow")}
            </span>
            <h1 className="font-display mt-6 text-5xl font-extrabold leading-[0.92] text-balance sm:text-6xl lg:text-7xl xl:text-8xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed opacity-70">{t("subtitle")}</p>
            <div className="reveal reveal-2 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-accent">
                {t("cta")} <span aria-hidden>→</span>
              </Link>
              <Link href="/artists" className="btn-ghost">
                {t("cta2")}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 border-y border-[--color-fg]/10 bg-[--color-surface]/60 backdrop-blur">
          <div className="marquee py-3" aria-hidden="true">
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
      </div>
    </div>
  );
}
