import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const other = locale === "ar" ? "en" : "ar";
  return (
    <header className="glass-strong fixed top-4 inset-x-4 z-50 flex items-center justify-between px-6 py-3">
      <Link href="/" className="text-lg font-black tracking-tight">
        Ikram &amp; Co. <span className="text-[--color-accent]">◆</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/shop">{t("shop")}</Link>
        <Link href="/artists">{t("artists")}</Link>
        <a href={`/${other}`} className="glass px-3 py-2" aria-label="Switch language">
          {other === "ar" ? "عربي" : "EN"}
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
