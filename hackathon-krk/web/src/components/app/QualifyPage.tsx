"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortPk } from "@/lib/constants";
import {
  QualifyEntry,
  loadQualifyBoard,
} from "@/lib/program";
import {
  isDemoEnabled,
  isDemoTask,
  promoteDemoToWorking,
  simulateWorkerPassed,
} from "@/lib/demo";
import { resolveDemoWorker } from "@/components/app/DemoControls";
import { useAppMode } from "@/components/app/AppChrome";
import { BtnGhost, BtnPink, Panel } from "@/components/app/ui";
import { recordQualifyEntry, useTask } from "@/domain";
import { getTaskCapabilities, toTaskSnapshot } from "@/platform";

const QUESTIONS = [
  {
    prompt: "Test 1 — pick the correct escrow rule",
    options: [
      "Client can reclaim after claim",
      "Per-task vault; cancel only while Qualifying",
      "Shared prepaid wallet pays all tasks",
    ],
    correct: 1,
  },
  {
    prompt: "Test 2 — who is Execution Slot?",
    options: [
      "First to click claim",
      "Fastest on Test 3 among finishers",
      "Whoever has highest stake",
    ],
    correct: 1,
  },
  {
    prompt: "Test 3 — Primary Verification reviews…",
    options: [
      "The client’s brief only",
      "Execution deliverable",
      "Platform fee math",
    ],
    correct: 1,
  },
];

