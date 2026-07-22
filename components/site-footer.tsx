import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SubscribeForm } from "@/components/subscribe-form";

export function SiteFooter() {
  const t = useTranslations("footer");
  const brand = useTranslations("brand");
  return (
    <footer className="mt-24 border-t border-[--color-border]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-lg font-semibold tracking-tight">
              {brand("name")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[--color-muted]">{t("tagline")}</p>
          </div>

          <nav className="text-sm">
            <h3 className="mb-3 font-semibold">{t("shopHeading")}</h3>
            <ul className="space-y-2 text-[--color-muted]">
              <li>
                <Link href="/shop" className="hover:text-[--color-fg]">
                  {t("shop")}
                </Link>
              </li>
              <li>
                <Link href="/artists" className="hover:text-[--color-fg]">
                  {t("artists")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="text-sm">
            <h3 className="mb-3 font-semibold">{t("companyHeading")}</h3>
            <ul className="space-y-2 text-[--color-muted]">
              <li>
                <Link href="/about" className="hover:text-[--color-fg]">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[--color-fg]">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[--color-fg]">
                  {t("faq")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="text-sm">
            <h3 className="mb-3 font-semibold">{t("legalHeading")}</h3>
            <ul className="space-y-2 text-[--color-muted]">
              <li>
                <Link href="/tos" className="hover:text-[--color-fg]">
                  {t("tos")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[--color-fg]">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[--color-fg]">
                  {t("cookies")}
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-[--color-fg]">
                  {t("refunds")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[--color-fg]">
                  {t("shipping")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 max-w-md">
          <SubscribeForm />
        </div>

        <p className="mt-12 text-xs text-[--color-muted]">{t("rights")}</p>
      </div>
    </footer>
  );
}
