"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { loadTaskMeta } from "@/lib/program";
import { isDemoTask, loadReviewNotice } from "@/lib/demo";
import { useAppMode } from "@/components/app/AppChrome";
import { Panel } from "@/components/app/ui";
import { useLocalBotPulse } from "@/components/app/LocalBotsLive";
import { entrantsFor } from "@/lib/localBots";
import { TaskDetailView } from "@/ui/app/TaskDetailView";
import {
  cancelTask,
  declineSlot,
  errMsg,
  finalizeAndPay,
  useConfig,
  usePicoProgram,
  useTask,
} from "@/domain";
import {
  getTaskCapabilities,
  toTaskSnapshot,
  type ActorRole,
} from "@/platform";

/**
 * Controller: wires platform capabilities + domain actions → UI view.
 * Designers should edit TaskDetailView, not this file.
 */
export function TaskDetailPage() {
  const params = useParams();
  const taskId = typeof params.id === "string" ? params.id : "";
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { program } = usePicoProgram();
  const config = useConfig();
  const [tick, setTick] = useState(0);
  const botPulse = useLocalBotPulse();
  const { task, loading, error, reload, bumpDemo } = useTask(taskId, tick);
  const [busy, setBusy] = useState(false);
  const [actionErr, setActionErr] = useState("");

  const meta = task ? loadTaskMeta(task.publicKey.toBase58()) : null;

  const caps = useMemo(() => {
    if (!task) {
      return getTaskCapabilities({ mode, wallet: publicKey?.toBase58() ?? null });
    }
    return getTaskCapabilities({
      mode,
      wallet: publicKey?.toBase58() ?? null,
      operator: config?.operator.toBase58() ?? null,
      task: toTaskSnapshot(task, { isDemo: isDemoTask(task.publicKey) }),
    });
  }, [task, mode, publicKey, config]);

  async function run(
    action: (role: ActorRole) => Promise<void>
  ) {
    if (!program || !publicKey || !task) return;
    setBusy(true);
    setActionErr("");
    try {
      await action(caps.role);
      setTick((t) => t + 1);
    } catch (e) {
      setActionErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  if (!taskId) {
    return <p className="text-sm text-[var(--danger)]">Missing task id</p>;
  }

  if (loading && !task) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  if (!task) {
    return (
      <Panel>
        <p className="text-sm text-[var(--danger)]">{error || "Task not found"}</p>
        <Link href="/app" className="btn-secondary btn-sm mt-4 inline-flex">
          Back
        </Link>
      </Panel>
    );
  }

  const ctxBase = {
    program: program!,
    wallet: publicKey!,
    task,
    mode,
    role: caps.role,
    isOperator: Boolean(
      config && publicKey && config.operator.equals(publicKey)
    ),
  };

  const entrants = task.status === "Qualifying" ? entrantsFor(taskId) : [];
  const notice = loadReviewNotice(taskId);

  return (
    <div className="space-y-4">
      {notice ? (
        <Panel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Reviewers
          </p>
          <p className="mt-2 text-[15px]">{notice.text}</p>
        </Panel>
      ) : null}
      {task.status === "Qualifying" ? (
        <Panel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Local bots in this race
          </p>
          {entrants.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--app-muted)]">Waiting for bots to click…</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-1.5" data-pulse={botPulse}>
              {entrants.map((entrant) => (
                <li
                  key={entrant.id}
                  className="rounded-full border border-[var(--app-border)] px-2.5 py-1 text-[12px] font-semibold"
                >
                  {entrant.id}
                  <span className="ml-1.5 text-[var(--app-muted)]">
                    {entrant.passed ? `${entrant.timeMs} ms` : "dropped"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}
    <TaskDetailView
      taskId={taskId}
      task={task}
      meta={meta}
      caps={caps}
      wallet={publicKey}
      mode={mode}
      busy={busy}
      actionErr={actionErr}
      loadError={error}
      onDecline={() => void run(() => declineSlot(ctxBase))}
      onCancel={() => void run(() => cancelTask(ctxBase))}
      onFinalize={() => void run(() => finalizeAndPay(ctxBase))}
      onRefresh={() => {
        void reload();
        setTick((t) => t + 1);
      }}
      onDemoChange={() => {
        bumpDemo();
        setTick((t) => t + 1);
      }}
    />
    </div>
  );
}
