"use client";

import Link from "next/link";
import { useState } from "react";
import { TOOLS } from "@/lib/constants";

const pains = [
  {
    title: "Subscriptions don’t fit AI agents",
    body: "Agents and power users burst then idle. You either waste a monthly plan or hit a cap mid-run.",
  },
  {
    title: "Agents need spending control",
    body: "Nobody wants an agent with unlimited wallet access. You need a hard ceiling — deposit only what you’re willing to spend.",
  },
  {
    title: "Micropayments are fragmented",
    body: "Six prepaid API balances. One hits zero at 2am and the whole agent pipeline dies.",
  },
];

const steps = [
  {
    n: "01",
    title: "Connect Phantom",
    body: "Devnet wallet. Pico sees your address — not full access to your funds.",
  },
  {
    n: "02",
    title: "Deposit a budget",
    body: "Put $1–$5 USDC into an on-chain vault. That’s the maximum tools can spend.",
  },
  {
    n: "03",
    title: "Run priced tools",
    body: `Token Check · $${TOOLS.tokenCheck.priceUsd.toFixed(2)} · Explain Tx · $${TOOLS.explainTx.priceUsd.toFixed(2)}. Price before you click.`,
  },
  {
    n: "04",
    title: "Agent stays inside the limit",
    body: "Demo agents call tools in a loop. Hard stop when the budget is gone.",
  },
  {
    n: "05",
    title: "Withdraw what’s left",
    body: "Keep the balance for later — or return remaining USDC to your wallet.",
  },
];

const whySolana = [
  {
    title: "Low-cost micropayments",
    body: "Sub-cent fees make $0.01–$0.05 tool calls economically real — cards can’t.",
  },
  {
    title: "Built for agent payments",
    body: "Machine spend needs programmable rails. Solana + USDC fit bursty agent loops.",
  },
  {
    title: "Verifiable spending",
    body: "Every Pico debit is an on-chain transaction — receipts, not screenshots.",
  },
];

const faq = [
  {
    q: "What problem is painfully real?",
    a: "Paying for idle AI capacity, babysitting API credits, and fearing agent overspend — plus opaque Solana txs and tokens.",
  },
  {
    q: "Why now & why Solana?",
    a: "The agent economy is here; Solana’s speed and cost unlock true pay-per-action USDC metering.",
  },
  {
    q: "Who is the first user?",
    a: "Solana builders and traders who need occasional AI checks — and teams demoing agents with a hard spend cap.",
  },
  {
    q: "What is your unfair insight?",
    a: "Micropayments failed for human psychology — agents don’t hesitate. Humans still need a budget UI on top.",
  },
  {
    q: "What does success in 6 weeks look like?",
    a: "Live product on Devnet, Colosseum submission, Gemini-powered tools, clear pitch and waitlist.",
  },
];

