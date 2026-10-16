"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { IconLogout, IconSearch } from "@/components/icons";
import { ICONS, type IconName } from "@/components/icons";
import type { AppMode } from "@/lib/types";

interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  href: string;
}

const NAV: Record<string, [string, NavItem[]][]> = {
  hire: [
    ["WORKSPACE", [
      { key: "home", label: "Home", icon: "home", href: "/app" },
      { key: "mytasks", label: "My tasks", icon: "tasks", href: "/app/tasks" },
      { key: "chats", label: "Chats", icon: "chat", href: "/app/chats" },
      { key: "balance", label: "Balance", icon: "wallet", href: "/app/balance" },
      { key: "activity", label: "History", icon: "activity", href: "/app/activity" },
    ]],
    ["ACCOUNT", [
      { key: "profile", label: "Client profile", icon: "user", href: "/app/profile" },
      { key: "settings", label: "Settings", icon: "settings", href: "/app/settings" },
      { key: "help", label: "Help & disputes", icon: "help", href: "/app/help" },
    ]],
    ["PICO", [
      { key: "about", label: "About Pico", icon: "info", href: "/app/about" },
      { key: "how", label: "How it works", icon: "arrow", href: "/app/how" },
    ]],
  ],
  work: [
    ["WORKING", [
      { key: "w-home", label: "Home", icon: "home", href: "/app/work" },
      { key: "w-find", label: "Relevant tasks", icon: "search", href: "/app/work/find" },
      { key: "w-mywork", label: "My work", icon: "tasks", href: "/app/work/mywork" },
      { key: "w-earn", label: "Earnings", icon: "wallet", href: "/app/work/earnings" },
    ]],
    ["GROWTH", [
      { key: "w-profile", label: "Profile & skills", icon: "user", href: "/app/work/profile" },
      { key: "w-topics", label: "Task alerts", icon: "bell", href: "/app/work/alerts" },
      { key: "w-comp", label: "Level up", icon: "sparkle", href: "/app/work/levelup" },
    ]],
    ["ACCOUNT", [
      { key: "w-settings", label: "Settings", icon: "settings", href: "/app/work/settings" },
      { key: "help", label: "Help & disputes", icon: "help", href: "/app/help" },
    ]],
  ],
  rev: [
    ["REVIEWING", [
      { key: "r-home", label: "Home", icon: "home", href: "/app/review" },
      { key: "r-requests", label: "Review requests", icon: "tasks", href: "/app/review/requests" },
      { key: "r-history", label: "Completed reviews", icon: "activity", href: "/app/review/history" },
    ]],
    ["PROFILE", [
      { key: "r-profile", label: "Reviewer profile", icon: "user", href: "/app/review/profile" },
    ]],
    ["ACCOUNT", [
      { key: "r-settings", label: "Settings", icon: "settings", href: "/app/review/settings" },
      { key: "help", label: "Help & disputes", icon: "help", href: "/app/help" },
    ]],
  ],
};

const MODE_LABELS: Record<AppMode, { label: string; icon: IconName }> = {
  hire: { label: "Hiring", icon: "brief" },
  work: { label: "Working", icon: "tool" },
  rev: { label: "Reviewer", icon: "check" },
};

const MODE_HOME: Record<AppMode, string> = {
  hire: "/app",
  work: "/app/work",
  rev: "/app/review",
};

export function AppShell({
  children,
  mode = "hire",
  crumbs = [],
}: {
  children: ReactNode;
  mode?: AppMode;
  crumbs?: [string, string?][];
}) {
  const pathname = usePathname();
  const navGroups = NAV[mode];
  const home = MODE_HOME[mode];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sb">
        <div className="brandrow">
          <Link href={home} className="logo" aria-label="Pico home">
            <i>P</i>Pico
          </Link>
          <span className="icb">{ICONS.side && <ICONS.side size={16} />}</span>
        </div>

        <button className="srch" type="button">
          <IconSearch size={16} />
          <span>Search…</span>
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </button>

        {navGroups.map(([label, items], gi) => (
          <div key={label}>
            {gi > 0 && <hr />}
            <div className="lbl">{label}</div>
            <div className="nv">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`ni${active ? " on" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {Icon && <Icon size={18} />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="grow" />
        <button type="button" className="ni sout">
          <IconLogout size={18} />
          Sign out
        </button>
        <button className="acct" type="button">
          <span className="avs">NS</span>
          <span>
            <b>Northwind Studio</b>
            <small>{mode === "work" ? "Also working as #7310" : "Company account"}</small>
          </span>
          {ICONS.updown && <ICONS.updown size={16} />}
        </button>
      </aside>

      {/* Main */}
      <main className="mn">
        {/* Topbar */}
        <div className="tb">
          <div className="crumb">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={i} style={{ display: "flex", gap: "8px" }}>
                  {!last && c[1] ? (
                    <>
                      <Link href={c[1]}>{c[0]}</Link>
                      <span>/</span>
                    </>
                  ) : (
                    <b>{c[0]}</b>
                  )}
                </span>
              );
            })}
          </div>
          <div className="tbr">
            <div className="mode" role="group" aria-label="Mode">
              {(Object.keys(MODE_LABELS) as AppMode[]).map((m) => {
                const cfg = MODE_LABELS[m];
                const Icon = ICONS[cfg.icon];
                return (
                  <Link
                    key={m}
                    href={MODE_HOME[m]}
                    className={m === mode ? "on" : ""}
                    aria-pressed={m === mode}
                  >
                    {Icon && <Icon size={16} />}
                    {cfg.label}
                  </Link>
                );
              })}
            </div>
            <button className="bell" aria-label="Notifications">
              {ICONS.bell && <ICONS.bell size={18} />}
            </button>
            <button className="wchip" aria-label="Wallet">
              <span className="wi">{ICONS.wallet && <ICONS.wallet size={16} />}</span>
              <span>
                <b>Phantom<span>Devnet</span></b>
                <small>7xKX…9fQ2</small>
              </span>
              <span className="dotg" />
              {ICONS.down && <ICONS.down size={16} />}
            </button>
          </div>
        </div>

        {/* Page content */}
        {children}
      </main>
    </div>
  );
}