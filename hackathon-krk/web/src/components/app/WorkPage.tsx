"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { loadTaskMeta, saveTaskMeta } from "@/lib/program";
import { isDemoTask, loadReviewNotice, notifyReviewersOfSubmission } from "@/lib/demo";
import {
  PRESENCE_EVENT,
  clearActiveSession,
  formatClock,
  loadTrust,
  loadWorkSession,
  markActiveSession,
  startWorkSession,
  type WorkSession,
} from "@/lib/presence";
import { resolveDemoWorker } from "@/components/app/DemoControls";
import { useAppMode } from "@/components/app/AppChrome";
import { BtnPink, Panel, textareaClass } from "@/components/app/ui";
import {
  errMsg,
  submitExecution,
  usePicoProgram,
  useTask,
} from "@/domain";
import { getTaskCapabilities, toTaskSnapshot } from "@/platform";
import { executorBriefFor } from "@/domain/workflow/qualifyProblems";

export function WorkPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = typeof params.id === "string" ? params.id : "";
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { program } = usePicoProgram();
  const { task, loading } = useTask(taskId);
  const meta = taskId ? loadTaskMeta(taskId) : null;

  const [result, setResult] = useState(meta?.result ?? "");
  const [explanation, setExplanation] = useState(meta?.explanation ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const demo = task ? isDemoTask(task.publicKey) : isDemoTask(taskId);
  const actor = demo ? resolveDemoWorker(publicKey) : publicKey;

  const caps = useMemo(() => {
    if (!task) {
      return getTaskCapabilities({ mode, wallet: actor?.toBase58() ?? null });
    }
    return getTaskCapabilities({
      mode,
      wallet: actor?.toBase58() ?? null,
      task: toTaskSnapshot(task, { isDemo: isDemoTask(task.publicKey) }),
    });
  }, [task, mode, actor]);

  const localExecution =
    Boolean(task && demo && task.status === "Working" && actor && task.slotHolders[0].equals(actor));
  const executionWallet = task?.slotHolders[0]?.toBase58() ?? "";
  const [session, setSession] = useState<WorkSession | null>(null);
  const [trust, setTrust] = useState(0);

  useEffect(() => {
    if (!localExecution || !taskId || !actor) return;
    const opened = startWorkSession(taskId, actor.toBase58());
    markActiveSession(opened);
    setSession(opened);
    setTrust(loadTrust(actor.toBase58()));
  }, [localExecution, taskId, actor?.toBase58()]);

  useEffect(() => {
    const refresh = () => {
      const wallet = actor?.toBase58();
      if (!taskId || !wallet) return;
      setSession(loadWorkSession(taskId, wallet));
      setTrust(loadTrust(wallet));
    };
    window.addEventListener(PRESENCE_EVENT, refresh);
    return () => window.removeEventListener(PRESENCE_EVENT, refresh);
  }, [taskId, actor?.toBase58()]);

  async function submit() {
    if (!result.trim() || !explanation.trim()) {
      setError("Result and explanation required");
      return;
    }
    if (demo) {
      const existing = loadTaskMeta(taskId);
      saveTaskMeta(taskId, {
        brief: existing?.brief ?? meta?.brief ?? "",
        result: result.trim(),
        explanation: explanation.trim(),
        reviews: existing?.reviews,
        qualifyProblems: existing?.qualifyProblems,
        executorBrief: existing?.executorBrief,
        delivery: existing?.delivery,
      });
      clearActiveSession();
      notifyReviewersOfSubmission(taskId);
      router.push(`/app/tasks/${taskId}`);
      return;
    }
    if (!program || !publicKey || !task) return;
    setBusy(true);
    setError("");
    try {
      await submitExecution({
        program,
        wallet: publicKey,
        task,
        taskId,
        result,
        explanation,
        mode,
        role: caps.role,
      });
      router.push(`/app/tasks/${taskId}`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading && !task) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  const notice = taskId ? loadReviewNotice(taskId) : null;
  const reviewerSeat =
    task &&
    actor &&
    task.slotHolders.slice(1, 1 + task.reviewCount).some((holder) => holder.equals(actor));

  if (task && demo && actor && !localExecution) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Link href={`/app/tasks/${taskId}`} className="text-xs font-medium text-[var(--accent)]">
          ← Task
        </Link>
        <h1 className="app-page-title text-3xl">
          {reviewerSeat ? "Reviewer" : "Main task"}
        </h1>
        <Panel>
          <p className="text-[15px] leading-relaxed">
            {reviewerSeat
              ? "You are a reviewer. Execution writes the main task. You get a notice when they submit."
              : "The main task is open for Execution only."}
          </p>
          <p className="mt-3 text-[14px] text-[var(--app-muted)]">
            {notice?.text ?? "Waiting for Execution to submit the delivery."}
          </p>
          {executionWallet ? (
            <p className="mt-3 text-[14px]">
              Execution trust <span className="font-semibold tabular-nums">{loadTrust(executionWallet)}</span>
              . Clients see this score. Time away from the work session lowers it.
            </p>
          ) : null}
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/app/tasks/${taskId}`}
          className="text-xs font-medium text-[var(--accent)]"
        >
          ← Task
        </Link>
        <h1 className="app-page-title mt-2 text-3xl">Main task</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Qualification is done. This is the work from the brief.
        </p>
        {!localExecution && !caps.canSubmitExecution && caps.blocks.submit_execution ? (
          <p className="mt-2 text-sm text-[var(--warn)]">
            {caps.blocks.submit_execution}
          </p>
        ) : null}
      </div>

      {localExecution && session ? (
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
            Time in system
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatClock(session.activeMs)}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-muted)]">
            Away {formatClock(session.awayMs)} · Trust {trust}
            {session.source === "editor" ? " · Editor connected" : " · Browser tab"}
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Stay in this tab, or send a heartbeat from an editor such as Visual Studio Code.
            About 20 seconds away drops trust. Clients see the score, and a high-pay task
            stays closed until trust is high enough.
          </p>
          <p className="mono mt-3 text-[11px] leading-relaxed text-[var(--app-muted)]">
            POST /api/presence {`{"taskId":"${taskId}","wallet":"${actor?.toBase58() ?? ""}","source":"editor"}`}
          </p>
        </Panel>
      ) : null}

      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
          For the executor
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
          {meta?.executorBrief || executorBriefFor(meta?.brief || "The posted task")}
        </p>
      </Panel>

      <Panel className="space-y-4">
        <label className="block text-sm font-medium">
          Result
          <textarea
            className={textareaClass}
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Explanation
          <textarea
            className={textareaClass}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <BtnPink
          loading={busy}
          disabled={!localExecution && !caps.canSubmitExecution}
          onClick={() => void submit()}
          className="w-full"
        >
          Submit execution
        </BtnPink>
      </Panel>
    </div>
  );
}
