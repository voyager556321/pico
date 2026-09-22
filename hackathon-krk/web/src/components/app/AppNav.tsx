"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BrandLink } from "@/components/app/ui";

const LINKS = [
  { href: "/app", label: "My tasks", exact: true },
  { href: "/app/tasks/new", label: "Post" },
  { href: "/app/operator", label: "Operator" },
];

export function AppNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 -mx-4 mb-8 border-b border-[var(--border)] bg-white/90 backdrop-blur-md sm:-mx-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-6">
          <BrandLink />
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text)]"
            >
              Board
            </Link>
            {LINKS.map((l) => {
              const active = l.exact
                ? pathname === l.href
                : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[var(--accent-ink)]"
                      : "rounded-full px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text)]"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {mounted ? (
          <WalletMultiButton />
        ) : (
          <div
            className="h-11 w-[148px] shrink-0 rounded-full bg-[var(--accent)]/80"
            aria-hidden
          />
        )}
      </div>
    </header>
  );
}
