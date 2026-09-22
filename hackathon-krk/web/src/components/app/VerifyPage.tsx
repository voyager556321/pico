"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { slotLabel } from "@/lib/constants";
import { loadTaskMeta } from "@/lib/program";
import { isDemoTask } from "@/lib/demo";
import { useAppMode } from "@/components/app/AppChrome";
import { BtnGhost, BtnPink, Panel, textareaClass } from "@/components/app/ui";
import {
  errMsg,
  submitVerification,
  usePicoProgram,
  useTask,
} from "@/domain";
import { getTaskCapabilities, toTaskSnapshot } from "@/platform";

export function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = typeof params.id === "string" ? params.id : "";
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { program } = usePicoProgram();
  const { task, loading } = useTask(taskId);
  const meta = taskId ? loadTaskMeta(taskId) : null;

  const active = task?.activeSlot ?? 1;
  const [notes, setNotes] = useState(meta?.reviews?.[String(active)] ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  const prevBody =
    active === 1
      ? `RESULT:\n${meta?.result ?? "(missing local result)"}\n\nEXPLANATION:\n${meta?.explanation ?? ""}`
      : meta?.reviews?.[String(active - 1)] ?? "(missing previous review locally)";

  async function submit(approve: boolean) {
    if (!program || !publicKey || !task) return;
    if (!notes.trim()) {
      setError("Write review notes");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitVerification({
        program,
        wallet: publicKey,
        task,
        taskId,
        notes,
        approve,
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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/app/tasks/${taskId}`}
          className="text-xs font-medium text-[var(--accent)]"
        >
          ← Task
        </Link>
        <h1 className="app-page-title mt-2 text-3xl">
          {task ? slotLabel(active, task.slotCount) : "Verification"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {active === 1
            ? "Review the Execution deliverable."
            : "Review the previous verifier’s work. Last Done → client."}
        </p>
        {!caps.canSubmitVerification && caps.blocks.submit_verification ? (
          <p className="mt-2 text-sm text-[var(--warn)]">
            {caps.blocks.submit_verification}
          </p>
        ) : null}
      </div>

      <Panel>
        <p className="text-xs font-semibold text-[var(--muted)]">
          Previous artifact
        </p>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-[var(--text)]">
          {prevBody}
        </pre>
      </Panel>

      <Panel className="space-y-4">
        <label className="block text-sm font-medium">
          Your review
          <textarea
            className={textareaClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <BtnPink
            loading={busy}
            disabled={!caps.canSubmitVerification}
            onClick={() => void submit(true)}
          >
            Approve &amp; Done
          </BtnPink>
          <BtnGhost
            loading={busy}
            disabled={!caps.canSubmitVerification}
            onClick={() => void submit(false)}
          >
            Reject → dispute
          </BtnGhost>
        </div>
      </Panel>
    </div>
  );
}
