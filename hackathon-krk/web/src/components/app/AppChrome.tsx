"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconSearch } from "@/components/icons";
import { ICONS, type IconName } from "@/components/icons";
import { AccountSlot, useAccountIdentity } from "@/components/app/AccountSlot";
import { APP_COPY, useAppLanguage } from "@/components/app/AppLanguage";
import { LANDING_LANGUAGES, type LandingLanguage } from "@/components/landingTranslations";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const me = useAccountIdentity(mode === "working" ? "Alex Morgan" : "Northwind Studio");

  const [navigating, setNavigating] = useState(false);

  useEffect(() => { setMenuOpen(false); setNavigating(false); }, [pathname]);

  // Instant feedback on internal link clicks, so a slow page load never looks like an ignored click.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      setNavigating(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!navigating) return;
    const timer = window.setTimeout(() => setNavigating(false), 15000);
    return () => window.clearTimeout(timer);
  }, [navigating]);

  const pageName = pathname === "/app"
    ? copy.home
    : copy[PAGE_NAMES.find(([href]) => pathname === href || (href !== "/app/tasks" && pathname.startsWith(`${href}/`)))?.[1]
      ?? (pathname.includes("/room/") ? "workroom" : "taskDetails")];

  return (
    <div className={`app tq-app${menuOpen ? " menu-open" : ""}${navigating ? " is-navigating" : ""}`} aria-busy={navigating || undefined} lang={LANDING_LANGUAGES.find((item) => item.code === language)?.locale}>
      {navigating && <div className="tq-nav-progress" role="progressbar" aria-label="Loading page" />}
      <aside className="sb">
        <div className="brandrow">
          <Link href="/app" className="tq-logo" aria-label="Task.quo home">
            <img src="/brand/taskquo-lockup-color.svg" alt="Task.quo" width={112} height={29} />
          </Link>
          <button type="button" className="tq-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>×</button>
        </div>

        <Link className="srch" href="/app/tasks" aria-label={copy.searchTasks}>
          <IconSearch size={16} />
          <span>{copy.search}</span>
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
        <Link className="acct" href="/app/profile" aria-label={`${me.name}, open profile`}>
          <span className="avs">{me.initials}</span>
          <span><b>{me.name}</b><small>{mode === "working" ? copy.workerAccount : copy.companyAccount}</small></span>
          <svg className="acct-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
        </Link>
      </aside>
      <div className="tq-scrim" aria-hidden onClick={() => setMenuOpen(false)} />

      <main className="mn">
        <header className="tb">
          <button type="button" className="tq-menu-btn" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
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
            <Link className="bell" aria-label={copy.notifications} href="/app/activity">{ICONS.bell && <ICONS.bell size={18} />}</Link>
            <AccountSlot label={copy.paymentsSoon} />
          </div>
        </header>
        <p
          className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"
          role="status"
        >
          {copy.paymentNotice}
        </p>
        {children}
      </main>
    </div>
  );
}
