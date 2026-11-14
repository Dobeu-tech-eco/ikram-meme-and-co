"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Intentional one-time mount flag to avoid SSR/client hydration mismatch
    // for next-themes' resolvedTheme (unknown until after hydration).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const nextLabel = isDark ? "Light" : "Dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextLabel} theme`}
      className="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? nextLabel : "Theme"}
    </button>
  );
}
