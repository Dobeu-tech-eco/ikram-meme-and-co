"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SubscribeForm } from "@/components/subscribe-form";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-24 border-t border-[--color-accent]/15">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <BrandLogo />
            <p className="mt-3 text-sm opacity-70 leading-relaxed">{t("tagline")}</p>
          </div>

          <nav className="text-sm">
            <h3 className="mb-3 font-bold">{t("shopHeading")}</h3>
            <ul className="space-y-2 opacity-80">
              <li><Link href="/shop" className="hover:opacity-100">{t("shop")}</Link></li>
              <li><Link href="/artists" className="hover:opacity-100">{t("artists")}</Link></li>
            </ul>
          </nav>

          <nav className="text-sm">
            <h3 className="mb-3 font-bold">{t("companyHeading")}</h3>
            <ul className="space-y-2 opacity-80">
              <li><Link href="/about" className="hover:opacity-100">{t("about")}</Link></li>
              <li><Link href="/contact" className="hover:opacity-100">{t("contact")}</Link></li>
              <li><Link href="/faq" className="hover:opacity-100">{t("faq")}</Link></li>
            </ul>
          </nav>

          <nav className="text-sm">
            <h3 className="mb-3 font-bold">{t("legalHeading")}</h3>
            <ul className="space-y-2 opacity-80">
              <li><Link href="/tos" className="hover:opacity-100">{t("tos")}</Link></li>
              <li><Link href="/privacy" className="hover:opacity-100">{t("privacy")}</Link></li>
              <li><Link href="/cookies" className="hover:opacity-100">{t("cookies")}</Link></li>
              <li><Link href="/refunds" className="hover:opacity-100">{t("refunds")}</Link></li>
              <li><Link href="/shipping" className="hover:opacity-100">{t("shipping")}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 max-w-md">
          <SubscribeForm />
        </div>

        <p className="mt-12 text-xs opacity-60">{t("rights")}</p>
      </div>
    </footer>
  );
}
