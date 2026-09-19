"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  TOOLS,
  USDC_MINT,
  baseUnitsToUsdc,
  usdcToBaseUnits,
} from "@/lib/constants";
import { budgetPda, configPda, vaultAta, vaultAuthorityPda } from "@/lib/pdas";
import { fetchBudgetAccount, getPicoProgram } from "@/lib/program";
import { PaymentModal } from "@/components/app/PaymentModal";
import {
  AppShell,
  BackLink,
  BrandLink,
  BtnGhost,
  BtnPink,
  CostRow,
  Field,
  Panel,
  StatusPill,
} from "@/components/app/ui";

type View = "dashboard" | "tokenCheck" | "explainTx" | "agent";
type ModalKind = "deposit" | "withdraw" | null;
type ModalPhase = "form" | "pending" | "success" | "error";

type HistoryItem = {
  tool: string;
  priceUsd: number;
  remainingUsd: number;
  tx?: string;
  result?: string;
  status: "Confirmed" | "Failed" | "Pending";
  at: string;
};

type AgentCall = {
  label: string;
  priceUsd: number;
  status: "Confirmed" | "Processing" | "Stopped";
};

type ToolResult = {
  title: string;
  body: string;
  charged: number;
  remaining: number;
  tx?: string;
};

const AGENT_CALLS = 8;
const AGENT_PRICE = TOOLS.explainTx.priceUsd;

