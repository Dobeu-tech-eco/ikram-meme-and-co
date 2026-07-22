"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { initAnalytics } from "@/lib/analytics";

function readConsent(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function writeConsent(value: "accepted" | "declined") {
  const maxAge = 60 * 60 * 24 * 180; // 180 days
  document.cookie = `cookie_consent=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function CookieConsent() {
  const t = useTranslations("consent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Cookie is only readable client-side after mount; revealing the banner here
    // is an intentional one-time sync, not a cascading-render hazard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="panel-raised fixed inset-x-4 bottom-4 z-50 flex flex-wrap items-center justify-between gap-3 px-6 py-4 shadow-sm">
      <p className="text-sm">{t("message")}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            writeConsent("accepted");
            setVisible(false);
            void initAnalytics(true);
          }}
          className="btn-primary px-4 py-2 text-sm"
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={() => {
            writeConsent("declined");
            setVisible(false);
          }}
          className="chip"
        >
          {t("decline")}
        </button>
      </div>
    </div>
  );
}
