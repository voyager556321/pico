"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { loadTaskMeta } from "@/lib/program";
import { isDemoTask } from "@/lib/demo";
import { useAppMode } from "@/components/app/AppChrome";
import { BtnPink, Panel, textareaClass } from "@/components/app/ui";
import {
  errMsg,
  submitExecution,
  usePicoProgram,
  useTask,
} from "@/domain";
import { getTaskCapabilities, toTaskSnapshot } from "@/platform";

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

  async function submit() {
    if (!program || !publicKey || !task) return;
    if (!result.trim() || !explanation.trim()) {
      setError("Result and explanation required");
      return;
    }
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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/app/tasks/${taskId}`}
          className="text-xs font-medium text-[var(--accent)]"
        >
          ← Task
        </Link>
        <h1 className="app-page-title mt-2 text-3xl">Execution Slot</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Deliver work + short explanation. Hashes on-chain; body stays local.
        </p>
        {!caps.canSubmitExecution && caps.blocks.submit_execution ? (
          <p className="mt-2 text-sm text-[var(--warn)]">
            {caps.blocks.submit_execution}
          </p>
        ) : null}
      </div>

      {meta?.brief ? (
        <Panel>
          <p className="text-xs font-semibold text-[var(--muted)]">Brief</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{meta.brief}</p>
        </Panel>
      ) : null}

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
          disabled={!caps.canSubmitExecution}
          onClick={() => void submit()}
          className="w-full"
        >
          Submit execution
        </BtnPink>
      </Panel>
    </div>
  );
}