export function QualifyPage() {
  const params = useParams();
  const taskId = typeof params.id === "string" ? params.id : "";
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { task, bumpDemo } = useTask(taskId);
  const [round, setRound] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [times, setTimes] = useState<[number, number, number]>([0, 0, 0]);
  const [passed, setPassed] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [failed, setFailed] = useState(false);
  const [board, setBoard] = useState(() =>
    taskId ? loadQualifyBoard(taskId) : { entries: [] as QualifyEntry[] }
  );

  useEffect(() => {
    if (taskId) setBoard(loadQualifyBoard(taskId));
  }, [taskId]);

  const caps = useMemo(() => {
    if (!task) {
      return getTaskCapabilities({ mode, wallet: publicKey?.toBase58() ?? null });
    }
    return getTaskCapabilities({
      mode,
      wallet: publicKey?.toBase58() ?? null,
      task: toTaskSnapshot(task, { isDemo: isDemoTask(task.publicKey) }),
    });
  }, [task, mode, publicKey]);

  const hiringBlocked = !caps.canQualify;

  const worker = resolveDemoWorker(publicKey);
  const myEntry = board.entries.find((e) => e.wallet === worker.toBase58());

  useEffect(() => {
    if (myEntry && myEntry.passedRound >= 3) {
      setPassed(3);
      setTimes(myEntry.timesMs);
    }
  }, [myEntry]);

  const leaderboard = useMemo(() => {
    return [...board.entries].sort((a, b) => {
      if (b.passedRound !== a.passedRound) return b.passedRound - a.passedRound;
      return a.timesMs[2] - b.timesMs[2] || a.timesMs[0] - b.timesMs[0];
    });
  }, [board]);

  function startRound() {
    if (failed || passed >= 3) return;
    setStartedAt(Date.now());
    setChoice(null);
    setMsg("");
  }

  function submitAnswer() {
    if (!taskId || startedAt === null || choice === null) {
      setMsg("Pick an answer (connect wallet or use demo worker)");
      return;
    }
    if (!task) {
      setMsg("Task not loaded");
      return;
    }
    const elapsed = Date.now() - startedAt;
    const q = QUESTIONS[round];
    const wallet = worker.toBase58();
    try {
      if (choice !== q.correct) {
        setMsg("Incorrect — you are out of this series. Try other tasks.");
        setFailed(true);
        const entry: QualifyEntry = {
          wallet,
          timesMs: times,
          passedRound: passed,
          finishedAt: Date.now(),
        };
        setBoard(
          recordQualifyEntry({
            task,
            entry,
            mode,
            role: caps.role,
            wallet,
          })
        );
        setStartedAt(null);
        return;
      }
      const nextTimes = [...times] as [number, number, number];
      nextTimes[round] = elapsed;
      const nextPassed = round + 1;
      setTimes(nextTimes);
      setPassed(nextPassed);
      const entry: QualifyEntry = {
        wallet,
        timesMs: nextTimes,
        passedRound: nextPassed,
        finishedAt: Date.now(),
      };
      setBoard(
        recordQualifyEntry({
          task,
          entry,
          mode,
          role: caps.role,
          wallet,
        })
      );

      if (round < 2) {
        setRound(round + 1);
        setStartedAt(null);
        setChoice(null);
        setMsg(
          `Passed test ${round + 1} in ${elapsed} ms. Start test ${round + 2}.`
        );
      } else {
        setMsg(
          `Finished all 3. T3 time ${elapsed} ms — status: worker on podium.`
        );
        setStartedAt(null);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
      setStartedAt(null);
    }
  }

  function simulatePass() {
    if (!taskId) return;
    const entry = simulateWorkerPassed(taskId, worker);
    setBoard(loadQualifyBoard(taskId));
    setPassed(3);
    setTimes(entry.timesMs);
    setFailed(false);
    setRound(2);
    setStartedAt(null);
    setMsg(
      `Simulated pass — worker ${shortPk(worker.toBase58())} passedRound=3 (T3 ${entry.timesMs[2]} ms).`
    );
  }

  function promoteWorker() {
    if (!taskId) return;
    if (!isDemoTask(taskId)) {
      setMsg("Promote stub only works on a Demo task — seed one from the dashboard.");
      return;
    }
    simulateWorkerPassed(taskId, worker);
    const next = promoteDemoToWorking(taskId, worker);
    setBoard(loadQualifyBoard(taskId));
    bumpDemo();
    setMsg(
      next
        ? `Promoted to Working — you are Execution Slot (${shortPk(worker.toBase58())}).`
        : "Promote failed (seed demo task first)"
    );
  }

  if (!taskId) return null;

  if (hiringBlocked) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Link
            href={`/app/tasks/${taskId}`}
            className="text-[12px] font-semibold text-[var(--app-accent)] hover:underline"
          >
            ← Task
          </Link>
          <h1 className="app-page-title mt-4 text-[2rem] leading-none">
            Clients don’t take tests
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--muted)]">
            {caps.blocks.qualify ??
              "Timed qualification is for workers only. As hiring, you fund escrow and wait for the operator to assign the podium."}
          </p>
        </div>
        <Panel className="space-y-3">
          <Link href={`/app/tasks/${taskId}`} className="btn-primary btn-md inline-flex">
            Back to task
          </Link>
          <button
            type="button"
            className="btn-secondary btn-md"
            onClick={() => {
              // Soft hint: switch via localStorage — AppChrome reads pico:appMode
              try {
                localStorage.setItem("pico:appMode", "working");
              } catch {
                /* ignore */
              }
              window.location.href = `/app/tasks/${taskId}/qualify`;
            }}
          >
            Switch to Working &amp; qualify
          </button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/app/tasks/${taskId}`}
          className="text-[12px] font-semibold text-[var(--app-accent)] hover:underline"
        >
          ← Task
        </Link>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          Qualify
        </p>
        <h1 className="app-page-title mt-1.5 text-[2rem] leading-none sm:text-[2.2rem]">
          Three timed tests
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--muted)]">
          Pass each round or you&apos;re out of this series. Fastest T3 among
          finishers → Execution; places 2…N+1 → verification slots.
        </p>
        {task ? (
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            Need ≥ {task.slotCount} finishers for assign_team. Status:{" "}
            <span className="font-semibold text-[var(--app-text)]">
              {task.status}
            </span>
          </p>
        ) : null}
      </div>

      {isDemoEnabled() ? (
        <div className="app-demo-strip space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Worker test stub
          </p>
          <div className="flex flex-wrap gap-1.5">
            <BtnPink onClick={simulatePass} size="sm">
              Simulate pass (3/3)
            </BtnPink>
            <BtnGhost onClick={promoteWorker} size="sm">
              Promote → Working / Execution
            </BtnGhost>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            Writes local podium for{" "}
            <code className="mono text-[var(--app-accent)]">
              {shortPk(worker.toBase58())}
            </code>
            {!publicKey ? " (demo worker — connect wallet to use yours)" : ""}.
          </p>
        </div>
      ) : null}

      <Panel className="!shadow-none">
        <p className="text-[15px] font-semibold tracking-tight">
          Test {Math.min(round + 1, 3)} / 3
          {passed >= 3 ? " — complete · worker status" : ""}
          {failed ? " — failed" : ""}
        </p>
        {passed < 3 && !failed ? (
          <>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--app-text)]">
              {QUESTIONS[round].prompt}
            </p>
            <ul className="mt-4 space-y-2">
              {QUESTIONS[round].options.map((opt, i) => (
                <li key={opt}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5 text-[14px] transition ${
                      choice === i
                        ? "border-[var(--border-strong)] bg-[var(--accent-soft)]"
                        : "border-[var(--app-border)] hover:border-white/15"
                    } ${startedAt === null ? "opacity-50" : ""}`}
                  >
                    <input
                      type="radio"
                      name="ans"
                      checked={choice === i}
                      onChange={() => setChoice(i)}
                      disabled={startedAt === null}
                      className="accent-[var(--app-accent)]"
                    />
                    {opt}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {startedAt === null ? (
                <BtnPink onClick={startRound}>Start timer</BtnPink>
              ) : (
                <BtnPink onClick={submitAnswer}>Submit answer</BtnPink>
              )}
              {startedAt !== null ? (
                <span className="self-center text-[12px] text-[var(--muted)]">
                  Timer running…
                </span>
              ) : null}
            </div>
          </>
        ) : passed >= 3 ? (
          <div className="mt-2 space-y-2">
            <p className="text-[14px] text-[var(--ok)]">
              Worker status: passedRound=3 · on podium
              {myEntry ? ` · T3 ${myEntry.timesMs[2]} ms` : ""}.
            </p>
            <p className="text-[12px] text-[var(--muted)]">
              Waiting for operator assign_team — or use Promote stub above.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[14px] text-[var(--danger)]">
            Out of this series. Pick another task or Simulate pass.
          </p>
        )}
        {msg ? (
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
            {msg}
          </p>
        ) : null}
      </Panel>

      <Panel className="!shadow-none">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--app-muted)]">
          Leaderboard
        </h2>
        <ul className="mt-3 space-y-0 text-[14px]">
          {leaderboard.length === 0 ? (
            <li className="py-2 text-[var(--muted)]">No entries yet</li>
          ) : (
            leaderboard.map((e, i) => (
              <li
                key={e.wallet}
                className="flex justify-between gap-2 border-b border-[var(--border)] py-2.5 last:border-0"
              >
                <span>
                  <span className="tabular-nums text-[var(--app-muted)]">
                    #{i + 1}
                  </span>{" "}
                  {shortPk(e.wallet)} · round {e.passedRound}/3
                  {e.passedRound >= 3 ? (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[var(--ok)]">
                      worker
                    </span>
                  ) : null}
                  {e.wallet === worker.toBase58() ? (
                    <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-accent)]">
                      you
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums text-[var(--muted)]">
                  T3 {e.timesMs[2] || "—"} ms
                </span>
              </li>
            ))
          )}
        </ul>
      </Panel>
    </div>
  );
}
