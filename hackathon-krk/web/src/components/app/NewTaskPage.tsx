"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  BPS_DENOM,
  MAX_SLOTS,
  SKILLS,
  USDC_MINT,
  defaultSlotBps,
  slotLabel,
  usdcToBaseUnits,
} from "@/lib/constants";
import { configPda, taskPda, vaultAta, vaultAuthorityPda } from "@/lib/pdas";
import { errMsg, usePicoProgram } from "@/lib/hooks";
import { saveTaskMeta } from "@/lib/program";
import { BtnPink, Field, Panel, inputClass, textareaClass } from "@/components/app/ui";

function friendlyTxError(e: unknown): string {
  const raw = errMsg(e);
  if (
    raw.includes("InstructionFallbackNotFound") ||
    raw.includes("Error Number: 101") ||
    raw.includes("Fallback functions are not supported")
  ) {
    return (
      "On-chain program is still the old build — it does not know create_task(review_count, slot_bps). " +
      "Redeploy programs/pico/src/lib.rs to Devnet (see programs/pico/REDEPLOY.md), then initialize_config again."
    );
  }
  return raw;
}

export function NewTaskPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { program, publicKey } = usePicoProgram();

  const [skillId, setSkillId] = useState(1);
  const [brief, setBrief] = useState("");
  const [rewardUsd, setRewardUsd] = useState("50");
  const [days, setDays] = useState("3");
  const [reviewCount, setReviewCount] = useState(2);
  const [bps, setBps] = useState(() => defaultSlotBps(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slotCount = reviewCount + 1;
  const bpsSum = useMemo(
    () => bps.slice(0, slotCount).reduce((a, b) => a + b, 0),
    [bps, slotCount]
  );

  function setReviewCountSafe(n: number) {
    setReviewCount(n);
    setBps(defaultSlotBps(n));
  }

  function setBpsAt(i: number, v: number) {
    const next = [...bps];
    next[i] = Math.max(0, Math.min(BPS_DENOM, Math.round(v)));
    for (let j = slotCount; j < MAX_SLOTS; j++) next[j] = 0;
    setBps(next);
  }

  async function onCreate() {
    if (!program || !publicKey || !wallet.signTransaction) {
      setError("Connect wallet first");
      return;
    }
    if (bpsSum !== BPS_DENOM) {
      setError(`Slot shares must sum to 100% (now ${(bpsSum / 100).toFixed(0)}%)`);
      return;
    }
    if (!brief.trim()) {
      setError("Add a short brief");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const reward = new BN(usdcToBaseUnits(Number(rewardUsd) || 0));
      if (reward.lten(0)) throw new Error("Reward must be > 0");
      const deadlineTs = new BN(
        Math.floor(Date.now() / 1000) + Math.max(1, Number(days) || 1) * 86400
      );
      const taskNonce = new BN(Date.now());
      const task = taskPda(publicKey, taskNonce);
      const [vaultAuthority] = vaultAuthorityPda(task);
      const vault = vaultAta(vaultAuthority);
      const clientAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);

      const slotBpsArr = [0, 0, 0, 0] as [number, number, number, number];
      for (let i = 0; i < MAX_SLOTS; i++) slotBpsArr[i] = bps[i] ?? 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (program.methods as any)
        .createTask(
          skillId,
          reward,
          deadlineTs,
          taskNonce,
          reviewCount,
          slotBpsArr
        )
        .accounts({
          client: publicKey,
          config: configPda(),
          mint: USDC_MINT,
          task,
          vaultAuthority,
          vault,
          clientTokenAccount: clientAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      saveTaskMeta(task.toBase58(), { brief: brief.trim() });
      router.push(`/app/tasks/${task.toBase58()}`);
    } catch (e) {
      setError(friendlyTxError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Client
      </p>
      <h1 className="app-page-title mt-1 text-3xl">Post a task</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Lock USDC for this task only. Choose N verifications and % across
        Execution → Primary → Audit…
      </p>

      <Panel className="mt-4 !border-[var(--border-strong)] !bg-[var(--accent-soft)]">
        <p className="text-sm font-semibold text-[var(--accent-ink)]">
          Devnet redeploy required
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Frontend expects the slot program. Error 101 means paste{" "}
          <code className="mono">programs/pico/src/lib.rs</code> into Playground →
          Deploy, then <code className="mono">initializeConfig</code>.
        </p>
      </Panel>
      <Panel className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Skill lane
          <select
            className={inputClass}
            value={skillId}
            onChange={(e) => setSkillId(Number(e.target.value))}
          >
            {SKILLS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Brief
          <textarea
            className={textareaClass}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Narrow scope: what to deliver + constraints"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Reward (USDC)"
            value={rewardUsd}
            onChange={setRewardUsd}
            placeholder="50"
          />
          <Field
            label="Deadline (days)"
            value={days}
            onChange={setDays}
            placeholder="3"
          />
        </div>

        <div>
          <p className="text-sm font-medium">Verification slots (N)</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={reviewCount === n ? "chip chip-active" : "chip"}
                onClick={() => setReviewCountSafe(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Team size = {slotCount} (1 Execution + {reviewCount} verification)
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Reward split (% of net)</p>
            <p
              className={`text-xs font-semibold ${
                bpsSum === BPS_DENOM ? "text-[var(--ok)]" : "text-[var(--danger)]"
              }`}
            >
              {(bpsSum / 100).toFixed(0)}% / 100%
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {Array.from({ length: slotCount }).map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs font-medium text-[var(--muted)]">
                  {slotLabel(i, slotCount)}
                </span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className={inputClass + " !mt-0"}
                  value={Math.round(bps[i] / 100)}
                  onChange={(e) => setBpsAt(i, Number(e.target.value) * 100)}
                />
                <span className="text-xs text-[var(--muted)]">%</span>
              </li>
            ))}
          </ul>
        </div>

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        <BtnPink loading={loading} onClick={() => void onCreate()} className="w-full">
          Lock USDC &amp; publish
        </BtnPink>
        <p className="text-xs text-[var(--muted)]">
          No prepaid wallet — escrow is per task. Cancel only while Qualifying.
        </p>
      </Panel>
    </div>
  );
}
