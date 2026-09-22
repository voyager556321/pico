"use client";

import { useEffect, useState } from "react";
import { skillLabel } from "@/lib/constants";
import { loadDemoTasks } from "@/lib/demo";
import { localBotLog, localBotRoster, tickLocalBots } from "@/lib/localBots";

export const LOCAL_BOTS_EVENT = "pico:local-bots";

export function useLocalBotPulse() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const onTick = () => setPulse((value) => value + 1);
    window.addEventListener(LOCAL_BOTS_EVENT, onTick);
    return () => window.removeEventListener(LOCAL_BOTS_EVENT, onTick);
  }, []);
  return pulse;
}

/** Bots live in localStorage and enter Qualifying tasks on this device. */
export function LocalBotsLive() {
  const pulse = useLocalBotPulse();
  const [log, setLog] = useState("Local bots are starting…");
  const [ratings, setRatings] = useState<string>("");

  useEffect(() => {
    const step = () => {
      const tasks = loadDemoTasks().map((task) => ({
        key: task.publicKey.toBase58(),
        title: skillLabel(task.skillId),
        status: task.status,
      }));
      const line = tickLocalBots(tasks);
      setLog(line);
      setRatings(
        localBotRoster()
          .map((bot) => `${bot.id} ${bot.rating}`)
          .join(" · ")
      );
      window.dispatchEvent(new Event(LOCAL_BOTS_EVENT));
    };
    step();
    const timer = window.setInterval(step, 900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mb-5 rounded-[var(--radius)] border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#6ee7b7]" />
        Local bots
        <span className="sr-only">{pulse}</span>
      </p>
      <p className="mt-1.5 text-[14px] text-[var(--app-text)]">{log || localBotLog()}</p>
      {ratings ? (
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--app-muted)]">{ratings}</p>
      ) : null}
    </div>
  );
}
