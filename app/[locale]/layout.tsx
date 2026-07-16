import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localeDir } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieConsent } from "@/components/cookie-consent";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  const title = ar ? "إكرام" : "Ikram & Co.";
  const description = ar
    ? "قطع فنية أصلية وإصدارات محدودة وملصقات من فنانين عرب. قطعة واحدة فقط."
    : "Original art, limited editions, and stickers from real Arab artists. One of one.";
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: { title, description, siteName: title, locale: ar ? "ar" : "en" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>
            <AnalyticsProvider />
            <SiteHeader />
            {children}
            <SiteFooter />
            <CookieConsent />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
