import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localeDir } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieConsent } from "@/components/cookie-consent";
import "../globals.css";

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
            <CookieConsent />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
