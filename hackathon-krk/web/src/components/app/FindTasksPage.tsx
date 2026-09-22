"use client";

import Link from "next/link";
import { useMemo } from "react";
import { baseUnitsToUsdc, skillLabel, shortPk } from "@/lib/constants";
import { loadTaskMeta } from "@/lib/offchain";
import { trustRequiredForReward } from "@/lib/presence";
import { useTasks } from "@/lib/hooks";
import { entrantsFor } from "@/lib/localBots";
import { useLocalBotPulse } from "@/components/app/LocalBotsLive";
import { StatusPill } from "@/components/app/ui";
import { statusTone } from "@/components/app/SlotTable";

export function FindTasksPage() {
  const { tasks, loading, error } = useTasks();
  const pulse = useLocalBotPulse();
  const open = useMemo(
    () => tasks.filter((task) => task.status === "Qualifying"),
    [tasks]
  );

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
        Board
      </p>
      <h1 className="app-page-title mt-1.5 text-[2rem] leading-none">Find tasks</h1>
      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[var(--app-muted)]">
        Open qualification races. Enter one to take the timed tests. Hiring does not take tests.
      </p>

      {error ? (
        <p className="mt-5 text-sm text-red-300">{error}</p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-[var(--app-muted)]">Loading…</p>
      ) : open.length === 0 ? (
        <div className="app-empty mt-7">
          <h2 className="app-page-title text-xl">No open tasks</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--app-muted)]">
            Post one locally and it will show up here as Qualifying.
          </p>
          <Link href="/app/tasks/new" className="app-cta mt-6">
            Post a task
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {open.map((task) => {
            const key = task.publicKey.toBase58();
            const entrants = entrantsFor(key);
            const meta = loadTaskMeta(key);
            const project = meta?.delivery === "project" || task.skillId === 5;
            const need = trustRequiredForReward(baseUnitsToUsdc(task.reward.toNumber()));
            return (
            <li key={`${key}-${pulse}`}>
              <Link
                href={`/app/tasks/${key}`}
                className="app-task-card block p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold">{skillLabel(task.skillId)}</p>
                    <p className="mt-1 text-[12px] font-semibold text-[var(--app-accent)]">
                      {project ? "Project" : "Review"}
                      {need > 0 ? ` · Trust ${need}+` : ""}
                    </p>
                    <p className="mono mt-1 text-[11px] text-[var(--app-muted)]">
                      {shortPk(task.publicKey.toBase58(), 5)}
                    </p>
                  </div>
                  <StatusPill tone={statusTone(task.status)}>{task.status}</StatusPill>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <p className="text-[1.65rem] font-bold tabular-nums">
                    ${baseUnitsToUsdc(task.reward.toNumber()).toFixed(0)}
                  </p>
                  <p className="text-[12px] text-[var(--app-muted)]">
                    {entrants.length} in · {task.slotCount} seats
                  </p>
                </div>
                {entrants.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {entrants.map((entrant) => (
                      <li
                        key={entrant.id}
                        className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--app-muted)]"
                      >
                        {entrant.id}
                        <span className="ml-1 uppercase tracking-wide">
                          {entrant.passed ? "done" : "in"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[12px] text-[var(--app-muted)]">Waiting for local bots…</p>
                )}
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
