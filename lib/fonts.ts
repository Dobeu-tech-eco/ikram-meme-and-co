import { Fraunces, Source_Sans_3, Noto_Naskh_Arabic } from "next/font/google";

/** Latin display — editorial gallery titles. */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** Latin body. */
export const fontBody = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Arabic display + body pairing. */
export const fontArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const fontVariableClassName = [
  fontDisplay.variable,
  fontBody.variable,
  fontArabic.variable,
].join(" ");
