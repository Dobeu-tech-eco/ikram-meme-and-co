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
  return (
    <button
      aria-label="Toggle theme"
      className="glass px-3 py-2 text-sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
