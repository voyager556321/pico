"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
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
import { QBANK, type TaskCategory } from "@/lib/types";
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
      "Task creation is temporarily unavailable. Please try again later."
    );
  }
  return raw;
}

export function NewTaskPage({ initialBrief = "" }: { initialBrief?: string }) {
  const router = useRouter();
  const wallet = useWallet();
  const { program, publicKey } = usePicoProgram();

  const [skillId, setSkillId] = useState(1);
  const [brief, setBrief] = useState(initialBrief);
  const [rewardUsd, setRewardUsd] = useState("50");
  const [days, setDays] = useState("3");
  const [reviewCount, setReviewCount] = useState(2);
  const [bps, setBps] = useState(() => defaultSlotBps(2));
  const [step, setStep] = useState(1);
  const [criteria, setCriteria] = useState(["The result matches the written brief.", "Every deliverable is included and opens correctly.", "The work is complete at the agreed screen size."]);
  const [deliverables, setDeliverables] = useState(["Completed work with a short handoff note"]);
  const [testState, setTestState] = useState<"ready" | "generating" | "generated">("ready");
  const [independentVerification, setIndependentVerification] = useState(false);
  const [lowBalancePreview, setLowBalancePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slotCount = reviewCount + 1;
  const taskCategory: TaskCategory = skillId === 3 ? "QA & Testing" : skillId === 4 ? "Design" : "Development";
  const workerQuestions = QBANK[taskCategory];
  const bpsSum = useMemo(
    () => bps.slice(0, slotCount).reduce((a, b) => a + b, 0),
    [bps, slotCount]
  );

  useEffect(() => {
    if (testState !== "generating") return;
    const timer = window.setTimeout(() => setTestState("generated"), 700);
    return () => window.clearTimeout(timer);
  }, [testState]);

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
      setError("Sign in first");
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
    if (criteria.some((item) => !item.trim())) {
      setError("Complete or remove every empty criterion");
      setStep(2);
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

      saveTaskMeta(task.toBase58(), {
        brief: brief.trim(),
        criteria: criteria.map((item) => item.trim()),
        deliverables: deliverables.map((item) => item.trim()).filter(Boolean),
        independentVerification,
      });
      router.push(`/app/tasks/${task.toBase58()}`);
    } catch (e) {
      setError(friendlyTxError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="proto-stack narrow">
      <header className="proto-page-title">
        <div>
          <p className="proto-eyebrow">Client · Step {step} of 4</p>
          <h1>{step === 1 ? "Describe the task" : step === 2 ? "Scope & criteria" : step === 3 ? "Skill test" : "Budget & publish"}</h1>
          <p className="proto-subtitle">A clear brief and checkable criteria help us find the right specialist.</p>
        </div>
        <Link className="app-cta-ghost" href="/app">Save draft</Link>
      </header>

      <nav className="proto-wizard-steps" aria-label="Task creation steps">
        {["Describe", "Scope", "Specialist test", "Budget"].map((label, index) => (
          <button type="button" key={label} aria-current={step === index + 1 ? "step" : undefined} className={step === index + 1 ? "current" : step > index + 1 ? "complete" : ""} onClick={() => { setStep(index + 1); setError(""); }}>
            <span>{index + 1}</span>{label}
          </button>
        ))}
      </nav>

      <Panel className="space-y-4">
        {step === 1 && <>
          <div><p className="proto-eyebrow">Step 1 · Describe</p><h2 className="text-lg font-bold">What do you need done?</h2><p className="mt-1 text-xs text-[var(--muted)]">Choose a skill lane and write a narrow, outcome-focused brief.</p></div>
          <div className="proto-skill-grid">
            {SKILLS.map((skill) => (
              <button type="button" key={skill.id} className={skillId === skill.id ? "proto-skill-card selected" : "proto-skill-card"} onClick={() => setSkillId(skill.id)} aria-pressed={skillId === skill.id}>
                <span>{skill.id === 1 ? "⌘" : skill.id === 2 ? "⌕" : skill.id === 3 ? "✓" : "✦"}</span><b>{skill.label}</b><small>{skill.id === 1 ? "Review a codebase or change" : skill.id === 2 ? "Find and fix a technical issue" : skill.id === 3 ? "Test a flow and report defects" : "Create or refine a design"}</small>
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium">Task brief<textarea className={textareaClass} rows={5} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Describe the result, constraints, and what a successful delivery looks like." /></label>
        </>}

        {step === 2 && <>
          <div><p className="proto-eyebrow">Step 2 · Scope &amp; criteria</p><h2 className="text-lg font-bold">Make success easy to verify.</h2><p className="mt-1 text-xs text-[var(--muted)]">Specialists see the criteria before they qualify. Each one should be answerable yes or no.</p></div>
          <div className="proto-wizard-list">
            {criteria.map((criterion, index) => <div className="proto-wizard-item" key={index}><span>{index + 1}</span><input aria-label={`Criterion ${index + 1}`} value={criterion} placeholder="Something a reviewer can check with yes or no" onChange={(event) => setCriteria((items) => items.map((item, i) => i === index ? event.target.value : item))} /><button type="button" onClick={() => setCriteria((items) => items.filter((_, i) => i !== index))} aria-label={`Remove criterion ${index + 1}`}>×</button></div>)}
          </div>
          <button type="button" className="app-cta-ghost" onClick={() => setCriteria((items) => [...items, ""])}>＋ Add a criterion</button>
          <div className="proto-wizard-list">
            <p className="proto-eyebrow">Deliverables</p>
            {deliverables.map((deliverable, index) => <div className="proto-wizard-item" key={index}><span>↳</span><input aria-label={`Deliverable ${index + 1}`} value={deliverable} placeholder="e.g. Figma file with named layers" onChange={(event) => setDeliverables((items) => items.map((item, i) => i === index ? event.target.value : item))} /><button type="button" onClick={() => setDeliverables((items) => items.filter((_, i) => i !== index))} aria-label={`Remove deliverable ${index + 1}`}>×</button></div>)}
          </div>
          <button type="button" className="app-cta-ghost" onClick={() => setDeliverables((items) => [...items, ""])}>＋ Add a deliverable</button>
          <label className="block text-sm font-medium">Deadline (days after assignment)<input className={inputClass} type="number" min={1} max={30} value={days} onChange={(event) => setDays(event.target.value)} /></label>
        </>}

        {step === 3 && <>
          <div><p className="proto-eyebrow">Step 3 · Skill test</p><h2 className="text-lg font-bold">Qualification checks task-specific skills.</h2><p className="mt-1 text-xs text-[var(--muted)]">We suggest a timed test from your criteria. Review the questions before publishing.</p></div>
          {testState === "ready" && <div className="proto-test-preview"><span className="proto-test-icon">✦</span><div><b>Ready to generate</b><p>{criteria.length} criteria · {workerQuestions.length} suggested questions · up to 15 minutes</p></div></div>}
          {testState === "generating" && <div className="proto-test-preview"><span className="spin" /><div><b>Generating skill test…</b><p>Preparing task-specific qualification questions.</p></div></div>}
          {testState === "generated" && <div className="proto-question-list">{workerQuestions.slice(0, 3).map((question, index) => <article key={question.q}><p className="proto-eyebrow">Question {index + 1} · {question.k}</p><b>{question.q}</b><div>{question.o.map((option) => <span key={option}>{option}</span>)}</div></article>)}</div>}
          <div className="proto-form-actions">
            <button type="button" className="app-cta" disabled={testState === "generating"} onClick={() => setTestState(testState === "generated" ? "ready" : "generating")}>{testState === "generated" ? "Regenerate test" : testState === "generating" ? "Generating…" : "Generate worker test"}</button>
            {testState === "generated" && <button type="button" className="app-cta-ghost" onClick={() => setTestState("ready")}>Clear preview</button>}
          </div>
        </>}

        {step === 4 && <>
          <div><p className="proto-eyebrow">Step 4 · Budget &amp; publish</p><h2 className="text-lg font-bold">Set the reward and team.</h2><p className="mt-1 text-xs text-[var(--muted)]">The budget is reserved for this task only.</p></div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Task budget ($)" value={rewardUsd} onChange={(value) => { setRewardUsd(value); setLowBalancePreview(false); }} placeholder="50" />
            <Field label="Deadline (days)" value={days} onChange={setDays} placeholder="3" />
          </div>
          <div><p className="text-sm font-medium">Verification slots</p><div className="mt-2 flex gap-2">{[1, 2, 3].map((count) => <button key={count} type="button" className={reviewCount === count ? "chip chip-active" : "chip"} onClick={() => setReviewCountSafe(count)}>{count}</button>)}</div><p className="mt-2 text-xs text-[var(--muted)]">Team size = {slotCount} (1 Execution + {reviewCount} verification)</p></div>
          <div><div className="flex items-center justify-between"><p className="text-sm font-medium">Reward split (% of net)</p><p className={`text-xs font-semibold ${bpsSum === BPS_DENOM ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}>{(bpsSum / 100).toFixed(0)}% / 100%</p></div><ul className="mt-3 space-y-2">{Array.from({ length: slotCount }).map((_, index) => <li key={index} className="flex items-center gap-3"><span className="w-40 shrink-0 text-xs font-medium text-[var(--muted)]">{slotLabel(index, slotCount)}</span><input type="number" min={1} max={100} className={inputClass + " !mt-0"} value={Math.round(bps[index] / 100)} onChange={(event) => setBpsAt(index, Number(event.target.value) * 100)} /><span className="text-xs text-[var(--muted)]">%</span></li>)}</ul></div>
          <label className="proto-check"><input type="checkbox" checked={independentVerification} onChange={(event) => setIndependentVerification(event.target.checked)} /> Independent verification preview <span className="text-xs text-[var(--muted)]">(reviewer fee setup is not yet on-chain)</span></label>
          <button type="button" className="app-cta-ghost self-start" onClick={() => setLowBalancePreview((value) => !value)}>{lowBalancePreview ? "Hide" : "Preview"} insufficient-balance state</button>
          {lowBalancePreview && <div className="proto-low-balance" role="status"><b>Not enough balance</b><p>Add funds to your balance to publish this task. Add funds, then return to publish.</p><Link href="/app/balance">Go to balance →</Link></div>}
          {!lowBalancePreview && <div className="proto-cost-summary"><span>Task reward<b>{Number(rewardUsd || 0).toFixed(2)} </b></span><span>Team size<b>{slotCount} seats</b></span><span>Qualification<b>Free</b></span></div>}
        </>}

        {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}
        <div className="proto-form-actions proto-wizard-footer">
          {step > 1 ? <button type="button" className="app-cta-ghost" onClick={() => { setStep((current) => current - 1); setError(""); }}>← Back</button> : <Link className="app-cta-ghost" href="/app">Cancel</Link>}
          {step < 4 ? <button type="button" className="app-cta" onClick={() => { if (step === 1 && !brief.trim()) { setError("Add a short task brief before continuing."); return; } if (step === 3 && testState !== "generated") { setError("Generate and review the worker test before continuing."); return; } setError(""); setStep((current) => current + 1); }}>Continue →</button> : <BtnPink loading={loading} disabled={lowBalancePreview} onClick={() => void onCreate()} className="ml-auto">Lock USDC &amp; publish</BtnPink>}
        </div>
        <p className="text-xs text-[var(--muted)]">The budget is reserved for this task only. You can cancel until a specialist is assigned.</p>
      </Panel>
    </div>
  );
}