const nav = [
  { href: "#how", label: "How it works" },
  { href: "#solana", label: "Why Solana" },
  { href: "#faq", label: "FAQ" },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="landing min-h-screen text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07060f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <a href="#top" className="flex items-center gap-2.5">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white sm:h-9 sm:w-9"
              style={{ background: "var(--grad)" }}
              aria-hidden
            >
              P
            </div>
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              pico
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/app" className="btn-pink hidden sm:inline-flex">
              Launch App
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <div className="flex w-4 flex-col gap-1">
                <span
                  className={`h-0.5 w-full bg-white transition ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
                />
                <span
                  className={`h-0.5 w-full bg-white transition ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-0.5 w-full bg-white transition ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/5 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-[var(--muted)] hover:bg-white/5 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/app"
                className="btn-pink mt-1 justify-center"
                onClick={() => setMenuOpen(false)}
              >
                Launch App
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-14 pt-10 text-center sm:px-5 sm:pb-20 sm:pt-16">
          <div
            className="pointer-events-none absolute left-1/2 top-[-4rem] h-80 w-[36rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "var(--grad-soft)" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl">
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Give your AI a{" "}
              <span className="text-[var(--pink)]">budget</span>
              , not your wallet.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-lg">
              Deposit USDC once. Pay per tool call. Agents stay inside a hard
              on-chain limit. Withdraw what you don&apos;t use.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="/app" className="btn-pink px-7 py-3.5 text-sm">
                Launch App
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                How it works ↓
              </a>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
              {[
                { t: "On-chain vault", d: "Custom Anchor program" },
                { t: "Gemini analysis", d: "Real Token Check & Explain Tx" },
                { t: "Agent demo", d: "Hard stop at budget" },
              ].map((c) => (
                <div key={c.t} className="glass rounded-2xl px-4 py-4">
                  <p className="font-medium">{c.t}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem */}
        <section id="pain" className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-[var(--muted)] uppercase">
            The problem
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">
            AI agents need a better way to pay
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Subscriptions and bank rails weren’t built for autonomous software.
            Pico closes the spend gap with a prepaid USDC budget on Solana.
          </p>
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
            {pains.map((p) => (
              <article key={p.title} className="glass rounded-2xl p-5 sm:rounded-3xl sm:p-6">
                <h3 className="text-base font-semibold sm:text-lg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* How */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-[var(--muted)] uppercase">
            Product
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
            How Pico works
          </h2>
          <div className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
            {steps.map((s) => (
              <article
                key={s.n}
                className="glass min-w-[220px] shrink-0 rounded-2xl p-4 sm:min-w-0 sm:rounded-3xl"
              >
                <p className="text-sm font-semibold text-[var(--pink)]">{s.n}</p>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {s.body}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/app" className="btn-pink justify-center px-5 py-3 text-sm">
              Try live demo
            </Link>
            <p className="text-sm text-[var(--muted)]">
              Token Check · ${TOOLS.tokenCheck.priceUsd.toFixed(2)} / Explain Tx · $
              {TOOLS.explainTx.priceUsd.toFixed(2)}
            </p>
          </div>
        </section>

        {/* Tools preview — matches designer dashboard cards */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-4xl">
            AI tools, paid only when you use them
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            Same budget vault for every call. See the price, run the tool, watch
            the meter drop on-chain.
          </p>

          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2">
            <article className="glass rounded-2xl p-5 sm:rounded-[20px] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Token Check</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Check a token for risks and red flags before you interact
                    with it.
                  </p>
                </div>
                <span className="shrink-0 text-sm text-[var(--muted)]">
                  ${TOOLS.tokenCheck.priceUsd.toFixed(2)} / check
                </span>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
                  <span>Available budget</span>
                  <span>$4.95</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "82%" }} />
                </div>
              </div>
              <Link
                href="/app"
                className="btn-pink mt-5 w-full justify-center py-3 text-sm"
              >
                Open tool
              </Link>
            </article>

            <article className="glass rounded-2xl p-5 sm:rounded-[20px] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Explain Transaction</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Turn any Solana transaction into a plain-English
                    explanation.
                  </p>
                </div>
                <span className="shrink-0 text-sm text-[var(--muted)]">
                  ${TOOLS.explainTx.priceUsd.toFixed(2)} / analysis
                </span>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
                  <span>Available budget</span>
                  <span>$4.94</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "80%" }} />
                </div>
              </div>
              <Link
                href="/app"
                className="btn-pink mt-5 w-full justify-center py-3 text-sm"
              >
                Open tool
              </Link>
            </article>
          </div>

          <div className="glass mt-4 rounded-2xl border border-[var(--purple)]/25 p-5 sm:rounded-[20px] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Agent Demo</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  8 calls · max $0.08 · hard budget limit
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                <p className="text-xs text-[var(--muted)]">Calls</p>
                <p className="mt-1 font-semibold">8</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                <p className="text-xs text-[var(--muted)]">Estimated maximum</p>
                <p className="mt-1 font-semibold">$0.08</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                <p className="text-xs text-[var(--muted)]">Available budget</p>
                <p className="mt-1 font-semibold">$5.00</p>
              </div>
            </div>
            <Link
              href="/app"
              className="btn-pink mt-5 w-full justify-center py-3.5 text-sm"
            >
              Run demo — max $0.08
            </Link>
          </div>
        </section>

        {/* Why Solana */}
        <section id="solana" className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-[var(--muted)] uppercase">
            Why Solana
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">
            Built where AI micropayments make sense
          </h2>
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
            {whySolana.map((w) => (
              <article key={w.title} className="glass rounded-2xl p-5 sm:rounded-3xl sm:p-6">
                <h3 className="text-base font-semibold sm:text-lg">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {w.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                The same validation frame Superteam pushes — answered for Pico.
              </p>
            </div>
            <div className="space-y-3">
              {faq.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className="glass overflow-hidden rounded-2xl">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <div>
                        <p className="text-xs text-[var(--muted)]">
                          0{i + 1}
                        </p>
                        <p className="mt-1 font-medium">{item.q}</p>
                      </div>
                      <span
                        className={`mt-1 text-lg text-[var(--pink)] transition ${open ? "rotate-45" : ""}`}
                        aria-hidden
                      >
                        +
                      </span>
                    </button>
                    {open ? (
                      <p className="border-t border-white/10 px-4 pb-4 text-sm leading-relaxed text-[var(--muted)] sm:px-5">
                        {item.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-5 sm:pb-20">
          <div
            className="rounded-[28px] px-6 py-12 text-center sm:rounded-[32px] sm:px-12 sm:py-14"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,79,216,0.22), rgba(139,92,255,0.28), rgba(255,138,61,0.1))",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              Ready to give your AI a controlled budget?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted)] sm:text-base">
              Live on Solana Devnet. Real Gemini analysis. Real on-chain debit.
              Built for Blockchain Hack Kraków + Colosseum.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="/app" className="btn-pink justify-center px-7 py-3.5">
                Launch Pico
              </Link>
              <a
                href="https://github.com/voyager556321/pico"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-medium transition hover:bg-white/10"
              >
                View on GitHub ↗
              </a>
            </div>
          </div>

          <footer className="mt-10 flex flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>© Pico · A payment layer for on-demand AI</p>
            <p>Built on Solana · Hackathon MVP</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
