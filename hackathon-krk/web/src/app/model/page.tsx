"use client";

import { LiveBoard } from "@/components/app/LiveBoard";

export default function ModelPage() {
  return (
    <main className="app-dark min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          Workspace
        </p>
        <h1 className="app-page-title mt-1.5 text-[2rem]">Hiring</h1>
        <p className="mt-2 max-w-xl text-[15px] text-[var(--app-muted)]">
          Bots enter as the tasks open. Statuses move on the board while you watch, then the next round starts.
        </p>
        <div className="mt-6">
          <LiveBoard />
        </div>
      </div>
    </main>
  );
}
