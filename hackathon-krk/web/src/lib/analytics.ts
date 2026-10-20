"use client";

import posthog from "posthog-js";

/** Send an anonymous PostHog event. No-op when PostHog is not configured. Never pass email or free text. */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || typeof window === "undefined") return;
  try {
    posthog.capture(event, props);
  } catch {
    /* analytics must never break the page */
  }
}
