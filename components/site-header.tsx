"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { useScrolled } from "@/lib/hooks/use-scrolled";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const locale = useLocale();
  const other = locale === "ar" ? "en" : "ar";
  const scrolled = useScrolled();

  return (
    <header
      className={`site-header glass-nav ${scrolled ? "site-header--scrolled" : ""}`}
      data-scrolled={scrolled ? "true" : "false"}
    >
      <Link href="/" className="site-header__brand" aria-label={locale === "ar" ? "إكرام" : "Ikram & Co."}>
        <BrandLogo compact={scrolled} />
      </Link>
      <nav className="site-header__nav" aria-label={tA11y("primaryNav")}>
        <Link href="/shop" className="site-header__link">
          {t("shop")}
        </Link>
        <Link href="/artists" className="site-header__link">
          {t("artists")}
        </Link>
        <a href={`/${other}`} className="site-header__chip" aria-label="Switch language">
          {other === "ar" ? "عربي" : "EN"}
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
