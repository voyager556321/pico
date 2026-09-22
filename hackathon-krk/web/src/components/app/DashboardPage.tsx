"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  baseUnitsToUsdc,
  shortPk,
  skillLabel,
} from "@/lib/constants";
import { useTasks } from "@/lib/hooks";
import { isDefaultPk } from "@/lib/program";
import { useAppMode } from "@/components/app/AppChrome";
import { DemoControls } from "@/components/app/DemoControls";
import { LiveBoard } from "@/components/app/LiveBoard";
import { StatusPill } from "@/components/app/ui";
import { statusTone } from "@/components/app/SlotTable";

type Tab =
  | "all"
  | "Qualifying"
  | "Working"
  | "InReview"
  | "Submitted"
  | "Paid"
  | "HiringSlot";

export function DashboardPage() {
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { tasks, loading, error, reload, bumpDemo } = useTasks();
  const [tab, setTab] = useState<Tab>("all");
  const [live, setLive] = useState(true);

  const scoped = useMemo(() => {
    if (!publicKey) return tasks;
    if (mode === "hiring") {
      return tasks.filter((t) => t.client.equals(publicKey));
    }
    // working: my seats or open qualifying
    return tasks.filter((t) => {
      if (t.status === "Qualifying") return true;
      for (let i = 0; i < t.slotCount; i++) {
        if (
          !isDefaultPk(t.slotHolders[i]) &&
          t.slotHolders[i].equals(publicKey)
        ) {
          return true;
        }
      }
      return false;
    });
  }, [tasks, publicKey, mode]);

  const filtered = useMemo(() => {
    if (tab === "all") return scoped;
    return scoped.filter((t) => t.status === tab);
  }, [scoped, tab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scoped.length };
    for (const t of scoped) {
      c[t.status] = (c[t.status] ?? 0) + 1;
    }
    return c;
  }, [scoped]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "Qualifying", label: "Qualifying" },
    { id: "Working", label: "Working" },
    { id: "InReview", label: "In review" },
    { id: "HiringSlot", label: "Hiring seat" },
    { id: "Submitted", label: "Submitted" },
    { id: "Paid", label: "Paid" },
  ];

  const title = mode === "hiring" ? "Hiring" : "Working";
  const blurb =
    mode === "hiring"
      ? "Tasks you funded — watch the podium fill, slots, and payouts. No tests for clients."
      : "Open qualifies and seats you’re on — timed tests, then Execution or verification.";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
            Workspace
          </p>
          <h1 className="app-page-title mt-1.5 text-[2rem] leading-none sm:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--app-muted)]">
            {blurb}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="app-cta-ghost">
            Find tasks
          </Link>
          <Link href="/app/tasks/new" className="app-cta">
            Post a task
          </Link>
          <button
            type="button"
            onClick={() => setLive(true)}
            className="app-cta"
          >
            Run live
          </button>
          <button
            type="button"
            onClick={() => void reload()}
            className="app-cta-ghost text-[var(--app-muted)]"
          >
            Refresh
          </button>
        </div>
      </div>

      {live ? (
        <div className="mt-6">
          <LiveBoard onClose={() => setLive(false)} />
        </div>
      ) : null}

      <div className={live ? "hidden" : "mt-6"}>
        <DemoControls
          compact
          role={mode === "hiring" ? "hiring" : "working"}
          onChange={() => {
            bumpDemo();
            void reload();
          }}
        />
      </div>

      {!live ? (
      <>
      <div className="mt-7 flex gap-0.5 overflow-x-auto border-b border-[var(--app-border)]">
        {tabs.map((t) => {
          const n = t.id === "all" ? counts.all : counts[t.id] ?? 0;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={active ? "app-tab app-tab-active" : "app-tab"}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums text-[var(--app-muted)]">
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-5 rounded-[var(--radius)] border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-10 text-sm text-[var(--app-muted)]">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="app-empty mt-7">
          <div className="app-empty-mark" />
          <h2 className="app-page-title mt-5 text-xl">
            {mode === "hiring" ? "Post your first task" : "No seats yet"}
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-relaxed text-[var(--app-muted)]">
            {mode === "hiring"
              ? "Lock USDC, set N and %. Workers race the timed tests — you only fund escrow and get the assigned team."
              : "Browse the board, enter Qualifying races, or wait for operator assign_team if you’re already on a podium."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {mode === "hiring" ? (
              <Link href="/app/tasks/new" className="app-cta">
                Post a task
              </Link>
            ) : (
              <Link href="/" className="app-cta">
                Find tasks
              </Link>
            )}
            {mode === "hiring" ? (
              <Link href="/" className="app-cta-ghost">
                Browse board
              </Link>
            ) : (
              <Link href="/app/tasks/new" className="app-cta-ghost">
                Post a task
              </Link>
            )}
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <li key={t.publicKey.toBase58()}>
              <Link
                href={`/app/tasks/${t.publicKey.toBase58()}`}
                className="app-task-card block p-4 sm:p-[1.1rem]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold tracking-tight">
                      {skillLabel(t.skillId)}
                    </p>
                    <p className="mono mt-1 text-[11px] text-[var(--app-muted)]">
                      {shortPk(t.publicKey.toBase58(), 5)}
                    </p>
                  </div>
                  <StatusPill tone={statusTone(t.status)}>{t.status}</StatusPill>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-[1.65rem] font-bold leading-none tabular-nums tracking-tight">
                    ${baseUnitsToUsdc(t.reward.toNumber()).toFixed(0)}
                  </p>
                  <p className="text-[12px] font-medium text-[var(--app-muted)]">
                    N={t.reviewCount} · {t.slotCount} slots
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </>
      ) : null}
    </div>
  );
}
