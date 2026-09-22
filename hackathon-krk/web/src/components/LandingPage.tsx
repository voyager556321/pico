"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SKILLS } from "@/lib/constants";
import { DEMO_WORKER_PK, openBoardListing } from "@/lib/demo";
import { loadTrust, trustRequiredForReward } from "@/lib/presence";
import { LISTING_THREAD, topicRating, topicRequiredForReward, threadById } from "@/lib/threads";

type TaskType = "All" | "Code review" | "Debugging" | "QA" | "Design" | "Build";
type SortKey = "recent" | "reward";

const TASK_TYPES: TaskType[] = ["All", "Code review", "Debugging", "QA", "Design", "Build"];

const FLOW = [
  { n: "01", title: "Fund", body: "Lock USDC + set N & %" },
  { n: "02", title: "3 tests", body: "Timed qualify race" },
  { n: "03", title: "Slots", body: "Exec · Primary · Audit" },
  { n: "04", title: "Chain", body: "Each reviews the last" },
  { n: "05", title: "Pay", body: "Escrow splits by bps" },
];

const PAINS = [
  {
    who: "Clients",
    pain: "Hire theatre for a 2–4 hour job",
    fix: "Post + fund once. First qualified podium fills seats — no CV browse.",
  },
  {
    who: "Clients",
    pain: "“I can do it” with no proof",
    fix: "Three timed tests. Visible T3 times. Execution = fastest finisher.",
  },
  {
    who: "Experts",
    pain: "Reject / non-pay after you start",
    fix: "USDC already in escrow. Client can’t unilaterally reclaim after assign.",
  },
  {
    who: "Clients",
    pain: "One unchecked delivery",
    fix: "Primary reviews Execution; Audit reviews Primary — then you see it.",
  },
  {
    who: "Both",
    pain: "Slow cross-border micropayouts",
    fix: "Per-task Solana USDC vault. Split by the % you set at create.",
  },
];

const DEMO_TASKS = [
  {
    id: "t1",
    title: "Review Anchor escrow PDA seeds",
    skill: "Code review",
    reviews: 2,
    reward: 85,
    interested: 6,
    posted: "2h ago",
    blurb: "Seed collisions & signer constraints before qualification assigns slots.",
    mark: "AN",
    markBg: "#155e75",
  },
  {
    id: "t2",
    title: "Reproduce flaky wallet connect",
    skill: "Debugging",
    reviews: 1,
    reward: 60,
    interested: 9,
    posted: "5h ago",
    blurb: "Phantom drops after soft nav — root cause + minimal patch + write-up.",
    mark: "NX",
    markBg: "#334155",
  },
  {
    id: "t3",
    title: "QA the qualify → work → verify chain",
    skill: "QA",
    reviews: 2,
    reward: 40,
    interested: 11,
    posted: "1d ago",
    blurb: "Checklist on Devnet statuses: Qualifying → Working → InReview → Paid.",
    mark: "QA",
    markBg: "#047857",
  },
  {
    id: "t4",
    title: "Polish slot table hierarchy",
    skill: "Design",
    reviews: 1,
    reward: 55,
    interested: 4,
    posted: "1d ago",
    blurb: "Make T3 times and active slot read first on mobile.",
    mark: "UI",
    markBg: "#9a3412",
  },
  {
    id: "t5",
    title: "Audit finalize_and_pay fee math",
    skill: "Code review",
    reviews: 2,
    reward: 120,
    interested: 3,
    posted: "2d ago",
    blurb: "Platform fee + slot_bps dust to Execution — independent Audit slot.",
    mark: "SC",
    markBg: "#0e7490",
  },
  {
    id: "t6",
    title: "Debug ATA on fill_slot winner",
    skill: "Debugging",
    reviews: 2,
    reward: 95,
    interested: 5,
    posted: "3d ago",
    blurb: "Single-seat replacement fails when winner ATA is missing.",
    mark: "AT",
    markBg: "#0f766e",
  },
  {
    id: "t7",
    title: "Build a vault transfer helper",
    skill: "Build",
    reviews: 1,
    reward: 90,
    interested: 4,
    posted: "3h ago",
    blurb: "A small project to develop: check a vault transfer before it is sent. Not a review.",
    mark: "PR",
    markBg: "#7c3aed",
  },
  {
    id: "t8",
    title: "Develop a qualify timer module",
    skill: "Build",
    reviews: 2,
    reward: 110,
    interested: 2,
    posted: "6h ago",
    blurb: "Project: a module that starts a work clock and stops counting when the editor goes idle.",
    mark: "TM",
    markBg: "#1d4ed8",
  },
];

