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

type HistoryItem = {
  tool: string;
  priceUsd: number;
  remainingUsd: number;
  tx?: string;
  result?: string;
  at: string;
};

type Tab = "all" | "blockchain";

export function PicoApp() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [budgetUsd, setBudgetUsd] = useState<number | null>(null);
  const [depositedUsd, setDepositedUsd] = useState(0);
  const [spentUsd, setSpentUsd] = useState(0);
  const [walletUsdc, setWalletUsdc] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [txInput, setTxInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setStatus(e instanceof Error ? e.message : "Failed to refresh");
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

  async function onDeposit(amountUsd: number) {
    if (!owner || !wallet.signTransaction) return;
    setLoading(true);
    setStatus(`Confirming deposit…`);
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
      setStatus(`Budget activated · $${amountUsd.toFixed(2)} USDC`);
      await refresh();
    } catch (e) {
      console.error(e);
      setStatus(e instanceof Error ? e.message : "Deposit failed");
    } finally {
      setLoading(false);
    }
  }

  async function onWithdraw() {
    if (!owner || !wallet.signTransaction) return;
    setLoading(true);
    setStatus("Returning remaining USDC to your wallet…");
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
      setStatus("Remaining USDC returned to your wallet");
      await refresh();
    } catch (e) {
      console.error(e);
      setStatus(e instanceof Error ? e.message : "Withdraw failed");
    } finally {
      setLoading(false);
    }
  }

  async function runTool(tool: "explainTx" | "tokenCheck", input: string) {
    if (!owner) return;
    const meta = TOOLS[tool];
    if (budgetUsd !== null && budgetUsd < meta.priceUsd) {
      setStatus(
        `This check costs $${meta.priceUsd.toFixed(2)}. You have $${(budgetUsd ?? 0).toFixed(2)}.`
      );
      return;
    }
    setLoading(true);
    setStatus(tool === "tokenCheck" ? "Checking token…" : "Explaining transaction…");
    try {
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          input,
          owner: owner.toBase58(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tool failed");
      setLastResult(data.result);
      setHistory((h) => [
        {
          tool: meta.name,
          priceUsd: meta.priceUsd,
          remainingUsd: data.remainingUsd,
          tx: data.debitTx,
          result: data.result,
          at: new Date().toLocaleTimeString(),
        },
        ...h,
      ]);
      setStatus(
        `Charged $${meta.priceUsd.toFixed(2)} · $${data.remainingUsd.toFixed(2)} left`
      );
      await refresh();
    } catch (e) {
      console.error(e);
      setStatus(e instanceof Error ? e.message : "Tool failed");
    } finally {
      setLoading(false);
    }
  }

  async function runAgentDemo() {
    if (!owner) return;
    const calls = 8;
    const est = calls * 0.01;
    setLoading(true);
    setStatus(`Agent demo · est. max $${est.toFixed(2)}`);
    try {
      for (let i = 0; i < calls; i++) {
        if (budgetUsd !== null && budgetUsd < 0.01) {
          setStatus("Budget limit reached · Agent stopped");
          break;
        }
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
        setBudgetUsd(data.remainingUsd);
        setHistory((h) => [
          {
            tool: `Agent Explain #${i + 1}`,
            priceUsd: 0.01,
            remainingUsd: data.remainingUsd,
            tx: data.debitTx,
            at: new Date().toLocaleTimeString(),
          },
          ...h,
        ]);
        await new Promise((r) => setTimeout(r, 1200));
      }
      setStatus("Agent demo done");
      await refresh();
    } catch (e) {
      console.error(e);
      setStatus(e instanceof Error ? e.message : "Agent demo failed");
    } finally {
      setLoading(false);
    }
  }

  const shortOwner = owner
    ? `${owner.toBase58().slice(0, 4)}…${owner.toBase58().slice(-4)}`
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-10 pt-6 sm:max-w-2xl">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-2xl text-sm font-bold text-[#14081f]"
            style={{ background: "var(--grad)" }}
          >
            P
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">Pico</p>
            <p className="text-xs text-[var(--muted)]">Devnet · Solana</p>
          </div>
        </div>
        {mounted ? (
          <WalletMultiButton />
        ) : (
          <div className="h-11 w-36 rounded-2xl border border-[var(--border)] bg-[var(--panel)]" />
        )}
      </header>

      {/* Hero */}
      <section className="glass relative overflow-hidden rounded-[28px] p-6">
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full opacity-60"
          style={{ background: "var(--grad-soft)" }}
        />
        <p className="text-xs font-medium tracking-[0.18em] text-[var(--muted)] uppercase">
          AI tools
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
          Real control.{" "}
          <span className="grad-text">On-chain.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Use AI agents to analyze, explain and automate blockchain tasks — with
          full control over your spending.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip chip-active">Analyze</span>
          <span className="chip">Automate</span>
          <span className="chip">Simplify</span>
        </div>
        <p className="mt-5 text-xs text-[var(--muted)]">
          Built on Solana · Give your AI a budget, not your wallet
        </p>
        {shortOwner && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Connected · {shortOwner}
          </p>
        )}
      </section>

      {/* Budget card */}
      <section className="glass rounded-[28px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--muted)]">Available Budget</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              {budgetUsd === null ? "—" : (
                <>
                  ${budgetUsd.toFixed(2)}{" "}
                  <span className="text-base font-medium text-[var(--muted)]">
                    USDC
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            disabled={!canTransact || loading}
            onClick={() => void refresh()}
            className="chip text-xs disabled:opacity-40"
          >
            Refresh
          </button>
        </div>

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
          This is a spending limit, not full wallet access. Wallet USDC:{" "}
          {walletUsdc === null ? "—" : `$${walletUsdc.toFixed(2)}`}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 5].map((n) => (
            <button
              key={n}
              disabled={!canTransact || loading}
              onClick={() => void onDeposit(n)}
              className="grad-btn rounded-full px-4 py-2 text-sm disabled:opacity-40"
            >
              Add ${n}
            </button>
          ))}
          <button
            disabled={!canTransact || loading || !budgetUsd}
            onClick={() => void onWithdraw()}
            className="chip disabled:opacity-40"
          >
            Withdraw remaining
          </button>
        </div>

        {!owner && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Connect Phantom (Devnet) to start.
          </p>
        )}
      </section>

      {/* Tools tabs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tools</h2>
          <div className="flex gap-2">
            <button
              className={`chip ${tab === "all" ? "chip-active" : ""}`}
              onClick={() => setTab("all")}
            >
              All tools
            </button>
            <button
              className={`chip ${tab === "blockchain" ? "chip-active" : ""}`}
              onClick={() => setTab("blockchain")}
            >
              Blockchain
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <article className="glass rounded-[24px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{TOOLS.tokenCheck.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Check token info, price and risks.
                </p>
              </div>
              <span className="chip text-xs">${TOOLS.tokenCheck.priceUsd.toFixed(2)}</span>
            </div>
            <input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Token mint address"
              className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-black/25 px-4 py-3 text-sm outline-none focus:border-[var(--pink)]"
            />
            <div className="mt-2 text-xs text-[var(--muted)]">
              Cost ${TOOLS.tokenCheck.priceUsd.toFixed(2)}
              {budgetUsd !== null && (
                <>
                  {" "}
                  · Available ${budgetUsd.toFixed(2)} · After $
                  {Math.max(0, budgetUsd - TOOLS.tokenCheck.priceUsd).toFixed(2)}
                </>
              )}
            </div>
            <button
              disabled={!canTransact || loading}
              onClick={() => void runTool("tokenCheck", tokenInput || "demo")}
              className="grad-btn mt-3 w-full rounded-2xl px-4 py-3 text-sm"
            >
              Run Token Check · ${TOOLS.tokenCheck.priceUsd.toFixed(2)}
            </button>
          </article>

          <article className="glass rounded-[24px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">Explain Transaction</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Get a clear explanation of any transaction.
                </p>
              </div>
              <span className="chip text-xs">${TOOLS.explainTx.priceUsd.toFixed(2)}</span>
            </div>
            <input
              value={txInput}
              onChange={(e) => setTxInput(e.target.value)}
              placeholder="Transaction signature"
              className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-black/25 px-4 py-3 text-sm outline-none focus:border-[var(--pink)]"
            />
            <button
              disabled={!canTransact || loading}
              onClick={() => void runTool("explainTx", txInput || "demo")}
              className="grad-btn mt-3 w-full rounded-2xl px-4 py-3 text-sm"
            >
              Run Explain Tx · ${TOOLS.explainTx.priceUsd.toFixed(2)}
            </button>
          </article>
        </div>
      </section>

      {/* Agent demo */}
      <section className="glass rounded-[24px] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Agent Demo</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              8 calls · est. max $0.08 · hard budget limit
            </p>
          </div>
          <button
            disabled={!canTransact || loading}
            onClick={() => void runAgentDemo()}
            className="grad-btn rounded-2xl px-4 py-2.5 text-sm"
          >
            Run demo
          </button>
        </div>
      </section>

      {lastResult && (
        <section className="glass rounded-[24px] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">AI Insights</h2>
            <span className="chip text-xs">Beta</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
            {lastResult}
          </pre>
        </section>
      )}

      <section className="glass rounded-[24px] p-4">
        <h2 className="font-semibold">Activity</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No activity yet · Explore tools
          </p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {history.map((item, i) => (
              <li
                key={`${item.at}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.tool}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.at} · ${item.priceUsd.toFixed(2)}
                  </p>
                </div>
                <div className="text-right text-xs text-[var(--muted)]">
                  <p>${item.remainingUsd.toFixed(2)} left</p>
                  {item.tx && (
                    <a
                      className="grad-text font-medium"
                      href={`https://explorer.solana.com/tx/${item.tx}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View proof
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {status && (
        <p
          className="rounded-2xl border border-[var(--border)] bg-black/20 px-4 py-3 text-sm text-[var(--muted)]"
          aria-live="polite"
        >
          {status}
        </p>
      )}
    </main>
  );
}
