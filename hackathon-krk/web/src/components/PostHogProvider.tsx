"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/* Cookieless, anonymous PostHog setup: cookieless server-hash mode (no cookies or storage,
   one anonymous id per visitor per day so funnels work), no session recording, no person profiles. */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!token || posthog.__loaded) return;
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      cookieless_mode: "always",
      person_profiles: "identified_only",
      disable_session_recording: true,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    });
  }, []);
  return <>{children}</>;
}
