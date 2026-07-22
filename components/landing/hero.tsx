import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  brandName: string;
  imageUrl?: string | null;
  imageAlt?: string;
};

export function Hero({ brandName, imageUrl, imageAlt }: Props) {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-svh overflow-hidden">
      <div className="absolute inset-0" aria-hidden={!imageUrl}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            unoptimized={imageUrl.startsWith("http")}
            className="animate-gallery-fade object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[--color-surface-2]" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in oklab, var(--color-fg) 72%, transparent) 0%, color-mix(in oklab, var(--color-fg) 28%, transparent) 45%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col justify-end px-6 pb-16 pt-28 sm:px-10 sm:pb-20">
        <div className="animate-gallery-reveal mx-auto w-full max-w-6xl text-white">
          <p className="font-display text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl">
            {brandName}
          </p>
          <p className="mt-4 max-w-xl text-balance text-base opacity-90 sm:text-lg">
            {t("title")}
          </p>
          <Link
            href="/shop"
            className="btn-primary mt-8 inline-block px-8 py-3.5 text-sm tracking-wide"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
