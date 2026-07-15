"use client";

let enabled = false;
let posthog: {
  capture: (e: string, p?: Record<string, unknown>) => void;
  init: (k: string, o: Record<string, unknown>) => void;
} | null = null;

export async function initAnalytics(consent: boolean): Promise<void> {
  if (!consent || enabled) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // feature-flagged by env presence
  const mod = await import("posthog-js");
  posthog = mod.default as unknown as typeof posthog;
  posthog!.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    persistence: "localStorage+cookie",
  });
  enabled = true;
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!enabled || !posthog) return; // hard no-op before consent
  posthog.capture(event, props);
}

// NOTE: `purchase` is captured server-side later (PostHog Node lib in the Stripe
// webhook) so it survives ad-blockers — Phase 2.
