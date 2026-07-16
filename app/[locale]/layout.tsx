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
import { ScrollAtmosphere } from "@/components/scroll-atmosphere";
import { Syne, Rubik } from "next/font/google";
import "../globals.css";

const fontDisplay = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const fontBody = Rubik({
  subsets: ["latin", "arabic"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  const title = ar ? "إكرام" : "Ikram & Co.";
  const description = ar
    ? "أعمال فنية أصلية وإصدارات محدودة وملصقات من فنانين مستقلين. قطعة واحدة فقط."
    : "Original art, limited editions, and stickers from independent artists. One of one.";
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
    <html
      lang={locale}
      dir={localeDir(locale)}
      className={`${fontDisplay.variable} ${fontBody.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>
            <AnalyticsProvider />
            <ScrollAtmosphere />
            <div className="site-shell">
              <SiteHeader />
              {children}
              <SiteFooter />
            </div>
            <CookieConsent />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
