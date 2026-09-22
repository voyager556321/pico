"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  DEMO_TASK_PK,
  DEMO_WORKER_PK,
  clearDemoTasks,
  isDemoEnabled,
  promoteDemoToWorking,
  seedDemoTask,
  setDemoEnabled,
  simulateWorkerPassed,
} from "@/lib/demo";
import { loadQualifyBoard } from "@/lib/offchain";
import { shortPk } from "@/lib/constants";

export function DemoControls({
  onChange,
  compact,
  /** Hiring = client flow (no tests). Working = worker qualify stubs. */
  role = "full",
}: {
  onChange?: () => void;
  compact?: boolean;
  role?: "hiring" | "working" | "full";
}) {
  const { publicKey } = useWallet();
  const [msg, setMsg] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isDemoEnabled());
  }, []);

  function run(label: string, fn: () => void) {
    try {
      fn();
      setMsg(label);
      onChange?.();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const worker = publicKey ?? DEMO_WORKER_PK;
  const showTests = role !== "hiring";

  const finisherCount = useMemo(() => {
    if (!enabled || !msg || !showTests) return 0;
    try {
      const board = loadQualifyBoard(DEMO_TASK_PK.toBase58());
      return board.entries.filter((e) => e.passedRound >= 3).length;
    } catch {
      return 0;
    }
  }, [enabled, msg, showTests]);

  return (
    <div className="app-demo-strip">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Demo stubs
            {!enabled ? (
              <span className="ml-1.5 font-medium normal-case tracking-normal text-[var(--app-muted)]/70">
                · off
              </span>
            ) : (
              <span className="ml-1.5 font-medium normal-case tracking-normal text-[var(--app-muted)]/80">
                · local only
              </span>
            )}
          </p>
          {!compact ? (
            <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-[var(--app-muted)]">
              {role === "hiring"
                ? "Client path: seed a funded task, then assign a team. Workers take the timed tests — not you."
                : "Flow without Devnet. Wallet optional — uses demo worker if disconnected."}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 text-[11px] font-semibold text-[var(--app-accent)] hover:brightness-110"
          onClick={() => {
            const next = !enabled;
            setDemoEnabled(next);
            setEnabled(next);
            onChange?.();
            setMsg(next ? "Demo on" : "Demo off");
          }}
        >
          {enabled ? "Disable" : "Enable"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          className="app-demo-btn"
          onClick={() =>
            run("Seeded Qualifying task", () => {
              seedDemoTask({ client: publicKey });
            })
          }
        >
          1 · Seed task
        </button>
        {showTests ? (
          <button
            type="button"
            className="app-demo-btn"
            onClick={() =>
              run("Worker passed 3 tests", () => {
                seedDemoTask({ client: publicKey });
                simulateWorkerPassed(DEMO_TASK_PK.toBase58(), worker);
              })
            }
          >
            2 · Simulate pass
          </button>
        ) : null}
        <button
          type="button"
          className="app-demo-btn app-demo-btn-primary"
          onClick={() =>
            run(
              role === "hiring"
                ? "Team assigned (Working)"
                : "Promoted → Working (Execution)",
              () => {
                seedDemoTask({ client: publicKey });
                const seat =
                  role === "hiring" ? DEMO_WORKER_PK : worker;
                simulateWorkerPassed(DEMO_TASK_PK.toBase58(), seat);
                promoteDemoToWorking(DEMO_TASK_PK.toBase58(), seat);
              }
            )
          }
        >
          {role === "hiring" ? "2 · Assign team" : "3 · Assign worker"}
        </button>
        <button
          type="button"
          className="app-demo-btn app-demo-btn-quiet"
          onClick={() =>
            run("Cleared demo", () => {
              clearDemoTasks();
            })
          }
        >
          Clear
        </button>
      </div>

      {msg ? (
        <p className="mt-2.5 text-[12px] text-[var(--ok)]">
          {msg}
          {enabled ? (
            <>
              {" "}
              · task{" "}
              <a
                className="font-semibold text-[var(--app-accent)] underline underline-offset-2"
                href={`/app/tasks/${DEMO_TASK_PK.toBase58()}`}
              >
                {shortPk(DEMO_TASK_PK.toBase58(), 4)}
              </a>
              {finisherCount ? ` · ${finisherCount} finisher(s)` : ""}
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--app-border)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--app-accent)]">
      Demo
    </span>
  );
}

/** Resolve which wallet to treat as the demo worker for simulate. */
export function resolveDemoWorker(publicKey: PublicKey | null): PublicKey {
  return publicKey ?? DEMO_WORKER_PK;
}
