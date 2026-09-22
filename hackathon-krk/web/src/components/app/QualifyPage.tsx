"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { baseUnitsToUsdc, shortPk } from "@/lib/constants";
import {
  QualifyEntry,
  loadQualifyBoard,
  loadTaskMeta,
} from "@/lib/program";
import {
  acceptSolution,
  ensureQualifyProblems,
  orderForParticipant,
  sampleSolution,
} from "@/domain/workflow/qualifyProblems";
import {
  isDemoEnabled,
  isDemoTask,
  loadReviewNotice,
  promoteDemoToWorking,
  settleAfterFinish,
  simulateWorkerPassed,
  type LocalRaceRole,
} from "@/lib/demo";
import { resolveDemoWorker } from "@/components/app/DemoControls";
import { useAppMode } from "@/components/app/AppChrome";
import { BtnGhost, BtnPink, Panel } from "@/components/app/ui";
import { recordQualifyEntry, useTask } from "@/domain";
import { getTaskCapabilities, toTaskSnapshot } from "@/platform";

export function QualifyPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = typeof params.id === "string" ? params.id : "";
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { task, bumpDemo } = useTask(taskId);
  const [round, setRound] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [times, setTimes] = useState<[number, number, number]>([0, 0, 0]);
  const [passed, setPassed] = useState(0);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState("");
  const [failed, setFailed] = useState(false);
  const [podiumRole, setPodiumRole] = useState<LocalRaceRole | null>(null);
  const [stubPhase, setStubPhase] = useState("");
  const [pasteNote, setPasteNote] = useState("");

  function blockInsert(event: { preventDefault: () => void }) {
    event.preventDefault();
    setPasteNote("Paste is blocked. Write the solution here — copied code does not count.");
  }
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
  const problems = useMemo(() => {
    if (!task) return [];
    const meta = loadTaskMeta(task.publicKey.toBase58());
    const brief = meta?.brief || "Implement the requested behavior.";
    const reward = baseUnitsToUsdc(task.reward.toNumber());
    const shared = ensureQualifyProblems(task.publicKey.toBase58(), brief, reward);
    return orderForParticipant(shared, worker.toBase58());
  }, [task, worker]);
  const current = problems[round];

  useEffect(() => {
    if (!myEntry || myEntry.passedRound < 3 || !taskId || !isDemoTask(taskId)) return;
    setPassed(3);
    setTimes(myEntry.timesMs);
    const outcome = settleAfterFinish(taskId, myEntry.wallet);
    setPodiumRole(outcome.role);
    if (outcome.role === "execution") {
      router.replace(`/app/tasks/${taskId}/work`);
    }
  }, [myEntry, taskId, router]);

  const leaderboard = useMemo(() => {
    return [...board.entries].sort((a, b) => {
      if (b.passedRound !== a.passedRound) return b.passedRound - a.passedRound;
      return a.timesMs[2] - b.timesMs[2] || a.timesMs[0] - b.timesMs[0];
    });
  }, [board]);

  function startRound() {
    if (failed || passed >= 3 || !current) return;
    setStartedAt(Date.now());
    setDraft(current.stub);
    setMsg("");
  }

  function submitAnswer() {
    if (!taskId || startedAt === null || !current) {
      setMsg("Start the timer, then write the function.");
      return;
    }
    if (!task) {
      setMsg("Task not loaded");
      return;
    }
    const elapsed = Date.now() - startedAt;
    const wallet = worker.toBase58();
    try {
      if (!acceptSolution(current, draft)) {
        setMsg("That solution does not cover this problem. You are out of this series.");
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
        setDraft("");
        setMsg(
          `Passed “${current.title}” in ${elapsed} ms. Start the next problem.`
        );
      } else {
        setStartedAt(null);
        const outcome = isDemoTask(taskId)
          ? settleAfterFinish(taskId, wallet)
          : { role: "execution" as const };
        setPodiumRole(outcome.role);
        if (outcome.role === "execution") {
          router.push(`/app/tasks/${taskId}/work`);
          return;
        }
        setMsg(
          outcome.role === "reviewer"
            ? "You finished behind Execution. You will be notified when they submit the main task."
            : "You finished outside the review seats."
        );
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
      setStartedAt(null);
    }
  }

  async function playStub() {
    if (!task || !taskId || problems.length < 3 || stubPhase) return;
    setFailed(false);
    setMsg("");
    const wallet = worker.toBase58();
    const nextTimes: [number, number, number] = [0, 0, 0];
    for (let step = 0; step < 3; step++) {
      const problem = problems[step];
      const solution = sampleSolution(problem);
      setRound(step);
      setStartedAt(Date.now());
      setDraft("");
      setStubPhase(`Writing “${problem.title}”…`);
      const started = Date.now();
      for (let i = 1; i <= solution.length; i += 3) {
        setDraft(solution.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
      setDraft(solution);
      setStubPhase(`Submitting “${problem.title}”…`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      nextTimes[step] = Math.max(1, Date.now() - started);
      const entry: QualifyEntry = {
        wallet,
        timesMs: [...nextTimes] as [number, number, number],
        passedRound: step + 1,
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
      setTimes([...nextTimes] as [number, number, number]);
      setPassed(step + 1);
    }
    setStartedAt(null);
    setStubPhase("Opening the main task…");
    const outcome = isDemoTask(taskId)
      ? settleAfterFinish(taskId, wallet)
      : { role: "execution" as const };
    setPodiumRole(outcome.role);
    if (outcome.role === "execution") {
      await new Promise((resolve) => setTimeout(resolve, 400));
      router.push(`/app/tasks/${taskId}/work`);
      return;
    }
    setStubPhase("");
    setMsg(
      outcome.role === "reviewer"
        ? "You finished behind Execution. You will be notified when they submit the main task."
        : "You finished outside the review seats."
    );
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
          Three programming problems
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--muted)]">
          The three problems come from this task&apos;s brief and are the same
          for everyone. Your order is shuffled. Fastest finisher of all three
          becomes Execution.
        </p>
        {problems.length === 3 ? (
          <p className="mt-2 text-[13px] text-[var(--app-muted)]">
            Your order: {problems.map((item) => item.title).join(" → ")}
          </p>
        ) : null}
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
            <BtnPink onClick={() => void playStub()} size="sm" disabled={Boolean(stubPhase)}>
              {stubPhase || "Simulate writing, submit, open main task"}
            </BtnPink>
            <BtnGhost onClick={simulatePass} size="sm">
              Skip to passed
            </BtnGhost>
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
          Problem {Math.min(round + 1, 3)} / 3
          {current ? ` · ${current.title}` : ""}
          {passed >= 3 ? " — complete · worker status" : ""}
          {failed ? " — failed" : ""}
        </p>
        {passed < 3 && !failed && current ? (
          <>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--app-text)]">
              {current.prompt}
            </p>
            <textarea
              value={startedAt === null ? current.stub : draft}
              onChange={(event) => setDraft(event.target.value)}
              onPaste={blockInsert}
              onDrop={blockInsert}
              onBeforeInput={(event) => {
                const input = event.nativeEvent as InputEvent;
                if (input.inputType === "insertFromPaste" || input.inputType === "insertFromDrop") {
                  blockInsert(event);
                }
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
                  blockInsert(event);
                }
              }}
              readOnly={startedAt === null}
              spellCheck={false}
              className="mono mt-4 min-h-40 w-full rounded-[10px] border border-[var(--app-border)] bg-black/30 p-3 text-[13px] leading-relaxed text-[var(--app-text)]"
            />
            {pasteNote ? (
              <p className="mt-2 text-[13px] text-[var(--warn)]">{pasteNote}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {startedAt === null ? (
                <BtnPink onClick={startRound}>Start timer</BtnPink>
              ) : (
                <BtnPink onClick={submitAnswer}>Submit solution</BtnPink>
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
            {podiumRole === "reviewer" ? (
              <>
                <p className="text-[14px] text-[var(--app-text)]">
                  You are a reviewer. The main task stays with Execution.
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--app-muted)]">
                  {loadReviewNotice(taskId)?.text ??
                    "You will be notified when Execution submits the delivery."}
                </p>
              </>
            ) : (
              <p className="text-[14px] text-[var(--ok)]">
                Finished all 3
                {myEntry ? ` · T3 ${myEntry.timesMs[2]} ms` : ""}.
              </p>
            )}
          </div>
        ) : failed ? (
          <p className="mt-2 text-[14px] text-[var(--danger)]">
            Out of this series. Pick another task or Simulate pass.
          </p>
        ) : (
          <p className="mt-2 text-[14px] text-[var(--muted)]">Loading the problems…</p>
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
