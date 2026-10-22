"use client";

import { useEffect } from "react";
import { clampScrollProgress } from "./scroll-progress";

/**
 * Writes `--scroll-y` (0–1, 4 decimals) and `--scroll-px` on `:root` for CSS parallax.
 * rAF-throttled on scroll and resize.
 */
export function useScrollCssVars(): void {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = clampScrollProgress(window.scrollY, maxScroll);
      root.style.setProperty("--scroll-y", y.toFixed(4));
      root.style.setProperty("--scroll-px", `${window.scrollY.toFixed(0)}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
