"use client";

import { useId } from "react";
import { useLocale } from "next-intl";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

/** Ikram mark + bilingual wordmark for header/footer. */
export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  const locale = useLocale();
  const gradId = useId().replace(/:/g, "");
  const wordmark = locale === "ar" ? "إكرام" : "Ikram & Co.";

  return (
    <span className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${className}`.trim()}>
      <span className="brand-mark" aria-hidden>
        <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none">
          <defs>
            <linearGradient id={gradId} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-accent, #c9922a)" />
              <stop offset="1" stopColor="var(--color-accent-2, #2f7a6b)" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="11"
            fill="color-mix(in oklab, var(--color-surface, #f3f5f7) 35%, transparent)"
          />
          <path
            d="M20 7.5L30.5 20L20 32.5L9.5 20L20 7.5Z"
            stroke={`url(#${gradId})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M20 13.5L25.5 20L20 26.5L14.5 20L20 13.5Z"
            fill={`url(#${gradId})`}
            opacity="0.92"
          />
        </svg>
      </span>
      <span className="brand-wordmark font-display">{wordmark}</span>
    </span>
  );
}
