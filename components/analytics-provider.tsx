"use client";
import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    const accepted = /(?:^|;\s*)cookie_consent=accepted/.test(document.cookie);
    if (accepted) void initAnalytics(true);
  }, []);
  return null;
}
