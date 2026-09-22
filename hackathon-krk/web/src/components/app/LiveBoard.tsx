"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlayback, type LiveStatus } from "@/domain/workflow/playback";
import { simulate } from "@/domain/workflow/simulate";
import { StatusPill } from "@/components/app/ui";

function toneOf(status: LiveStatus): "ok" | "warn" | "err" | "info" {
  if (status === "Paid" || status === "Practice") return "ok";
  if (status === "Qualifying") return "info";
  if (status === "HiringSlot") return "err";
  return "warn";
}

function labelOf(status: LiveStatus): string {
  if (status === "InReview") return "In review";
  if (status === "HiringSlot") return "Hiring seat";
  return status;
}

export function LiveBoard({ onClose }: { onClose?: () => void }) {
  const [seed, setSeed] = useState(7);
  const [botCount, setBotCount] = useState(8);
  const [taskCount, setTaskCount] = useState(4);
  const [rounds, setRounds] = useState(3);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [index, setIndex] = useState(0);

  const steps = useMemo(
    () => buildPlayback(simulate({ seed, botCount, taskCount, rounds })),
    [seed, botCount, taskCount, rounds]
  );
  const frame = steps[Math.min(index, Math.max(steps.length - 1, 0))];
  const done = steps.length > 0 && index >= steps.length - 1 && !playing;

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    if (index >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const delay = Math.max(180, Math.round((steps[index]?.delay ?? 600) / speed));
    const timer = window.setTimeout(() => setIndex((value) => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [playing, index, steps, speed]);

  function rerun() {
    setSeed((value) => value + 1 + Math.floor(Math.random() * 99));
    setIndex(0);
    setPlaying(true);
  }

  const counts = useMemo(() => {
    const cards = frame?.cards ?? [];
    const tally: Record<string, number> = { all: cards.length };
    for (const card of cards) {
      tally[card.status] = (tally[card.status] ?? 0) + 1;
    }
    return tally;
  }, [frame]);

  const tabs = [
    ["all", "All"],
    ["Qualifying", "Qualifying"],
    ["Working", "Working"],
    ["InReview", "In review"],
    ["HiringSlot", "Hiring seat"],
    ["Paid", "Paid"],
    ["Practice", "Practice"],
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
          <span
            className={`inline-block h-2 w-2 rounded-full ${playing ? "animate-pulse bg-[#6ee7b7]" : "bg-[var(--app-muted)]"}`}
          />
          {playing ? "Live" : done ? "Run finished" : "Paused"} · seed {seed}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[12px] text-[var(--app-muted)]">
            Bots
            <input
              type="number"
              min={2}
              max={24}
              value={botCount}
              onChange={(event) => {
                setBotCount(Number(event.target.value) || 2);
                setIndex(0);
                setPlaying(true);
              }}
              className="ml-1.5 w-14 rounded-lg border border-[var(--app-border)] bg-transparent px-2 py-1 text-[var(--app-text)]"
            />
          </label>
          <label className="text-[12px] text-[var(--app-muted)]">
            Tasks
            <input
              type="number"
              min={1}
              max={8}
              value={taskCount}
              onChange={(event) => {
                setTaskCount(Number(event.target.value) || 1);
                setIndex(0);
                setPlaying(true);
              }}
              className="ml-1.5 w-14 rounded-lg border border-[var(--app-border)] bg-transparent px-2 py-1 text-[var(--app-text)]"
            />
          </label>
          <label className="text-[12px] text-[var(--app-muted)]">
            Rounds
            <input
              type="number"
              min={1}
              max={8}
              value={rounds}
              onChange={(event) => {
                setRounds(Number(event.target.value) || 1);
                setIndex(0);
                setPlaying(true);
              }}
              className="ml-1.5 w-14 rounded-lg border border-[var(--app-border)] bg-transparent px-2 py-1 text-[var(--app-text)]"
            />
          </label>
          <button type="button" className="app-cta-ghost" onClick={() => setPlaying((value) => !value)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="app-cta-ghost" onClick={() => setSpeed((value) => (value === 1 ? 2 : value === 2 ? 0.6 : 1))}>
            {speed === 2 ? "2×" : speed < 1 ? "0.6×" : "1×"}
          </button>
          <button type="button" className="app-cta" onClick={rerun}>
            Run again
          </button>
          {onClose ? (
            <button type="button" className="app-cta-ghost" onClick={onClose}>
              Board
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 min-h-5 text-[14px] text-[var(--app-text)]">{frame?.log}</p>

      <div className="mt-4 flex gap-0.5 overflow-x-auto border-b border-[var(--app-border)]">
        {tabs.map(([id, label]) => (
          <span key={id} className="app-tab">
            {label}
            <span className="ml-1.5 tabular-nums text-[var(--app-muted)]">
              {id === "all" ? counts.all ?? 0 : counts[id] ?? 0}
            </span>
          </span>
        ))}
        <span className="app-tab">
          Round
          <span className="ml-1.5 tabular-nums text-[var(--app-muted)]">{frame?.round ?? 1}</span>
        </span>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {(frame?.cards ?? []).map((card) => (
          <li key={card.id} className="app-task-card block p-4 sm:p-[1.1rem]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight">{card.title}</p>
                <p className="mt-1 text-[11px] text-[var(--app-muted)]">
                  {card.kind === "PRACTICE" ? "Practice" : "Paid"} · rating {card.requiredRating}+ · review{" "}
                  {card.reviewerCount}
                </p>
              </div>
              <StatusPill tone={toneOf(card.status)}>{labelOf(card.status)}</StatusPill>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-[1.65rem] font-bold leading-none tabular-nums tracking-tight">
                {card.kind === "PRACTICE" ? "Practice" : `$${card.budget}`}
              </p>
              <p className="text-[12px] font-medium text-[var(--app-muted)]">
                {card.entrants.length}/{card.eligible} clicked
              </p>
            </div>
            {card.entrants.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {card.entrants.map((entrant) => (
                  <li
                    key={entrant.id}
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      card.pulseId === entrant.id
                        ? "animate-pulse border-[var(--app-accent)] text-[var(--app-text)]"
                        : "border-[var(--app-border)] text-[var(--app-muted)]"
                    }`}
                  >
                    {entrant.id}
                    <span className="ml-1 uppercase tracking-wide">{entrant.mark}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[12px] text-[var(--app-muted)]">Waiting for bots…</p>
            )}
            <p className="mt-3 text-[13px] leading-snug text-[var(--app-muted)]">{card.line}</p>
          </li>
        ))}
      </ul>

      {frame && frame.ratings.length > 0 ? (
        <p className="mt-4 text-[12px] leading-relaxed text-[var(--app-muted)]">
          Rating{" "}
          {frame.ratings.map((bot) => `${bot.id} ${bot.rating}`).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
