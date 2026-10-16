"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useEffect, useState } from "react";
import { IconSearch } from "@/components/icons";
import { ICONS, type IconName } from "@/components/icons";
import { PicoMark } from "@/components/app/ui";
import { USDC_MINT, shortPk } from "@/lib/constants";

export type AppMode = "hiring" | "working";

const MODE_KEY = "pico:appMode";

const NAV: [string, { label: string; icon: IconName; href: string }[]][] = [
  ["WORKSPACE", [
    { label: "Home", icon: "home", href: "/app" },
    { label: "My tasks", icon: "tasks", href: "/app/tasks" },
    { label: "Chats", icon: "chat", href: "/app/tasks/signup/room/conversation" },
    { label: "Balance", icon: "wallet", href: "/app/balance" },
    { label: "History", icon: "activity", href: "/app/activity" },
  ]],
  ["ACCOUNT", [
    { label: "Company profile", icon: "user", href: "/app/profile" },
    { label: "Settings", icon: "settings", href: "/app/settings" },
    { label: "Help & disputes", icon: "help", href: "/app/help" },
  ]],
  ["PICO", [
    { label: "About Pico", icon: "info", href: "/app/about" },
    { label: "How it works", icon: "arrow", href: "/app/how" },
  ]],
];

const PAGE_NAMES: [string, string][] = [
  ["/app/tasks/new", "Create task"],
  ["/app/tasks", "My tasks"],
  ["/app/activity", "History"],
  ["/app/balance", "Balance"],
  ["/app/profile", "Company profile"],
  ["/app/settings", "Settings"],
  ["/app/help", "Help & disputes"],
  ["/app/about", "About Pico"],
  ["/app/how", "How it works"],
  ["/app/operator", "Operator"],
];

export function useAppMode(): [AppMode, (mode: AppMode) => void] {
  const [mode, setModeState] = useState<AppMode>("hiring");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MODE_KEY);
      if (stored === "working" || stored === "hiring") setModeState(stored);
    } catch {
      return;
    }
  }, []);

  function setMode(nextMode: AppMode) {
    setModeState(nextMode);
    try {
      localStorage.setItem(MODE_KEY, nextMode);
    } catch {
      return;
    }
  }

  return [mode, setMode];
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useAppMode();
  const [mounted, setMounted] = useState(false);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [usdc, setUsdc] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!publicKey) {
      setUsdc(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const ata = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
        const account = await getAccount(connection, ata);
        if (!cancelled) setUsdc(Number(account.amount) / 1e6);
      } catch {
        if (!cancelled) setUsdc(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  const pageName = pathname === "/app"
    ? "Home"
    : PAGE_NAMES.find(([href]) => pathname === href || (href !== "/app/tasks" && pathname.startsWith(`${href}/`)))?.[1]
      ?? (pathname.includes("/room/") ? "Workroom" : "Task details");

  return (
    <div className="app">
      <aside className="sb">
        <div className="brandrow">
          <Link href="/app" className="logo" aria-label="Pico home">
            <i>P</i>Pico
          </Link>
          <span className="icb" aria-hidden>{ICONS.side && <ICONS.side size={16} />}</span>
        </div>

        <Link className="srch" href="/app/tasks" aria-label="Search tasks">
          <IconSearch size={16} />
          <span>Search…</span>
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </Link>

        {NAV.map(([group, items], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <hr />}
            <div className="lbl">{group}</div>
            <div className="nv">
              {items.map(({ label, icon, href }) => {
                const Icon = ICONS[icon];
                const active = pathname === href
                  || (href === "/app/tasks" && pathname.startsWith("/app/tasks/") && !pathname.startsWith("/app/tasks/new") && !pathname.includes("/room/"))
                  || (href !== "/app" && href !== "/app/tasks" && pathname.startsWith(`${href}/`));
                return (
                  <Link key={href} href={href} className={`ni${active ? " on" : ""}`} aria-current={active ? "page" : undefined}>
                    {Icon && <Icon size={18} />}
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {pathname.startsWith("/app/operator") && (
          <div><hr /><div className="lbl">TOOLS</div><div className="nv"><Link href="/app/operator" className="ni on">Operator</Link></div></div>
        )}
        <div className="grow" />
        <Link className="ni sout" href="/#flow">{ICONS.arrow && <ICONS.arrow size={18} />}How it works</Link>
        <div className="acct">
          <span className="avs">{publicKey ? shortPk(publicKey.toBase58(), 1).slice(0, 2).toUpperCase() : "NS"}</span>
          <span><b>{publicKey ? shortPk(publicKey.toBase58(), 4) : "Northwind Studio"}</b><small>{publicKey ? "Devnet wallet" : mode === "working" ? "Worker account" : "Company account"}</small></span>
          {ICONS.updown && <ICONS.updown size={16} />}
        </div>
      </aside>

      <main className="mn">
        <header className="tb">
          <div className="crumb"><Link href="/app">Workspace</Link><span>/</span><b>{pageName}</b></div>
          <div className="tbr">
            <div className="mode" role="group" aria-label="Mode">
              <button type="button" className={mode === "hiring" ? "on" : ""} aria-pressed={mode === "hiring"} onClick={() => setMode("hiring")}>{ICONS.brief && <ICONS.brief size={16} />}Hiring</button>
              <button type="button" className={mode === "working" ? "on" : ""} aria-pressed={mode === "working"} onClick={() => setMode("working")}>{ICONS.tool && <ICONS.tool size={16} />}Working</button>
            </div>
            <button className="bell" aria-label="Notifications" type="button">{ICONS.bell && <ICONS.bell size={18} />}</button>
            {mounted ? (
              <div className="chrome-wallet"><WalletMultiButton /></div>
            ) : (
              <button className="wchip" type="button" disabled><span className="wi">◈</span><span><b>Phantom<span>Devnet</span></b><small>{usdc === null ? "Connect wallet" : `${usdc.toFixed(2)} USDC`}</small></span><span className="dotg" /></button>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
