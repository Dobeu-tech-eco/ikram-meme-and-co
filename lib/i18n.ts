export type Locale = "en" | "ar";
export const localeDir = (locale: string): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";
