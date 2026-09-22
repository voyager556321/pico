"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { USDC_MINT, shortPk } from "@/lib/constants";
import { LocalBotsLive } from "@/components/app/LocalBotsLive";
import { PresenceLive } from "@/components/app/PresenceLive";
import { PicoMark } from "@/components/app/ui";

export type AppMode = "hiring" | "working";

const MODE_KEY = "pico:appMode";

export function useAppMode(): [AppMode, (m: AppMode) => void] {
  const [mode, setModeState] = useState<AppMode>("hiring");

  useLayoutEffect(() => {
    try {
      const v = localStorage.getItem(MODE_KEY);
      if (v === "working" || v === "hiring") setModeState(v);
    } catch {
      /* ignore */
    }
  }, []);

  function setMode(m: AppMode) {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
  }

  return [mode, setMode];
}

function NavItem({
  href,
  label,
  hint,
  active,
}: {
  href: string;
  label: string;
  hint?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "app-nav-item app-nav-item-active !items-start"
          : "app-nav-item !items-start"
      }
    >
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] font-normal leading-snug text-[var(--app-muted)]">
            {hint}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useAppMode();
  const [mounted, setMounted] = useState(false);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [usdc, setUsdc] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setUsdc(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const ata = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
        const acc = await getAccount(connection, ata);
        if (!cancelled) setUsdc(Number(acc.amount) / 1e6);
      } catch {
        if (!cancelled) setUsdc(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  const isDash = pathname === "/app";
  const isFind = pathname.startsWith("/app/find");
  const isThreads = pathname.startsWith("/app/threads");
  const isNew = pathname.startsWith("/app/tasks/new");
  const isOp = pathname.startsWith("/app/operator");
  const isTask = pathname.startsWith("/app/tasks/") && !isNew;

  return (
    <div className="app-dark min-h-screen text-[var(--app-text)]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-sidebar)] px-3.5 py-6 max-lg:hidden">
          <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
            <PicoMark size={30} />
            <span className="text-[1.05rem] font-bold tracking-tight">pico</span>
          </Link>

          <div className="app-mode-toggle mx-0.5 mb-6">
            <button
              type="button"
              data-active={mode === "working"}
              onClick={() => setMode("working")}
            >
              Working
            </button>
            <button
              type="button"
              data-active={mode === "hiring"}
              onClick={() => setMode("hiring")}
            >
              Hiring
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5">
            <NavItem
              href="/app"
              label={mode === "hiring" ? "Hiring" : "Working"}
              hint="Your board"
              active={isDash}
            />
            <NavItem
              href="/app/find"
              label="Find tasks"
              hint="Open qualifies"
              active={isFind}
            />
            <NavItem
              href="/app/threads"
              label="Threads"
              hint="Topic rounds"
              active={isThreads}
            />
            <NavItem
              href="/app/tasks/new"
              label="Post a task"
              hint="Publish locally"
              active={isNew}
            />
            <NavItem
              href="/app/operator"
              label="Operator"
              hint="Seats the podium"
              active={isOp}
            />
            {isTask ? (
              <p className="mt-4 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
                Task open
              </p>
            ) : null}
          </nav>

          <div className="mt-auto space-y-1 border-t border-[var(--app-border)] pt-4">
            <NavItem href="/#pains" label="Why Pico" />
            <NavItem href="/#flow" label="How it works" />
            <div className="mt-3 rounded-[12px] border border-[var(--app-border)] bg-black/30 px-3 py-2.5">
              {publicKey ? (
                <>
                  <p className="text-[13px] font-semibold tracking-tight text-[var(--app-text)]">
                    {shortPk(publicKey.toBase58(), 4)}
                  </p>
                  <p className="mono mt-0.5 text-[10px] text-[var(--app-muted)]">
                    Devnet wallet
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-[var(--app-muted)]">
                  Connect wallet →
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Main + right */}
        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
            {/* mobile top bar */}
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <PicoMark size={26} />
                <span className="text-[15px] font-bold tracking-tight">pico</span>
              </Link>
              <div className="app-mode-toggle min-w-[140px]">
                <button
                  type="button"
                  data-active={mode === "working"}
                  onClick={() => setMode("working")}
                >
                  Work
                </button>
                <button
                  type="button"
                  data-active={mode === "hiring"}
                  onClick={() => setMode("hiring")}
                >
                  Hire
                </button>
              </div>
            </div>
            <nav className="mb-5 flex gap-2 overflow-x-auto lg:hidden">
              <Link href="/app" className={isDash ? "app-cta" : "app-cta-ghost"}>
                Board
              </Link>
              <Link href="/app/find" className={isFind ? "app-cta" : "app-cta-ghost"}>
                Find
              </Link>
              <Link href="/app/threads" className={isThreads ? "app-cta" : "app-cta-ghost"}>
                Threads
              </Link>
              <Link href="/app/tasks/new" className={isNew ? "app-cta" : "app-cta-ghost"}>
                Post
              </Link>
              <Link href="/app/operator" className={isOp ? "app-cta" : "app-cta-ghost"}>
                Operator
              </Link>
            </nav>
            <LocalBotsLive />
            <PresenceLive pathname={pathname} />
            {children}
          </div>

          {/* Right rail */}
          <aside className="hidden w-[272px] shrink-0 flex-col gap-3.5 border-l border-[var(--app-border)] bg-[var(--app-sidebar)]/80 p-4 xl:flex">
            <div className="app-rail-block">
              <p className="app-rail-label">Needs your action</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--app-muted)]">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)] align-middle" />
                Open a task hub for next steps
              </p>
            </div>

            <div className="app-rail-block">
              <p className="app-rail-label">Wallet</p>
              <div className="mt-3 space-y-2.5 text-[13px]">
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--app-muted)]">USDC</span>
                  <span className="font-semibold tabular-nums tracking-tight">
                    {usdc === null ? "—" : usdc.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--app-muted)]">Network</span>
                  <span className="font-medium text-[var(--app-muted)]">
                    Devnet
                  </span>
                </div>
              </div>
              <div className="mt-4">
                {mounted ? (
                  <div className="[&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!rounded-full [&_.wallet-adapter-button]:!h-[42px]">
                    <WalletMultiButton />
                  </div>
                ) : (
                  <div
                    className="app-cta w-full justify-center opacity-60"
                    aria-hidden
                  >
                    Connect wallet
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-[var(--app-muted)]">
                Per-task escrow only — no prepaid client vault.
              </p>
            </div>

            <div className="app-rail-block">
              <p className="app-rail-label">Platform fee</p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--app-text)]/90">
                Taken from escrow on payout (
                <code className="mono text-[11px] text-[var(--app-accent)]">
                  fee_bps
                </code>
                ). Slot % splits the net between Execution and verifiers.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
