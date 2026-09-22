"use client";

import { PublicKey } from "@solana/web3.js";
import { shortPk, slotLabel } from "@/lib/constants";
import { TaskAccount, isDefaultPk } from "@/lib/program";

export function SlotTable({
  task,
  highlightWallet,
}: {
  task: TaskAccount;
  highlightWallet?: PublicKey | null;
}) {
  const rows = [];
  for (let i = 0; i < task.slotCount; i++) {
    const holder = task.slotHolders[i];
    const empty = isDefaultPk(holder);
    const mine =
      highlightWallet && !empty && holder.equals(highlightWallet);
    const active =
      (task.status === "Working" && i === 0) ||
      (task.status === "InReview" && i === task.activeSlot) ||
      (task.status === "HiringSlot" && i === task.hiringSlot);
    const done =
      (task.status === "InReview" && i < task.activeSlot) ||
      task.status === "Submitted" ||
      task.status === "Paid";

    rows.push(
      <tr
        key={i}
        className={
          active
            ? "bg-[var(--accent-soft)]/60"
            : done && !empty
              ? "bg-[rgba(52,211,153,0.08)]"
              : undefined
        }
      >
        <td className="px-4 py-3 text-sm font-semibold">
          <div className="flex flex-wrap items-center gap-2">
            {slotLabel(i, task.slotCount)}
            {active ? (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1a120c]">
                active
              </span>
            ) : null}
            {done && !active && !empty ? (
              <span className="rounded-full bg-[rgba(52,211,153,0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ok)]">
                done
              </span>
            ) : null}
          </div>
        </td>
        <td className="mono px-4 py-3 text-xs text-[var(--muted)]">
          {empty ? (
            <span className="text-[var(--warn)]">open seat</span>
          ) : (
            shortPk(holder.toBase58(), 4)
          )}
          {mine ? (
            <span className="ml-2 inline-flex rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-ink)]">
              you
            </span>
          ) : null}
        </td>
        <td className="px-4 py-3 text-sm tabular-nums">
          {task.slotTimesMs[i] > 0 ? (
            <span className="font-medium">{task.slotTimesMs[i]} ms</span>
          ) : (
            "—"
          )}
        </td>
        <td className="px-4 py-3 text-sm font-semibold tabular-nums">
          {(task.slotBps[i] / 100).toFixed(0)}%
        </td>
      </tr>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)]">
      <table className="w-full min-w-[480px] text-left">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-soft)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            <th className="px-4 py-3 font-semibold">Slot</th>
            <th className="px-4 py-3 font-semibold">Holder</th>
            <th className="px-4 py-3 font-semibold">T3 time</th>
            <th className="px-4 py-3 font-semibold">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">{rows}</tbody>
      </table>
      <p className="border-t border-[var(--border)] bg-[var(--bg-soft)]/50 px-4 py-2.5 text-xs text-[var(--muted)]">
        Faster T3 = Execution. Place 2…N+1 = verification chain (same podium).
      </p>
    </div>
  );
}

export function SlotPipeline({ task }: { task: TaskAccount }) {
  const steps: { key: string; label: string; state: "done" | "active" | "idle" }[] = [
    {
      key: "q",
      label: "Qualify",
      state:
        task.status === "Qualifying"
          ? "active"
          : task.status === "Cancelled"
            ? "idle"
            : "done",
    },
    {
      key: "w",
      label: "Execution",
      state:
        task.status === "Working"
          ? "active"
          : ["InReview", "Submitted", "Paid", "HiringSlot", "Disputed"].includes(
                task.status
              )
            ? "done"
            : "idle",
    },
    {
      key: "v",
      label: "Verify chain",
      state:
        task.status === "InReview" || task.status === "HiringSlot"
          ? "active"
          : task.status === "Submitted" || task.status === "Paid"
            ? "done"
            : "idle",
    },
    {
      key: "p",
      label: "Pay",
      state:
        task.status === "Submitted"
          ? "active"
          : task.status === "Paid"
            ? "done"
            : "idle",
    },
  ];

  return (
    <div className="slot-pipeline">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <span
            className={
              s.state === "active"
                ? "slot-pip slot-pip-active"
                : s.state === "done"
                  ? "slot-pip slot-pip-done"
                  : "slot-pip"
            }
          >
            <span className="mono text-[10px] opacity-70">{i + 1}</span>
            {s.label}
          </span>
          {i < steps.length - 1 ? (
            <span className="hidden text-[var(--border)] sm:inline" aria-hidden>
              →
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function statusTone(
  s: TaskAccount["status"]
): "ok" | "warn" | "err" | "info" {
  if (s === "Paid") return "ok";
  if (s === "Disputed" || s === "Cancelled") return "err";
  if (s === "Qualifying") return "info";
  return "warn";
}
