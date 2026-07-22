import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const locale = useLocale();
  const other = locale === "ar" ? "en" : "ar";
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[--color-border] bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight sm:text-xl">
          {brand("name")}
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/shop" className="hover:text-[--color-accent]">
            {t("shop")}
          </Link>
          <Link href="/artists" className="hover:text-[--color-accent]">
            {t("artists")}
          </Link>
          <a
            href={`/${other}`}
            className="chip"
            aria-label={other === "ar" ? "العربية" : "English"}
          >
            {other === "ar" ? "عربي" : "EN"}
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
