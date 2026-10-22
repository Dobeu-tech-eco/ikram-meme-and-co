"use client";

import { useSyncExternalStore } from "react";

const SCROLL_THRESHOLD_PX = 24;

export function isScrolled(scrollY: number, threshold: number): boolean {
  return scrollY > threshold;
}

function subscribeScroll(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getScrolledSnapshot(threshold: number) {
  if (typeof window === "undefined") return false;
  return isScrolled(window.scrollY, threshold);
}

/**
 * True once the document has scrolled past `threshold` px.
 * SSR-safe via useSyncExternalStore (server snapshot = false).
 */
export function useScrolled(threshold = SCROLL_THRESHOLD_PX): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => getScrolledSnapshot(threshold),
    () => false,
  );
}
