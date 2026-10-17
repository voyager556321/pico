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
import { APP_COPY, useAppLanguage } from "@/components/app/AppLanguage";
import { LANDING_LANGUAGES, type LandingLanguage } from "@/components/landingTranslations";
import { USDC_MINT, shortPk } from "@/lib/constants";

export type AppMode = "hiring" | "working";

const MODE_KEY = "pico:appMode";

const NAV: [keyof typeof APP_COPY.en.chrome, { label: keyof typeof APP_COPY.en.chrome; icon: IconName; href: string }[]][] = [
  ["workspace", [
    { label: "home", icon: "home", href: "/app" },
    { label: "tasks", icon: "tasks", href: "/app/tasks" },
    { label: "chats", icon: "chat", href: "/app/tasks/signup/room/conversation" },
    { label: "balance", icon: "wallet", href: "/app/balance" },
    { label: "history", icon: "activity", href: "/app/activity" },
  ]],
  ["account", [
    { label: "profile", icon: "user", href: "/app/profile" },
    { label: "settings", icon: "settings", href: "/app/settings" },
    { label: "help", icon: "help", href: "/app/help" },
  ]],
  ["pico", [
    { label: "about", icon: "info", href: "/app/about" },
    { label: "how", icon: "arrow", href: "/app/how" },
  ]],
];

const PAGE_NAMES: [string, keyof typeof APP_COPY.en.chrome][] = [
  ["/app/tasks/new", "createTask"],
  ["/app/tasks", "tasks"],
  ["/app/activity", "history"],
  ["/app/balance", "balance"],
  ["/app/profile", "profile"],
  ["/app/settings", "settings"],
  ["/app/help", "help"],
  ["/app/about", "about"],
  ["/app/how", "how"],
  ["/app/operator", "operator"],
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
  const { language, setLanguage } = useAppLanguage();
  const copy = APP_COPY[language].chrome;
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
    ? copy.home
    : copy[PAGE_NAMES.find(([href]) => pathname === href || (href !== "/app/tasks" && pathname.startsWith(`${href}/`)))?.[1]
      ?? (pathname.includes("/room/") ? "workroom" : "taskDetails")];

  return (
    <div className="app" lang={LANDING_LANGUAGES.find((item) => item.code === language)?.locale}>
      <aside className="sb">
        <div className="brandrow">
          <Link href="/app" className="logo" aria-label="Pico home">
            <i>P</i>Pico
          </Link>
          <span className="icb" aria-hidden>{ICONS.side && <ICONS.side size={16} />}</span>
        </div>

        <Link className="srch" href="/app/tasks" aria-label={copy.searchTasks}>
          <IconSearch size={16} />
          <span>{copy.search}</span>
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </Link>

        {NAV.map(([group, items], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <hr />}
            <div className="lbl">{copy[group]}</div>
            <div className="nv">
              {items.map(({ label, icon, href }) => {
                const Icon = ICONS[icon];
                const active = pathname === href
                  || (href === "/app/tasks" && pathname.startsWith("/app/tasks/") && !pathname.startsWith("/app/tasks/new") && !pathname.includes("/room/"))
                  || (href !== "/app" && href !== "/app/tasks" && pathname.startsWith(`${href}/`));
                return (
                  <Link key={href} href={href} className={`ni${active ? " on" : ""}`} aria-current={active ? "page" : undefined}>
                    {Icon && <Icon size={18} />}
                    {copy[label]}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {pathname.startsWith("/app/operator") && (
          <div><hr /><div className="lbl">{copy.tools}</div><div className="nv"><Link href="/app/operator" className="ni on">{copy.operator}</Link></div></div>
        )}
        <div className="grow" />
        <Link className="ni sout" href="/#flow">{ICONS.arrow && <ICONS.arrow size={18} />}{copy.howItWorks}</Link>
        <div className="acct">
          <span className="avs">{publicKey ? shortPk(publicKey.toBase58(), 1).slice(0, 2).toUpperCase() : "NS"}</span>
          <span><b>{publicKey ? shortPk(publicKey.toBase58(), 4) : "Northwind Studio"}</b><small>{publicKey ? copy.devnetWallet : mode === "working" ? copy.workerAccount : copy.companyAccount}</small></span>
          {ICONS.updown && <ICONS.updown size={16} />}
        </div>
      </aside>

      <main className="mn">
        <header className="tb">
          <div className="crumb"><Link href="/app">{copy.workspace}</Link><span>/</span><b>{pageName}</b></div>
          <div className="tbr">
            <label className="app-language-picker">
              <span className="sr-only">{APP_COPY[language].language}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.currentTarget.value as LandingLanguage)}
                aria-label={APP_COPY[language].language}
              >
                {LANDING_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>
            <div className="mode" role="group" aria-label={copy.mode}>
              <button type="button" className={mode === "hiring" ? "on" : ""} aria-pressed={mode === "hiring"} onClick={() => setMode("hiring")}>{ICONS.brief && <ICONS.brief size={16} />}{copy.hiring}</button>
              <button type="button" className={mode === "working" ? "on" : ""} aria-pressed={mode === "working"} onClick={() => setMode("working")}>{ICONS.tool && <ICONS.tool size={16} />}{copy.working}</button>
            </div>
            <button className="bell" aria-label={copy.notifications} type="button">{ICONS.bell && <ICONS.bell size={18} />}</button>
            {mounted ? (
              <div className="chrome-wallet"><WalletMultiButton /></div>
            ) : (
              <button className="wchip" type="button" disabled><span className="wi">◈</span><span><b>Phantom<span>Devnet</span></b><small>{usdc === null ? copy.connectWallet : `${usdc.toFixed(2)} USDC`}</small></span><span className="dotg" /></button>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
