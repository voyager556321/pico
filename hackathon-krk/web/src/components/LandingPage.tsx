"use client";

import Link from "next/link";

const pains = [
  {
    title: "Subscriptions don’t match AI usage",
    body: "Agents and power users burst then idle. You either waste a $20 plan or hit a cap mid-run.",
  },
  {
    title: "API keys & credit spreadsheets",
    body: "Six prepaid balances. One hits zero at 2am and the whole agent pipeline dies.",
  },
  {
    title: "Agents can’t use Stripe",
    body: "No cards, no KYC, no plan comparison. Autonomy breaks the moment billing needs a human.",
  },
  {
    title: "Fear of handing over the wallet",
    body: "Nobody wants an agent with unlimited spend. You need a hard ceiling — not full wallet access.",
  },
  {
    title: "Solana is still opaque",
    body: "Explorer dumps and sketchy mints need occasional AI help — not another monthly stack of tools.",
  },
];

const steps = [
  {
    n: "01",
    title: "Connect Phantom",
    body: "Devnet wallet. Pico sees your address — not your full funds.",
  },
  {
    n: "02",
    title: "Deposit a budget",
    body: "Put $1–$5 USDC into an on-chain vault. That’s the maximum tools can spend.",
  },
  {
    n: "03",
    title: "Run priced tools",
    body: "Token Check · $0.05 · Explain Tx · $0.01. Price is visible before you click.",
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
    title: "Micropayments that work",
    body: "Sub-cent fees make $0.01–$0.05 tool calls economically real — cards can’t.",
  },
  {
    title: "Agent-native rails",
    body: "x402, Payment Channels, and allowances are pushing machine payments onto Solana now.",
  },
  {
    title: "On-chain proof",
    body: "Every Pico debit is a verifiable transaction — receipts, not screenshots.",
  },
];

const checklist = [
  {
    q: "What problem is painfully real?",
    a: "Paying for idle AI capacity, babysitting API credits, and fearing agent overspend — plus opaque Solana txs/tokens.",
  },
  {
    q: "Why now & why Solana?",
    a: "Agent economy is here; Solana’s speed and cost unlock true pay-per-action USDC metering.",
  },
  {
    q: "Who is the first user?",
    a: "Solana builders and traders who need occasional AI checks — and teams demoing agents with a hard spend cap.",
  },
  {
    q: "What is your unfair insight?",
    a: "Micropayments failed for humans’ psychology — but agents don’t hesitate. Humans still need a budget UI on top.",
  },
  {
    q: "What does success in 6 weeks look like?",
    a: "Live product on Devnet, Colosseum submission, Gemini-powered tools, clear pitch and waitlist.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen text-[var(--text)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-[#14081f]"
            style={{ background: "var(--grad)" }}
          >
            P
          </div>
          <span className="text-lg font-semibold tracking-tight">pico</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <a href="#pain">Why Pico</a>
          <a href="#how">How it works</a>
          <a href="#solana">Why Solana</a>
          <a href="#validate">Validate</a>
        </nav>
        <Link
          href="/app"
          className="grad-btn rounded-full px-4 py-2 text-sm"
        >
          Launch App
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-10 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full opacity-50"
          style={{ background: "var(--grad-soft)" }}
        />
        <div className="relative">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-black/30 px-3 py-1 text-xs text-[var(--muted)]">
            <span aria-hidden>◆</span> Payment layer for on-demand AI on Solana
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Give your AI a{" "}
            <span className="grad-text">budget</span>
            , not your wallet.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
            Deposit USDC once. Pay per tool call. Agents stay inside a hard
            on-chain limit. Withdraw what you don’t use.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className="grad-btn rounded-full px-6 py-3 text-sm">
              Open Pico App
            </Link>
            <a
              href="#pain"
              className="chip rounded-full px-6 py-3 text-sm"
            >
              See the pain we fix
            </a>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              { t: "On-chain vault", d: "Custom Anchor program" },
              { t: "Gemini analysis", d: "Real Token Check & Explain Tx" },
              { t: "Agent demo", d: "Hard stop at budget" },
            ].map((c) => (
              <div key={c.t} className="glass rounded-2xl px-4 py-4 text-left">
                <p className="font-medium">{c.t}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain */}
      <section id="pain" className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-medium tracking-[0.2em] text-[var(--muted)] uppercase">
          Market reality
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Crypto + AI already hurts in five places. Pico closes the spend gap.
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          From Reddit agent builders to Solana’s own agentic-payments docs: the
          bottleneck isn’t smarter models — it’s billing, keys, and control.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pains.map((p) => (
            <article key={p.title} className="glass rounded-3xl p-5">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-medium tracking-[0.2em] text-[var(--muted)] uppercase">
          Product
        </p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          How Pico works
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((s) => (
            <article key={s.n} className="glass rounded-3xl p-4">
              <p className="grad-text text-sm font-semibold">{s.n}</p>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{s.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/app" className="grad-btn rounded-full px-5 py-3 text-sm">
            Try live demo
          </Link>
          <span className="chip text-sm">
            Tools: Token Check · Explain Transaction
          </span>
        </div>
      </section>

      {/* Why Solana */}
      <section id="solana" className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-medium tracking-[0.2em] text-[var(--muted)] uppercase">
          Why Solana
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Built where micropayments are finally viable.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {whySolana.map((w) => (
            <article key={w.title} className="glass rounded-3xl p-5">
              <h3 className="text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{w.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Cheat sheet */}
      <section id="validate" className="mx-auto max-w-6xl px-5 py-16">
        <div className="glass overflow-hidden rounded-[32px] p-6 sm:p-10">
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--muted)] uppercase">
            Founder cheat sheet
          </p>
          <h2 className="mt-3 text-3xl font-semibold">5 questions. Answered.</h2>
          <p className="mt-3 max-w-xl text-[var(--muted)]">
            The same validation frame Superteam pushes — filled for Pico.
          </p>
          <ol className="mt-8 space-y-5">
            {checklist.map((item, i) => (
              <li key={item.q} className="border-t border-[var(--border)] pt-5">
                <p className="text-sm text-[var(--muted)]">0{i + 1}</p>
                <h3 className="mt-1 font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.a}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Hackathon CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div
          className="rounded-[32px] px-6 py-12 text-center sm:px-12"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,79,216,0.2), rgba(139,92,255,0.25), rgba(255,138,61,0.12))",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm text-[var(--muted)]">
            Blockchain Hack Kraków · Colosseum Crypto World&apos;s Fair
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Ready to see Pico live?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
            Onsite kickoff Sep 19–20 · build until Oct 11 · submit KRK + Colosseum
            by Oct 12. Working Solana product. Real Gemini analysis. Real debit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/app" className="grad-btn rounded-full px-6 py-3">
              Launch App
            </Link>
            <a
              href="https://colosseum.com/worldsfair"
              target="_blank"
              rel="noreferrer"
              className="chip rounded-full px-6 py-3"
            >
              Colosseum World&apos;s Fair ↗
            </a>
          </div>
        </div>
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <p>© Pico · A payment layer for on-demand AI</p>
          <p>Built on Solana · Hackathon MVP</p>
        </footer>
      </section>
    </div>
  );
}
