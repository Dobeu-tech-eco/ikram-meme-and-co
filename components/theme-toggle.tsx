"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Intentional one-time mount flag to avoid SSR/client hydration mismatch
    // for next-themes' resolvedTheme (unknown until after hydration).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={t("toggle")}
      className="chip"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (isDark ? t("light") : t("dark")) : t("toggle")}
    </button>
  );
}
