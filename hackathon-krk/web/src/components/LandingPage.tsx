"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LANDING_COPY,
  LANDING_LANGUAGES,
  type LandingLanguage,
} from "@/components/landingTranslations";

type TaskType = "All" | "Code review" | "Debugging" | "QA" | "Design";
type SortKey = "recent" | "reward";

const TASK_TYPES: TaskType[] = ["All", "Code review", "Debugging", "QA", "Design"];

const DEMO_TASKS = [
  {
    id: "t1",
    translationIndex: 0,
    skill: "Code review",
    reviews: 2,
    reward: 85,
    interested: 6,
    posted: "2h ago",
    mark: "AN",
    markBg: "#155e75",
  },
  {
    id: "t2",
    translationIndex: 1,
    skill: "Debugging",
    reviews: 1,
    reward: 60,
    interested: 9,
    posted: "5h ago",
    mark: "NX",
    markBg: "#0c1222",
  },
  {
    id: "t3",
    translationIndex: 2,
    skill: "QA",
    reviews: 2,
    reward: 40,
    interested: 11,
    posted: "1d ago",
    mark: "QA",
    markBg: "#065f46",
  },
  {
    id: "t4",
    translationIndex: 3,
    skill: "Design",
    reviews: 1,
    reward: 55,
    interested: 4,
    posted: "1d ago",
    mark: "UI",
    markBg: "#7c2d12",
  },
  {
    id: "t5",
    translationIndex: 4,
    skill: "Code review",
    reviews: 2,
    reward: 120,
    interested: 3,
    posted: "2d ago",
    mark: "SC",
    markBg: "#0e7490",
  },
  {
    id: "t6",
    translationIndex: 5,
    skill: "Debugging",
    reviews: 2,
    reward: 95,
    interested: 5,
    posted: "3d ago",
    mark: "AT",
    markBg: "#134e4a",
  },
];

