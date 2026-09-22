"use client";

import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import type { TaskAccount } from "@/lib/accounts";
import type { TaskMeta } from "@/lib/offchain";
import type { TaskCapabilities } from "@/platform";
import { baseUnitsToUsdc, shortPk, skillLabel } from "@/lib/constants";
import { isDemoTask } from "@/lib/demo";
import { DemoBadge, DemoControls } from "@/components/app/DemoControls";
import { SlotPipeline, SlotTable, statusTone } from "@/components/app/SlotTable";
import { BtnGhost, BtnPink, Panel, StatusPill } from "@/components/app/ui";

/**
 * Presentational task hub — designers edit this file.
 * Business rules arrive via `caps`; chain calls via callbacks.
 */
export function TaskDetailView({
  taskId,
  task,
  meta,
  caps,
  wallet,
  mode,
  busy,
  actionErr,
  loadError,
  onDecline,
  onCancel,
  onFinalize,
  onRefresh,
  onDemoChange,
}: {
  taskId: string;
  task: TaskAccount;
  meta: TaskMeta | null;
  caps: TaskCapabilities;
  wallet: PublicKey | null;
  mode: "hiring" | "working";
  busy: boolean;
  actionErr: string;
  loadError: string;
  onDecline: () => void;
  onCancel: () => void;
  onFinalize: () => void;
  onRefresh: () => void;
  onDemoChange: () => void;
}) {
  const deadline = new Date(task.deadline.toNumber() * 1000);
  const demo = isDemoTask(task.publicKey);
  const hiringLike = caps.role === "client" || mode === "hiring";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/app" className="text-xs font-semibold text-[var(--accent)]">
            ← Tasks
          </Link>
          <h1 className="app-page-title mt-2 text-3xl sm:text-4xl">
            {skillLabel(task.skillId)}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="mono text-xs text-[var(--muted)]">
              {shortPk(task.publicKey.toBase58(), 8)}
            </p>
            {demo ? <DemoBadge /> : null}
          </div>
        </div>
        <StatusPill tone={statusTone(task.status)}>{task.status}</StatusPill>
      </div>

      {demo ? (
        <DemoControls
          compact
          role={hiringLike ? "hiring" : "working"}
          onChange={onDemoChange}
        />
      ) : null}

      <SlotPipeline task={task} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Escrow
          </p>
          <p className="display mt-1 text-2xl font-extrabold">
            ${baseUnitsToUsdc(task.reward.toNumber()).toFixed(2)}
          </p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Reviews (N)
          </p>
          <p className="display mt-1 text-2xl font-extrabold">{task.reviewCount}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Deadline
          </p>
          <p className="mt-1 text-sm font-semibold">{deadline.toLocaleString()}</p>
        </Panel>
      </div>

      {meta?.brief ? (
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Brief
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{meta.brief}</p>
        </Panel>
      ) : null}

      <div>
        <h2 className="mb-3 text-lg font-bold">Slots</h2>
        <SlotTable task={task} highlightWallet={wallet} />
      </div>

      <div className="flex flex-wrap gap-2">
        {demo ? (
          <p className="w-full text-xs text-[var(--muted)]">
            {hiringLike
              ? "Demo task — clients don’t take tests. Seed / assign team via stubs above."
              : "Demo task — chain actions disabled. Use stubs or Qualify → Simulate / Promote."}
          </p>
        ) : null}

        {caps.canQualify ? (
          <Link
            href={`/app/tasks/${taskId}/qualify`}
            className="btn-primary btn-md"
          >
            Enter qualification (3 tests)
          </Link>
        ) : null}

        {caps.showClientWaitingQualify ? (
          <p className="w-full text-sm text-[var(--muted)]">
            Waiting for workers to finish timed tests. Operator assigns the podium —
            you don’t enter Qualify.
          </p>
        ) : null}

        {caps.canSubmitExecution ? (
          <Link
            href={`/app/tasks/${taskId}/work`}
            className="btn-primary btn-md"
          >
            Submit execution
          </Link>
        ) : null}

        {caps.canSubmitVerification ? (
          <Link
            href={`/app/tasks/${taskId}/verify`}
            className="btn-primary btn-md"
          >
            Submit verification
          </Link>
        ) : null}

        {caps.canFinalize ? (
          <BtnPink loading={busy} onClick={onFinalize}>
            Finalize &amp; pay
          </BtnPink>
        ) : null}

        {caps.canDecline ? (
          <BtnGhost loading={busy} onClick={onDecline}>
            Decline my slot
          </BtnGhost>
        ) : null}

        {caps.canCancel ? (
          <BtnGhost loading={busy} onClick={onCancel}>
            Cancel &amp; refund
          </BtnGhost>
        ) : null}

        <button type="button" className="btn-secondary btn-md" onClick={onRefresh}>
          Refresh
        </button>

        <Link href="/app/operator" className="btn-secondary btn-md">
          Operator
        </Link>
      </div>

      {actionErr ? (
        <p className="text-sm text-[var(--danger)]">{actionErr}</p>
      ) : null}
      {loadError ? <p className="text-sm text-[var(--muted)]">{loadError}</p> : null}
    </div>
  );
}