export function LandingPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [query, setQuery] = useState("");
  const [gate, setGate] = useState("");
  const [stack, setStack] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(["All"]);
  const [rewardMin, setRewardMin] = useState(25);
  const [rewardMax, setRewardMax] = useState(150);
  const [sort, setSort] = useState<SortKey>("recent");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const appHref = useMemo(() => {
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    if (stack.trim()) params.set("stack", stack.trim());
    const qs = params.toString();
    return qs ? `/app?${qs}` : "/app";
  }, [query, stack]);

  const filtered = useMemo(() => {
    let rows = DEMO_TASKS.filter((t) => {
      const typeOk =
        taskTypes.includes("All") || taskTypes.includes(t.skill as TaskType);
      const rewardOk = t.reward >= rewardMin && t.reward <= rewardMax;
      const q = query.trim().toLowerCase();
      const s = stack.trim().toLowerCase();
      const textOk =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.skill.toLowerCase().includes(q);
      const stackOk =
        !s || t.skill.toLowerCase().includes(s) || t.blurb.toLowerCase().includes(s);
      return typeOk && rewardOk && textOk && stackOk;
    });
    if (sort === "reward") rows = [...rows].sort((a, b) => b.reward - a.reward);
    return rows;
  }, [taskTypes, rewardMin, rewardMax, query, stack, sort]);

  function enterListing(task: (typeof DEMO_TASKS)[number]) {
    const wallet = publicKey?.toBase58() ?? DEMO_WORKER_PK.toBase58();
    const trust = loadTrust(wallet);
    const need = trustRequiredForReward(task.reward);
    if (trust < need) {
      setGate(
        `${task.title} pays $${task.reward} and needs trust ${need}. Yours is ${trust}. Stay present on a task to raise it. Clients see this score.`
      );
      return;
    }
    const topic = LISTING_THREAD[task.id];
    const topicNeed = topicRequiredForReward(task.reward);
    if (topic && topicNeed > 0) {
      const score = topicRating(wallet, topic);
      if (score < topicNeed) {
        const label = threadById(topic)?.label ?? topic;
        setGate(
          `${task.title} is a ${label} task and needs topic rating ${topicNeed}. Yours is ${score}. Pass a round in that thread to raise it.`
        );
        return;
      }
    }
    setGate("");
    const skill = SKILLS.find((item) => item.label === task.skill);
    const opened = openBoardListing({
      id: task.id,
      skillId: skill?.id ?? 1,
      brief: `${task.title}\n\n${task.blurb}`,
      rewardUsd: task.reward,
      reviewCount: task.reviews,
    });
    try {
      localStorage.setItem("pico:appMode", "working");
    } catch {
      /* ignore */
    }
    router.push(`/app/tasks/${opened.publicKey.toBase58()}/qualify`);
  }

  function toggleType(t: TaskType) {
    if (t === "All") {
      setTaskTypes(["All"]);
      return;
    }
    setTaskTypes((prev) => {
      const withoutAll = prev.filter((x) => x !== "All");
      const next = withoutAll.includes(t)
        ? withoutAll.filter((x) => x !== t)
        : [...withoutAll, t];
      return next.length === 0 ? ["All"] : next;
    });
  }

  return (
    <div className="app-dark min-h-screen text-[var(--app-text)]">
      <section className="landing-hero-dark relative pb-12 sm:pb-14">
        <header className="relative z-20 border-b border-[var(--app-border)] bg-[var(--app-sidebar)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="pico-mark" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3v18M5 8.5c2.5-3 11.5-3 14 0M5 15.5c2.5 3 11.5 3 14 0"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="display text-xl font-bold tracking-tight">pico</span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
              <a href="#board" className="nav-link nav-link-active">
                Find tasks
              </a>
              <Link href="/app" className="nav-link">
                My tasks
              </Link>
              <Link href="/app/tasks/new" className="nav-link">
                Post a task
              </Link>
              <a href="#pains" className="nav-link">
                Why Pico
              </a>
              <a href="#flow" className="nav-link">
                How it works
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/app" className="app-cta-ghost !hidden sm:!inline-flex">
                Open app
              </Link>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] text-[var(--app-text)] md:hidden"
                aria-expanded={navOpen}
                onClick={() => setNavOpen((v) => !v)}
              >
                ☰
              </button>
            </div>
          </div>
          {navOpen ? (
            <div className="border-t border-[var(--app-border)] px-4 py-4 md:hidden">
              <div className="flex flex-col gap-3 text-sm font-medium">
                <a href="#board" onClick={() => setNavOpen(false)}>
                  Find tasks
                </a>
                <Link href="/app/tasks/new" onClick={() => setNavOpen(false)}>
                  Post a task
                </Link>
                <a href="#pains" onClick={() => setNavOpen(false)}>
                  Why Pico
                </a>
                <a href="#flow" onClick={() => setNavOpen(false)}>
                  How it works
                </a>
              </div>
            </div>
          ) : null}
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
          <div className="max-w-2xl">
            <p className="hero-sub text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-accent)]">
              Verified outcomes · Solana USDC
            </p>
            <h1 className="hero-title display mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:text-[3.5rem]">
              pico
            </h1>
            <p className="hero-sub mt-3 text-xl font-medium sm:text-2xl">
              Get verified work without hiring the expert.
            </p>
            <p className="hero-sub mt-4 max-w-md text-base text-[var(--app-muted)] sm:text-lg">
              Fund escrow → race three timed tests → Execution + verification slots
              → chain review → auto-pay.
            </p>
            <div className="hero-sub mt-8 flex flex-wrap gap-3">
              <Link href="/app/tasks/new" className="app-cta">
                Post a task
              </Link>
              <a href="#board" className="app-cta-ghost">
                Browse board
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-30 mx-auto -mb-8 max-w-5xl px-4 sm:-mb-10 sm:px-6">
          <form
            className="search-pill flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:gap-0"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = appHref;
            }}
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--app-muted)]" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Task title or keyword"
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              />
            </label>
            <div className="hidden h-8 w-px bg-[var(--app-border)] sm:block" aria-hidden />
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--app-muted)]" aria-hidden>
                <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder="Skill lane"
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              />
            </label>
            <button type="submit" className="btn-search shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Pains */}
      <section id="pains" className="border-b border-[var(--app-border)] pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-accent)]">
            Why Pico
          </p>
          <h2 className="display mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            The pains we actually solve
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--app-muted)]">
            Not “replace Upwork.” A fulfillment layer for short expert work — escrow,
            timed seats, chain verify.
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PAINS.map((p) => (
              <li key={p.pain} className="app-task-card p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--app-accent)]">
                  {p.who}
                </p>
                <h3 className="mt-2 text-base font-bold leading-snug tracking-tight">
                  {p.pain}
                </h3>
                <p className="mt-3 border-t border-[var(--app-border)] pt-3 text-sm leading-relaxed text-[var(--app-muted)]">
                  <span className="font-semibold text-[var(--app-text)]">Pico: </span>
                  {p.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="border-b border-[var(--app-border)] pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-accent)]">
            The loop
          </p>
          <h2 className="display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            From escrow to verified payout
          </h2>
          <div className="flow-rail mt-8 rounded-[var(--radius)] border border-[var(--app-border)] bg-[var(--app-card)]">
            {FLOW.map((s) => (
              <div key={s.n} className="flow-step">
                <p className="flow-step-n">{s.n}</p>
                <h3 className="mt-2 text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--app-muted)]">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 pb-10 text-sm leading-relaxed text-[var(--app-muted)]">
            Places 2…N+1 from the same Test-3 podium become verification slots — not a
            separate reviewer hunt. Decline → single-seat refill only.
          </p>
        </div>
      </section>

      {/* Board */}
      <section id="board" className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-8">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold">Skill lane</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--danger)] hover:underline"
                  onClick={() => setTaskTypes(["All"])}
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-2.5">
                {TASK_TYPES.map((t) => (
                  <li key={t}>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--app-muted)]">
                      <input
                        type="checkbox"
                        className="filter-check"
                        checked={taskTypes.includes(t)}
                        onChange={() => toggleType(t)}
                      />
                      <span className={taskTypes.includes(t) ? "font-medium text-[var(--app-text)]" : ""}>
                        {t}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-bold">Escrow (USDC)</h2>
              <div className="escrow-range">
                <div className="escrow-range-track" />
                <div
                  className="escrow-range-fill"
                  style={{
                    left: `calc(${((rewardMin - 10) / 190) * 100} / 100 * (100% - 16px) + 8px)`,
                    right: `calc(${((200 - rewardMax) / 190) * 100} / 100 * (100% - 16px) + 8px)`,
                  }}
                />
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={rewardMin}
                  onChange={(e) =>
                    setRewardMin(Math.min(Number(e.target.value), rewardMax - 5))
                  }
                  className="escrow-range-input"
                  aria-label="Minimum escrow"
                />
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={rewardMax}
                  onChange={(e) =>
                    setRewardMax(Math.max(Number(e.target.value), rewardMin + 5))
                  }
                  className="escrow-range-input"
                  aria-label="Maximum escrow"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-semibold">
                <span>${rewardMin}</span>
                <span>${rewardMax}</span>
              </div>
            </div>

            <div className="app-rail-block">
              <p className="app-rail-label">Slots</p>
              <p className="mt-2 text-sm leading-relaxed">
                <strong>Execution</strong> does the work.{" "}
                <strong>Primary</strong> reviews it.{" "}
                <strong>Audit</strong> reviews Primary → client.
              </p>
              <Link href="/app/tasks/new" className="app-cta mt-4 w-full justify-center">
                Post a task
              </Link>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="display text-2xl font-bold tracking-tight">
                Open tasks
              </h2>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="sort-select"
              >
                <option value="recent">Most recent</option>
                <option value="reward">Highest escrow</option>
              </select>
            </div>

            {gate ? (
              <p className="mb-4 rounded-[var(--radius)] border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3 text-sm leading-relaxed">
                {gate}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((t) => (
                <article
                  key={t.id}
                  className="task-card app-task-card flex cursor-pointer flex-col"
                  onClick={() => enterListing(t)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                      style={{ background: t.markBg }}
                      aria-hidden
                    >
                      {t.mark}
                    </div>
                    <button
                      type="button"
                      className={`heart-btn ${saved[t.id] ? "heart-on" : ""}`}
                      aria-label="Save"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSaved((s) => ({ ...s, [t.id]: !s[t.id] }));
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved[t.id] ? "currentColor" : "none"}>
                        <path
                          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <h3 className="mt-3 text-[15px] font-bold leading-snug tracking-tight">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-[var(--app-muted)]">
                    {t.skill} · {t.interested} in qualify
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="tag tag-slot">
                      {t.skill === "Build" ? "Project" : "Review"}
                    </span>
                    <span className="tag tag-slot">N={t.reviews} reviews</span>
                    {trustRequiredForReward(t.reward) > 0 ? (
                      <span className="tag tag-slot">Trust {trustRequiredForReward(t.reward)}+</span>
                    ) : null}
                    {LISTING_THREAD[t.id] && topicRequiredForReward(t.reward) > 0 ? (
                      <span className="tag tag-slot">
                        {threadById(LISTING_THREAD[t.id])?.label} {topicRequiredForReward(t.reward)}+
                      </span>
                    ) : null}
                    <span className="tag tag-mode">USDC escrow</span>
                    <span className="tag tag-remote">Fixed</span>
                  </div>

                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--app-muted)]">
                    {t.blurb}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-2 border-t border-[var(--app-border)] pt-3">
                    <p className="display text-xl font-bold tracking-tight">
                      ${t.reward}
                    </p>
                    <p className="text-xs text-[var(--app-muted)]">{t.posted}</p>
                  </div>

                  <button
                    type="button"
                    className="app-cta mt-3 w-full justify-center"
                    onClick={(event) => {
                      event.stopPropagation();
                      enterListing(t);
                    }}
                  >
                    Enter qualification
                  </button>
                </article>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="app-empty text-sm text-[var(--app-muted)]">
                No demos match.{" "}
                <Link href="/app/tasks/new" className="font-semibold text-[var(--app-accent)]">
                  Post a real task
                </Link>
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--app-border)] bg-[var(--app-sidebar)] text-[var(--app-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xl font-bold text-[var(--app-text)]">pico</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed">
              Verified work without hiring — escrow, timed slots, chain verify.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <Link href="/app" className="hover:text-[var(--app-text)]">
              App
            </Link>
            <Link href="/app/tasks/new" className="hover:text-[var(--app-text)]">
              Post
            </Link>
            <a href="#pains" className="hover:text-[var(--app-text)]">
              Why Pico
            </a>
            <a href="#flow" className="hover:text-[var(--app-text)]">
              Flow
            </a>
            {SKILLS.slice(0, 2).map((s) => (
              <Link key={s.id} href="/app" className="hover:text-[var(--app-text)]">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--app-border)] px-4 py-4 text-center text-xs text-[var(--app-muted)]">
          Hackathon MVP · Solana Devnet
        </div>
      </footer>
    </div>
  );
}