export function LandingPage() {
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState<LandingLanguage>("en");
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(["All"]);
  const [rewardMin, setRewardMin] = useState(25);
  const [rewardMax, setRewardMax] = useState(150);
  const [sort, setSort] = useState<SortKey>("recent");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const copy = LANDING_COPY[language];
  const categoryLabels: Record<TaskType, string> = {
    All: copy.board.all,
    "Code review": copy.board.codeReview,
    Debugging: copy.board.debugging,
    QA: copy.board.qa,
    Design: copy.board.design,
  };

  const filtered = useMemo(() => {
    let rows = DEMO_TASKS.filter((t) => {
      const typeOk =
        taskTypes.includes("All") || taskTypes.includes(t.skill as TaskType);
      const rewardOk = t.reward >= rewardMin && t.reward <= rewardMax;
      const q = query.trim().toLowerCase();
      const s = stack.trim().toLowerCase();
      const textOk =
        !q ||
        LANDING_COPY[language].taskTitles[t.translationIndex]
          .toLowerCase()
          .includes(q) ||
        LANDING_COPY[language].taskDescriptions[t.translationIndex]
          .toLowerCase()
          .includes(q) ||
        categoryLabels[t.skill as TaskType].toLowerCase().includes(q);
      const stackOk =
        !s ||
        categoryLabels[t.skill as TaskType].toLowerCase().includes(s) ||
        LANDING_COPY[language].taskDescriptions[t.translationIndex]
          .toLowerCase()
          .includes(s);
      return typeOk && rewardOk && textOk && stackOk;
    });
    if (sort === "reward") rows = [...rows].sort((a, b) => b.reward - a.reward);
    return rows;
  }, [taskTypes, rewardMin, rewardMax, query, stack, sort, language]);

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

  function changeLanguage(value: string) {
    const selectedLanguage = LANDING_LANGUAGES.find(
      (item) => item.code === value,
    );
    if (selectedLanguage) setLanguage(selectedLanguage.code);
  }

  return (
    <div
      className="pico-landing min-h-screen bg-[var(--board)] text-[var(--text)]"
      lang={LANDING_LANGUAGES.find((item) => item.code === language)?.locale}
    >
      <section className="landing-hero-dark relative">
        <header className="relative z-20">
          <div className="landing-header mx-auto flex items-center justify-between gap-4 px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="landing-mark" aria-hidden>P</span>
              <span className="display text-[17px] font-bold tracking-tight">PICO</span>
            </Link>

            <nav className="landing-nav hidden items-center gap-8 text-sm font-medium md:flex">
              <a href="#flow" className="nav-link">{copy.nav.how}</a>
              <a href="#clients" className="nav-link">{copy.nav.clients}</a>
              <a href="#workers" className="nav-link">{copy.nav.workers}</a>
            </nav>

            <div className="flex items-center gap-3">
              <label className="landing-language-picker">
                <span className="sr-only">{copy.languageLabel}</span>
                <select
                  value={language}
                  onChange={(event) => changeLanguage(event.currentTarget.value)}
                  aria-label={copy.languageLabel}
                >
                  {LANDING_LANGUAGES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <Link href="/app" className="landing-header-link hidden sm:inline-flex">{copy.nav.signIn}</Link>
              <Link href="/app/tasks/new" className="app-cta hidden sm:inline-flex">{copy.nav.hire}</Link>
              <button
                type="button"
                className="landing-menu-button grid h-10 w-10 place-items-center rounded-full md:hidden"
                aria-expanded={navOpen}
                aria-label={navOpen ? copy.nav.closeMenu : copy.nav.openMenu}
                onClick={() => setNavOpen((v) => !v)}
              >
                <span aria-hidden>{navOpen ? "×" : "☰"}</span>
              </button>
            </div>
          </div>
          {navOpen ? (
            <div className="landing-mobile-nav px-4 py-4 md:hidden">
              <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm font-medium">
                <a href="#flow" onClick={() => setNavOpen(false)}>{copy.nav.how}</a>
                <a href="#clients" onClick={() => setNavOpen(false)}>{copy.nav.clients}</a>
                <a href="#workers" onClick={() => setNavOpen(false)}>{copy.nav.workers}</a>
                <Link href="/app" onClick={() => setNavOpen(false)}>{copy.nav.findWork}</Link>
                <Link href="/app/tasks/new" onClick={() => setNavOpen(false)}>{copy.nav.hire}</Link>
              </div>
            </div>
          ) : null}
        </header>

        <div className="landing-promo mx-auto flex items-center justify-between gap-4 px-5">
          <p><span>{copy.promo.title}</span> {copy.promo.body}</p>
          <a href="#flow">{copy.promo.link} <span aria-hidden>→</span></a>
        </div>

        <div className="landing-hero-content mx-auto grid items-center gap-10 px-4">
          <div className="landing-hero-copy">
            <p className="landing-hero-pill"><span />{copy.hero.badge}</p>
            <h1>{copy.hero.headline[0]}<br />{copy.hero.headline[1]}<br /><span>{copy.hero.headline[2]}</span></h1>
            <p className="landing-hero-description">{copy.hero.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app/tasks/new" className="app-cta landing-hero-button">{copy.hero.postTask} <span aria-hidden>→</span></Link>
              <Link href="/app" className="app-cta-ghost landing-hero-button">{copy.hero.exploreWork}</Link>
            </div>
            <div className="landing-proof-points">
              {copy.hero.proof.map((point) => (
                <span key={point}><i aria-hidden>✓</i> {point}</span>
              ))}
            </div>
          </div>
          <div className="landing-product-preview" aria-label={copy.preview.kicker}>
            <div className="landing-preview-art">
              <div className="landing-preview-art-orbit" aria-hidden />
              <div className="landing-preview-kicker"><span /> {copy.preview.kicker} <span>01 — 03</span></div>
              <div className="landing-preview-headline">{copy.preview.headline[0]}<br /><strong>{copy.preview.headline[1]}</strong></div>
              <div className="landing-preview-caption">{copy.preview.caption}</div>
              <div className="landing-preview-people" aria-hidden>
                <span>{copy.preview.people[0]}</span><i>→</i><span>{copy.preview.people[1]}</span><i>→</i><span>{copy.preview.people[2]}</span>
              </div>
            </div>
            <div className="landing-preview-balance">
              <div><small>{copy.preview.budget}</small><b>$120</b></div>
              <div><small>{copy.preview.payment}</small><b><i>{copy.preview.held}</i></b></div>
              <div><small>{copy.preview.review}</small><b><i>{copy.preview.steps}</i></b></div>
            </div>
            <div className="landing-preview-task">
              <div className="flex items-center justify-between gap-3">
                <span className="landing-preview-label">{copy.preview.example}</span>
                <span className="landing-preview-status"><span /> {copy.preview.inReview}</span>
              </div>
              <h2>{copy.preview.taskTitle}</h2>
              <p>{copy.preview.taskDescription}</p>
              <div className="landing-preview-progress"><span /></div>
              <div className="flex justify-between text-xs text-[var(--text-muted)]"><span>{copy.preview.submitted}</span><span>{copy.preview.review} 2/2</span></div>
              <div className="landing-preview-slots">
                <div><span>01</span><b>{copy.board.execution}</b><small>{copy.preview.submitted}</small></div>
                <div><span>02</span><b>{copy.preview.primaryReview}</b><small>{copy.preview.passed}</small></div>
                <div><span>03</span><b>{copy.preview.auditReview}</b><small>{copy.preview.inProgress}</small></div>
              </div>
              <div className="landing-preview-payout"><span>{copy.preview.payout}</span><b>$120</b></div>
            </div>
          </div>
        </div>
      </section>

      <section id="clients" className="border-b border-[var(--border-default)] bg-[var(--bg-page)] pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {copy.problem.eyebrow}
          </p>
          <h2 className="display mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {copy.problem.title}
          </h2>
          <p className="mt-3 max-w-xl text-[var(--muted)]">
            {copy.problem.description}
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.problem.cards.map((p) => (
              <li
                key={p.pain}
                className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                  {p.who}
                </p>
                <h3 className="mt-2 text-base font-bold leading-snug tracking-tight">
                  {p.pain}
                </h3>
                <p className="mt-3 border-t border-[var(--border-default)] pt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text)]">{copy.problem.pico} </span>
                  {p.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="flow" className="border-b border-[var(--border-default)] bg-[var(--bg-page)] pt-16 sm:pt-20">
        <span id="verification" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {copy.flow.eyebrow}
          </p>
          <h2 className="display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {copy.flow.title}
          </h2>
          <div className="flow-rail mt-8 rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
            {copy.flow.steps.map((s, index) => (
              <div key={s.title} className="flow-step">
                <p className="flow-step-n">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 pb-10 text-sm text-[var(--muted)]">
            {copy.flow.note}
          </p>
        </div>
      </section>

      <section id="workers" className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6">
        <form
          className="landing-task-search mb-8 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.board.titleSearch}
            aria-label={copy.board.titleSearch}
          />
          <input
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder={copy.board.skillSearch}
            aria-label={copy.board.skillSearch}
          />
          <button type="submit">{copy.board.search}</button>
        </form>
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-8">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold">{copy.board.skillLane}</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--danger)] hover:underline"
                  onClick={() => setTaskTypes(["All"])}
                >
                  {copy.board.clear}
                </button>
              </div>
              <ul className="space-y-2.5">
                {TASK_TYPES.map((t) => (
                  <li key={t}>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]">
                      <input
                        type="checkbox"
                        className="filter-check"
                        checked={taskTypes.includes(t)}
                        onChange={() => toggleType(t)}
                      />
                      <span className={taskTypes.includes(t) ? "font-medium text-[var(--text)]" : ""}>
                        {categoryLabels[t]}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-bold">{copy.board.securedBudget}</h2>
              <input
                type="range"
                min={10}
                max={200}
                value={rewardMin}
                onChange={(e) =>
                  setRewardMin(Math.min(Number(e.target.value), rewardMax - 5))
                }
                className="range-input"
                aria-label={copy.board.minimumBudget}
              />
              <input
                type="range"
                min={10}
                max={200}
                value={rewardMax}
                onChange={(e) =>
                  setRewardMax(Math.max(Number(e.target.value), rewardMin + 5))
                }
                className="range-input -mt-2"
                aria-label={copy.board.maximumBudget}
              />
              <div className="mt-2 flex justify-between text-xs font-semibold">
                <span>${rewardMin}</span>
                <span>${rewardMax}</span>
              </div>
            </div>

            <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {copy.board.slots}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {copy.board.slotDescription}
              </p>
              <Link href="/app/tasks/new" className="btn-primary btn-sm mt-4 w-full">
                {copy.board.postTask}
              </Link>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="display text-2xl font-extrabold tracking-tight">
                {copy.board.openTasks}
              </h2>
              <select
                id="sort"
                value={sort}
                aria-label={copy.board.sortBy}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="sort-select"
              >
                <option value="recent">{copy.board.recent}</option>
                <option value="reward">{copy.board.highestBudget}</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((t) => (
                <article key={t.id} className="landing-task-card flex flex-col">
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
                      aria-label={copy.board.saveTask}
                      onClick={() => setSaved((s) => ({ ...s, [t.id]: !s[t.id] }))}
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
                    {copy.taskTitles[t.translationIndex]}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {categoryLabels[t.skill as TaskType]} · {t.interested} {copy.board.lookingToQualify}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="tag tag-slot">N={t.reviews} {copy.board.reviewCount}</span>
                    <span className="tag tag-mode">{copy.board.securedPayment}</span>
                    <span className="tag tag-remote">{copy.board.fixed}</span>
                  </div>

                  <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {copy.taskDescriptions[t.translationIndex]}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-2 border-t border-[var(--border)] pt-3">
                    <p className="display text-xl font-extrabold tracking-tight">
                      ${t.reward}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">{copy.board.taskAges[t.translationIndex]}</p>
                  </div>

                  <Link href="/app" className="btn-primary btn-sm mt-3 w-full">
                    {copy.board.enterBoard}
                  </Link>
                </article>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-[var(--radius)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                {copy.board.noMatches}{" "}
                <Link href="/app/tasks/new" className="font-semibold text-[var(--accent)]">
                  {copy.board.postRealTask}
                </Link>
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-secondary)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="display text-xl font-bold text-[var(--text-primary)]">pico</p>
            <p className="mt-1 max-w-sm text-sm">
              {copy.footer.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <Link href="/app" className="hover:text-[var(--text-primary)]">
              {copy.footer.app}
            </Link>
            <Link href="/app/tasks/new" className="hover:text-[var(--text-primary)]">
              {copy.footer.post}
            </Link>
            <a href="#clients" className="hover:text-[var(--text-primary)]">
              {copy.footer.clients}
            </a>
            <a href="#flow" className="hover:text-[var(--text-primary)]">
              {copy.footer.flow}
            </a>
            {[copy.board.codeReview, copy.board.debugging].map((skill) => (
              <Link key={skill} href="/app" className="hover:text-[var(--text-primary)]">
                {skill}
              </Link>
            ))}
          </div>
        </div>
        <div className="landing-footer-note px-4 py-4 text-center text-xs">
          Pico · {copy.footer.tagline}
        </div>
      </footer>
    </div>
  );
}