export function PicoApp() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [view, setView] = useState<View>("dashboard");
  const [budgetUsd, setBudgetUsd] = useState<number | null>(null);
  const [depositedUsd, setDepositedUsd] = useState(0);
  const [spentUsd, setSpentUsd] = useState(0);
  const [walletUsdc, setWalletUsdc] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txInput, setTxInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);
  const [toolError, setToolError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [modal, setModal] = useState<ModalKind>(null);
  const [modalPhase, setModalPhase] = useState<ModalPhase>("form");
  const [modalAmount, setModalAmount] = useState(1);
  const [modalError, setModalError] = useState("");

  const [agentRunning, setAgentRunning] = useState(false);
  const [agentCalls, setAgentCalls] = useState<AgentCall[]>([]);
  const [agentDone, setAgentDone] = useState(false);
  const [agentBlocked, setAgentBlocked] = useState("");

  useEffect(() => setMounted(true), []);

  const owner = wallet.publicKey;

  const refresh = useCallback(async () => {
    if (!owner || !wallet.signTransaction) {
      setBudgetUsd(null);
      setWalletUsdc(null);
      setDepositedUsd(0);
      setSpentUsd(0);
      return;
    }
    try {
      const anchorWallet = wallet as unknown as import("@coral-xyz/anchor").Wallet;
      const program = getPicoProgram(connection, anchorWallet);
      const budget = await fetchBudgetAccount(program, owner);
      if (!budget) {
        setBudgetUsd(null);
        setDepositedUsd(0);
        setSpentUsd(0);
      } else {
        const vaultBal = await getAccount(connection, budget.vault);
        setBudgetUsd(baseUnitsToUsdc(vaultBal.amount));
        setDepositedUsd(baseUnitsToUsdc(budget.totalDeposited.toNumber()));
        setSpentUsd(baseUnitsToUsdc(budget.totalSpent.toNumber()));
      }
      const ata = getAssociatedTokenAddressSync(USDC_MINT, owner);
      try {
        const acc = await getAccount(connection, ata);
        setWalletUsdc(baseUnitsToUsdc(acc.amount));
      } catch {
        setWalletUsdc(0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [connection, owner, wallet]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canTransact = useMemo(
    () => Boolean(owner && wallet.signTransaction),
    [owner, wallet.signTransaction]
  );

  const limitUsd = Math.max(depositedUsd, (budgetUsd ?? 0) + spentUsd);
  const progressPct =
    limitUsd > 0 ? Math.min(100, (spentUsd / limitUsd) * 100) : 0;
  const emptyBudget = budgetUsd !== null && budgetUsd <= 0;

  function openDeposit() {
    setModal("deposit");
    setModalPhase("form");
    setModalAmount(1);
    setModalError("");
  }

  function openWithdraw() {
    setModal("withdraw");
    setModalPhase("form");
    setModalError("");
  }

  async function onDeposit(amountUsd: number) {
    if (!owner || !wallet.signTransaction) return;
    setLoading(true);
    setModalPhase("pending");
    setModalError("");
    try {
      const anchorWallet = wallet as unknown as import("@coral-xyz/anchor").Wallet;
      const program = getPicoProgram(connection, anchorWallet);
      const existing = await fetchBudgetAccount(program, owner);
      const ownerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, owner);
      const amount = new BN(usdcToBaseUnits(amountUsd));
      const budget = budgetPda(owner);
      const [vaultAuthority] = vaultAuthorityPda(budget);
      const vault = vaultAta(vaultAuthority);

      if (!existing) {
        await program.methods
          .initializeBudget(amount)
          .accounts({
            owner,
            config: configPda(),
            mint: USDC_MINT,
            budget,
            vaultAuthority,
            vault,
            ownerTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } else {
        await program.methods
          .deposit(amount)
          .accounts({
            owner,
            budget,
            vault,
            ownerTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      }
      await refresh();
      setModalPhase("success");
    } catch (e) {
      console.error(e);
      setModalError(e instanceof Error ? e.message : "Deposit failed");
      setModalPhase("error");
    } finally {
      setLoading(false);
    }
  }

  async function onWithdraw() {
    if (!owner || !wallet.signTransaction) return;
    setLoading(true);
    setModalPhase("pending");
    setModalError("");
    try {
      const anchorWallet = wallet as unknown as import("@coral-xyz/anchor").Wallet;
      const program = getPicoProgram(connection, anchorWallet);
      const budget = budgetPda(owner);
      const [vaultAuthority] = vaultAuthorityPda(budget);
      const vault = vaultAta(vaultAuthority);
      const ownerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, owner);
      await program.methods
        .withdrawRemaining()
        .accounts({
          owner,
          budget,
          vaultAuthority,
          vault,
          ownerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      await refresh();
      setModalPhase("success");
    } catch (e) {
      console.error(e);
      setModalError(e instanceof Error ? e.message : "Withdraw failed");
      setModalPhase("error");
    } finally {
      setLoading(false);
    }
  }

  async function runTool(tool: "explainTx" | "tokenCheck", input: string) {
    if (!owner) return;
    const meta = TOOLS[tool];
    setToolError("");
    setToolResult(null);
    if (budgetUsd !== null && budgetUsd < meta.priceUsd) {
      setToolError(
        `This check costs $${meta.priceUsd.toFixed(2)}. You have $${(budgetUsd ?? 0).toFixed(2)}. Add funds to start.`
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input, owner: owner.toBase58() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tool failed");
      setToolResult({
        title: tool === "tokenCheck" ? "AI Analysis" : "AI Insights",
        body: data.result,
        charged: meta.priceUsd,
        remaining: data.remainingUsd,
        tx: data.debitTx,
      });
      setHistory((h) => [
        {
          tool: meta.name,
          priceUsd: meta.priceUsd,
          remainingUsd: data.remainingUsd,
          tx: data.debitTx,
          result: data.result,
          status: "Confirmed",
          at: new Date().toLocaleTimeString(),
        },
        ...h,
      ]);
      await refresh();
    } catch (e) {
      console.error(e);
      setToolError(
        e instanceof Error
          ? e.message
          : `${meta.name} failed. Something went wrong. No credits charged.`
      );
      setHistory((h) => [
        {
          tool: meta.name,
          priceUsd: meta.priceUsd,
          remainingUsd: budgetUsd ?? 0,
          status: "Failed",
          at: new Date().toLocaleTimeString(),
        },
        ...h,
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function runAgentDemo() {
    if (!owner) return;
    if (budgetUsd !== null && budgetUsd < AGENT_PRICE) {
      openDeposit();
      return;
    }
    setAgentRunning(true);
    setAgentDone(false);
    setAgentBlocked("");
    setAgentCalls([]);
    setView("agent");
    let remaining = budgetUsd;
    try {
      for (let i = 0; i < AGENT_CALLS; i++) {
        if (remaining !== null && remaining < AGENT_PRICE) {
          setAgentBlocked(
            `Budget limit reached! The next call needs $${AGENT_PRICE.toFixed(2)} more and is blocked.`
          );
          setAgentCalls((prev) => [
            ...prev,
            {
              label: `Call ${String(i + 1).padStart(2, "0")}: Explain Tx`,
              priceUsd: AGENT_PRICE,
              status: "Stopped",
            },
          ]);
          break;
        }

        const label = `Call ${String(i + 1).padStart(2, "0")}: Explain Tx`;
        setAgentCalls((prev) => [
          ...prev,
          { label, priceUsd: AGENT_PRICE, status: "Processing" },
        ]);

        const res = await fetch("/api/tools/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "explainTx",
            input: `demo-call-${i + 1}`,
            owner: owner.toBase58(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Agent demo failed");
        remaining = data.remainingUsd;
        setBudgetUsd(data.remainingUsd);
        setAgentCalls((prev) =>
          prev.map((c) =>
            c.label === label ? { ...c, status: "Confirmed" as const } : c
          )
        );
        setHistory((h) => [
          {
            tool: `Agent Explain #${i + 1}`,
            priceUsd: AGENT_PRICE,
            remainingUsd: data.remainingUsd,
            tx: data.debitTx,
            status: "Confirmed",
            at: new Date().toLocaleTimeString(),
          },
          ...h,
        ]);
        await new Promise((r) => setTimeout(r, 1200));
      }
      setAgentDone(true);
      await refresh();
    } catch (e) {
      console.error(e);
      setAgentBlocked(e instanceof Error ? e.message : "Agent demo failed");
    } finally {
      setAgentRunning(false);
    }
  }

  const shortOwner = owner
    ? `${owner.toBase58().slice(0, 4)}…${owner.toBase58().slice(-4)}`
    : null;

  const agentEst = AGENT_CALLS * AGENT_PRICE;
  const agentProgress = agentCalls.filter((c) => c.status === "Confirmed").length;

  return (
    <AppShell>
      {view === "dashboard" ? (
        <>
          <header className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandLink />
              {shortOwner ? (
                <span className="hidden text-xs text-[var(--muted)] sm:inline">
                  {shortOwner}
                </span>
              ) : null}
            </div>
            {mounted ? (
              <WalletMultiButton />
            ) : (
              <div className="h-11 w-36 rounded-xl border border-white/10 bg-white/5" />
            )}
          </header>

          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--muted)]">Available Budget</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">
                  {budgetUsd === null ? "$0.00" : `$${budgetUsd.toFixed(2)}`}{" "}
                  <span className="text-base font-medium text-[var(--muted)]">
                    USDC
                  </span>
                </p>
              </div>
              <BtnGhost
                className="!px-3 !py-2 text-xs"
                disabled={!canTransact || loading}
                onClick={() => void refresh()}
              >
                Refresh
              </BtnGhost>
            </div>

            {emptyBudget ? (
              <div className="mt-4 rounded-xl border border-[#ffb800]/35 bg-[rgba(255,184,0,0.1)] px-3 py-2.5 text-sm text-[#ffb800]">
                Your budget is empty. Add funds to run tools.
              </div>
            ) : null}

            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
                <span>Spent ${spentUsd.toFixed(2)}</span>
                <span>
                  {limitUsd > 0 ? `$${limitUsd.toFixed(2)} limit` : "No limit yet"}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-[var(--muted)]">
              This is a spending limit, not full wallet access.
              {walletUsdc !== null ? ` Wallet USDC: $${walletUsdc.toFixed(2)}.` : null}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <BtnPink
                className="justify-center py-3"
                disabled={!canTransact || loading}
                onClick={openDeposit}
              >
                Add funds
              </BtnPink>
              <BtnGhost
                className="py-3"
                disabled={!canTransact || loading || !budgetUsd}
                onClick={openWithdraw}
              >
                Withdraw
              </BtnGhost>
            </div>

            {!owner ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Connect Phantom (Devnet) to start.
              </p>
            ) : null}
          </Panel>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">AI Tools</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ToolCard
                title="Token Check"
                description="Check a token for risks and red flags before you interact with it."
                price={TOOLS.tokenCheck.priceUsd}
                onOpen={() => {
                  setToolResult(null);
                  setToolError("");
                  setView("tokenCheck");
                }}
              />
              <ToolCard
                title="Explain Transaction"
                description="Turn any Solana transaction into a plain-English explanation."
                price={TOOLS.explainTx.priceUsd}
                onOpen={() => {
                  setToolResult(null);
                  setToolError("");
                  setView("explainTx");
                }}
              />
            </div>
          </div>

          <Panel className="mt-4">
            <h2 className="text-lg font-semibold">Agent Demo</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              An AI agent runs prepaid tasks in a row. It can never spend more
              than your prepaid budget.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Calls" value={String(AGENT_CALLS)} />
              <Stat label="Estimated max" value={`$${agentEst.toFixed(2)}`} />
              <Stat
                label="Available budget"
                value={budgetUsd === null ? "—" : `$${budgetUsd.toFixed(2)}`}
              />
            </div>
            <BtnPink
              className="mt-4 w-full justify-center py-3.5"
              disabled={!canTransact || loading || agentRunning}
              onClick={() => void runAgentDemo()}
            >
              Run demo — max ${agentEst.toFixed(2)}
            </BtnPink>
          </Panel>

          <Panel className="mt-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                No activity yet. Open a tool to get started.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {history.map((item, i) => (
                  <li
                    key={`${item.at}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.tool}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {item.at} · ${item.priceUsd.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill
                        tone={
                          item.status === "Confirmed"
                            ? "ok"
                            : item.status === "Failed"
                              ? "err"
                              : "info"
                        }
                      >
                        {item.status}
                      </StatusPill>
                      {item.tx ? (
                        <a
                          className="text-xs font-medium text-[var(--pink)]"
                          href={`https://explorer.solana.com/tx/${item.tx}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on Explorer
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      ) : null}

      {view === "tokenCheck" ? (
        <ToolScreen
          title="Token Check"
          subtitle="Check a token for risks and red flags before you interact with it."
          price={TOOLS.tokenCheck.priceUsd}
          priceUnit="/ check"
          budgetUsd={budgetUsd}
          fieldLabel="Token mint address"
          fieldPlaceholder="Paste mint address"
          value={tokenInput}
          onChange={setTokenInput}
          afterLabel="After check"
          runLabel={
            loading
              ? "Checking token…"
              : `Run Token Check — $${TOOLS.tokenCheck.priceUsd.toFixed(2)}`
          }
          loading={loading}
          canRun={canTransact}
          error={toolError}
          result={toolResult}
          emptyHint="No result yet. Paste a token address above and run the check to see analysis here."
          onBack={() => setView("dashboard")}
          onRun={() => {
            if (!tokenInput.trim()) {
              setToolError("Paste a token mint address first.");
              return;
            }
            void runTool("tokenCheck", tokenInput.trim());
          }}
          onTopUp={openDeposit}
        />
      ) : null}

      {view === "explainTx" ? (
        <ToolScreen
          title="Explain Transaction"
          subtitle="Turn any Solana transaction into a plain-English explanation."
          price={TOOLS.explainTx.priceUsd}
          priceUnit="/ analysis"
          budgetUsd={budgetUsd}
          fieldLabel="Transaction signature"
          fieldPlaceholder="Paste transaction signature"
          value={txInput}
          onChange={setTxInput}
          afterLabel="After the run"
          runLabel={
            loading
              ? "Analyzing transaction…"
              : `Run Explain Tx — $${TOOLS.explainTx.priceUsd.toFixed(2)}`
          }
          loading={loading}
          canRun={canTransact}
          error={toolError}
          result={toolResult}
          emptyHint="No result yet. Paste a signature and run the tool to see the AI analysis here."
          onBack={() => setView("dashboard")}
          onRun={() => {
            if (!txInput.trim()) {
              setToolError("Paste a Solana transaction signature first.");
              return;
            }
            void runTool("explainTx", txInput.trim());
          }}
          onTopUp={openDeposit}
        />
      ) : null}

      {view === "agent" ? (
        <div>
          <BackLink onClick={() => setView("dashboard")} />
          <Panel>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--purple)]/30 text-xs font-bold text-[var(--pink)]">
                AD
              </div>
              <div>
                <h1 className="text-xl font-semibold">Agent Demo</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  An AI agent runs one prepaid task in a row. It can never spend
                  more than your prepaid budget.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Calls" value={String(AGENT_CALLS)} />
              <Stat label="Est. spend" value={`$${agentEst.toFixed(2)}`} />
              <Stat
                label="Available budget"
                value={budgetUsd === null ? "—" : `$${budgetUsd.toFixed(2)}`}
              />
              <Stat label="Required" value={`$${agentEst.toFixed(2)}`} />
            </div>

            <BtnPink
              className="mt-4 w-full justify-center"
              disabled={!canTransact}
              loading={agentRunning}
              onClick={() => {
                if (budgetUsd !== null && budgetUsd < AGENT_PRICE) {
                  openDeposit();
                  return;
                }
                void runAgentDemo();
              }}
            >
              {agentRunning
                ? `${agentProgress} of ${AGENT_CALLS}`
                : budgetUsd !== null && budgetUsd < AGENT_PRICE
                  ? "Add Funds"
                  : agentDone
                    ? "Run demo again"
                    : `Run Agent Demo — max $${agentEst.toFixed(2)}`}
            </BtnPink>
          </Panel>

          {!agentRunning && agentCalls.length === 0 && !agentDone ? (
            <Panel className="mt-4">
              <h2 className="font-semibold">What happens when you run it</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                The agent checks each call one by one. Charges come from your
                prepaid budget only — never from unrestricted wallet access.
              </p>
            </Panel>
          ) : null}

          {agentCalls.length > 0 ? (
            <Panel className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  {agentRunning
                    ? "Running agent…"
                    : agentBlocked
                      ? "Run stopped"
                      : "Run completed"}
                </p>
                <span className="text-sm text-[var(--muted)]">
                  {agentProgress} / {AGENT_CALLS}
                </span>
              </div>
              <div className="progress-track mt-3">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(agentProgress / AGENT_CALLS) * 100}%`,
                    background: agentBlocked
                      ? "#ffb800"
                      : undefined,
                  }}
                />
              </div>
              <ul className="mt-4 space-y-2">
                {agentCalls.map((c) => (
                  <li
                    key={c.label}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-[var(--muted)]">{c.label}</span>
                    <div className="flex items-center gap-3">
                      <span>${c.priceUsd.toFixed(2)}</span>
                      <StatusPill
                        tone={
                          c.status === "Confirmed"
                            ? "ok"
                            : c.status === "Stopped"
                              ? "warn"
                              : "info"
                        }
                      >
                        {c.status}
                      </StatusPill>
                    </div>
                  </li>
                ))}
              </ul>
              {agentBlocked ? (
                <div className="mt-4 rounded-xl border border-[#ffb800]/35 bg-[rgba(255,184,0,0.1)] px-3 py-2.5 text-sm text-[#ffb800]">
                  {agentBlocked}
                </div>
              ) : null}
              {agentDone && !agentBlocked ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted)]">
                  <span>
                    Remaining budget: $
                    {(budgetUsd ?? 0).toFixed(2)} · Payment status:{" "}
                    <span className="text-[var(--ok)]">Confirmed</span>
                  </span>
                </div>
              ) : null}
            </Panel>
          ) : null}
        </div>
      ) : null}

      <PaymentModal
        kind={modal}
        phase={modalPhase}
        amount={modalAmount}
        available={budgetUsd}
        error={modalError}
        loading={loading}
        onAmount={setModalAmount}
        onClose={() => {
          setModal(null);
          setModalPhase("form");
        }}
        onConfirmDeposit={() => void onDeposit(modalAmount)}
        onConfirmWithdraw={() => void onWithdraw()}
        onRetry={() => setModalPhase("form")}
      />
    </AppShell>
  );
}

function ToolCard({
  title,
  description,
  price,
  onOpen,
}: {
  title: string;
  description: string;
  price: number;
  onOpen: () => void;
}) {
  return (
    <Panel className="!p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full border border-[var(--pink)]/30 bg-[var(--pink)]/10 px-2.5 py-0.5 text-xs text-[var(--pink)]">
          ${price.toFixed(2)}
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      <BtnPink className="mt-4 w-full justify-center py-2.5 text-sm" onClick={onOpen}>
        Open tool
      </BtnPink>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-2.5">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ToolScreen({
  title,
  subtitle,
  price,
  priceUnit,
  budgetUsd,
  fieldLabel,
  fieldPlaceholder,
  value,
  onChange,
  afterLabel,
  runLabel,
  loading,
  canRun,
  error,
  result,
  emptyHint,
  onBack,
  onRun,
  onTopUp,
}: {
  title: string;
  subtitle: string;
  price: number;
  priceUnit: string;
  budgetUsd: number | null;
  fieldLabel: string;
  fieldPlaceholder: string;
  value: string;
  onChange: (v: string) => void;
  afterLabel: string;
  runLabel: string;
  loading: boolean;
  canRun: boolean;
  error: string;
  result: ToolResult | null;
  emptyHint: string;
  onBack: () => void;
  onRun: () => void;
  onTopUp: () => void;
}) {
  const after =
    budgetUsd === null ? null : Math.max(0, budgetUsd - price);
  const needFunds = budgetUsd !== null && budgetUsd < price;

  return (
    <div>
      <BackLink onClick={onBack} />
      <Panel>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-2.5">
            <p className="text-xs text-[var(--muted)]">Price</p>
            <p className="mt-1 font-semibold">
              ${price.toFixed(2)} {priceUnit}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-2.5">
            <p className="text-xs text-[var(--muted)]">Available budget</p>
            <p className="mt-1 font-semibold">
              {budgetUsd === null ? "—" : `$${budgetUsd.toFixed(2)}`}
            </p>
          </div>
        </div>

        <Field
          label={fieldLabel}
          value={value}
          onChange={onChange}
          placeholder={fieldPlaceholder}
        />

        <CostRow
          cost={price}
          available={budgetUsd}
          afterLabel={afterLabel}
          after={after}
        />

        {needFunds ? (
          <div className="mt-4 rounded-xl border border-[var(--danger)]/30 bg-[rgba(255,107,138,0.1)] px-3 py-3 text-sm">
            <p className="text-[var(--danger)]">
              This check costs ${price.toFixed(2)}. You have $
              {(budgetUsd ?? 0).toFixed(2)}. Add funds to start a check.
            </p>
            <BtnPink className="mt-3 justify-center px-4 py-2 text-sm" onClick={onTopUp}>
              Top up now
            </BtnPink>
          </div>
        ) : null}

        {error && !needFunds ? (
          <div className="mt-4 rounded-xl border border-[var(--danger)]/30 bg-[rgba(255,107,138,0.1)] px-3 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <BtnPink
          className="mt-4 w-full justify-center"
          disabled={!canRun || needFunds}
          loading={loading}
          onClick={onRun}
        >
          {error && !needFunds && !loading
            ? `Try again — $${price.toFixed(2)}`
            : runLabel}
        </BtnPink>
      </Panel>

      {result ? (
        <Panel className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{result.title}</h2>
            <StatusPill tone="ok">Confirmed</StatusPill>
          </div>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
            {result.body}
          </pre>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-4 text-sm text-[var(--muted)]">
            <span>
              Charged ${result.charged.toFixed(2)} · Remaining $
              {result.remaining.toFixed(2)}
            </span>
            {result.tx ? (
              <a
                className="font-medium text-[var(--pink)]"
                href={`https://explorer.solana.com/tx/${result.tx}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
              >
                View on Explorer
              </a>
            ) : null}
          </div>
        </Panel>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-[var(--muted)]">
          {emptyHint}
        </div>
      )}
    </div>
  );
}
