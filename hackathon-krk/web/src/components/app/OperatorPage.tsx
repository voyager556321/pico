"use client";

import { Panel } from "@/components/app/ui";

export function OperatorPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="app-page-title text-[2rem] leading-none">Operator tools</h1>
      <div role="status">
        <Panel className="mt-6">
          <h2 className="text-lg font-semibold">Temporarily unavailable</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Task assignment and payout controls are paused while fiat payments are being integrated.
          </p>
        </Panel>
      </div>
    </div>
  );
}
