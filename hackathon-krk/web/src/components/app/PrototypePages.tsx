"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TASKS, TASK_ORDER, NOTES } from "@/lib/mockdata";
import { APP_COPY, useAppLanguage } from "@/components/app/AppLanguage";
import { useAppMode } from "@/components/app/AppChrome";
import {
  ACTIVE_STATUSES,
  STATUS_LABELS,
  fmt,
  lockedOf,
  type Task,
} from "@/lib/types";

const ACTIVE_FILTERS = ["All", "Active", "Completed", "Drafts", "Cancelled"] as const;
type TaskFilter = (typeof ACTIVE_FILTERS)[number];

export function catKey(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes("video")) return "video";
  if (c.includes("design")) return "design";
  return "dev";
}

function tasksInOrder() {
  return TASK_ORDER.map((id) => TASKS[id]).filter((task): task is Task => Boolean(task));
}

function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="proto-page-title">
      <div>
        <p className="proto-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="proto-subtitle">{description}</p>
      </div>
      {action}
    </header>
  );
}

const NEEDS_YOU: Task["status"][] = ["review", "dispute"];
const STEPS = ["Funded", "Assigned", "Working", "Review", "Paid"] as const;

// Where a task is on its way to payout: index of the current step, or null when it never started / stopped.
function taskProgress(task: Task): { current: number | null; caption: string } {
  switch (task.status) {
    case "draft": return { current: null, caption: "Not published yet" };
    case "finding": return { current: 1, caption: "Finding a specialist" };
    case "assigned": return { current: 2, caption: "Specialist assigned" };
    case "progress": return { current: 2, caption: "Specialist is working" };
    case "revision": return { current: 2, caption: "Specialist is revising" };
    case "submitted":
    case "review": return { current: 3, caption: "Waiting for your review" };
    case "verification": return { current: 3, caption: "Reviewer is checking" };
    case "dispute": return { current: 3, caption: "Dispute: reply needed" };
    case "completed": return { current: 5, caption: "Paid out" };
    default: return { current: null, caption: "Cancelled" };
  }
}

function taskDate(task: Task) {
  if (task.status === "completed") return task.paid ? `Paid ${task.paid}` : "Paid";
  if (task.status === "cancelled") return task.cancelled ? `Cancelled ${task.cancelled}` : "Cancelled";
  if (task.status === "draft") return "Draft";
  if (task.due) return `Due ${task.due}`;
  return task.funded ? `Posted ${task.funded}` : "";
}

function amountCaption(task: Task) {
  if (task.status === "completed") return "paid";
  if (task.status === "cancelled") return "returned";
  if (task.status === "draft") return "not reserved";
  return "reserved";
}

function CategoryGlyph({ cat }: { cat: string }) {
  const key = catKey(cat);
  return (
    <span className={`tq-row-glyph tq-row-glyph-${key}`} aria-hidden>
      {key === "video" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="13" height="14" rx="3" /><path d="M16 10l5-3v10l-5-3" /></svg>}
      {key === "design" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><circle cx="11" cy="11" r="2" /></svg>}
      {key === "dev" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></svg>}
    </span>
  );
}

function TaskRow({ task, workerLabel }: { task: Task; workerLabel: string }) {
  const [label, tone] = STATUS_LABELS[task.status];
  const { current, caption } = taskProgress(task);
  const needsYou = NEEDS_YOU.includes(task.status);
  const muted = task.status === "cancelled" || task.status === "draft";
  const date = taskDate(task);
  return (
    <Link className={`tq-row${needsYou ? " needs-you" : ""}${muted ? " muted" : ""}`} href={`/app/tasks/${task.id}`}>
      <CategoryGlyph cat={task.cat} />
      <span className="tq-row-main">
        <b>{task.title}</b>
        <span className="tq-row-meta">
          <span>{task.cat}</span>
          {task.worker && <><i aria-hidden>·</i><span className="tq-row-worker"><span className="tq-row-avatar" aria-hidden>{task.worker.slice(0, 2)}</span>{workerLabel} #{task.worker}</span></>}
        </span>
      </span>
      <span className="tq-row-progress">
        <span className="tq-row-status">
          <span className={`tq-status tq-status-${tone || "neutral"}`}>{label}</span>
          {date && <span className="tq-row-date"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>{date}</span>}
        </span>
        {current !== null && (
          <span className={`tq-row-steps${task.status === "dispute" ? " is-alert" : ""}`} role="img" aria-label={`${caption}. Step ${Math.min(current + 1, 5)} of 5`}>
            {STEPS.map((step, index) => <span key={step} className={index < current ? "done" : index === current ? "cur" : ""} />)}
          </span>
        )}
      </span>
      <span className="tq-row-amount"><b>${fmt(task.reward)}</b><small>{amountCaption(task)}</small></span>
      <span className="tq-row-action">
        {needsYou
          ? <span className="tq-row-cta">{task.status === "dispute" ? "Reply" : "Review"}<span aria-hidden>→</span></span>
          : <span className="tq-row-arrow" aria-hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></span>}
      </span>
    </Link>
  );
}

function TaskList({ initialFilter = "All", showHeader = true }: { initialFilter?: TaskFilter; showHeader?: boolean }) {
  const { language } = useAppLanguage();
  const copy = APP_COPY[language].home;
  const [filter, setFilter] = useState<TaskFilter>(initialFilter);
  const tasks = useMemo(tasksInOrder, []);
  const filtered = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Active") return ACTIVE_STATUSES.includes(task.status);
    if (filter === "Completed") return task.status === "completed";
    if (filter === "Drafts") return task.status === "draft";
    return task.status === "cancelled";
  });
  const counts = {
    All: tasks.length,
    Active: tasks.filter((task) => ACTIVE_STATUSES.includes(task.status)).length,
    Completed: tasks.filter((task) => task.status === "completed").length,
    Drafts: tasks.filter((task) => task.status === "draft").length,
    Cancelled: tasks.filter((task) => task.status === "cancelled").length,
  };
  const filterLabels: Record<TaskFilter, string> = {
    All: copy.all,
    Active: copy.active,
    Completed: copy.completed,
    Drafts: copy.drafts,
    Cancelled: copy.cancelled,
  };

  return (
    <section className="proto-card">
      {showHeader && (
        <div className="proto-card-head">
          <div>
            <p className="proto-eyebrow">{APP_COPY[language].chrome.workspace}</p>
            <h2>{copy.tasks}</h2>
          </div>
          <Link className="app-cta" href="/app/tasks/new">{copy.newTask}</Link>
        </div>
      )}
      <div className="proto-filter-row" role="group" aria-label={copy.filterTasks}>
        {ACTIVE_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "proto-filter active" : "proto-filter"}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {filterLabels[item]}<span>{counts[item]}</span>
          </button>
        ))}
      </div>
      <div className="tq-rows">
        {(() => {
          const urgent = filtered.filter((task) => NEEDS_YOU.includes(task.status));
          const rest = filtered.filter((task) => !NEEDS_YOU.includes(task.status));
          const grouped = urgent.length > 0 && rest.length > 0;
          return (
            <>
              {grouped && <p className="tq-rows-label">Needs you <span>{urgent.length}</span></p>}
              {urgent.map((task) => <TaskRow key={task.id} task={task} workerLabel={copy.worker} />)}
              {grouped && <p className="tq-rows-label">Everything else <span>{rest.length}</span></p>}
              {rest.map((task) => <TaskRow key={task.id} task={task} workerLabel={copy.worker} />)}
            </>
          );
        })()}
        {filtered.length === 0 && <p className="proto-empty">{copy.noTasks}</p>}
      </div>
    </section>
  );
}

export function PrototypeHomePage() {
  const { language } = useAppLanguage();
  const copy = APP_COPY[language].home;
  const tasks = useMemo(tasksInOrder, []);
  const router = useRouter();
  const locked = tasks.reduce((sum, task) => sum + lockedOf(task), 0);
  const paid = tasks.reduce((sum, task) => sum + (task.paidAmt || 0), 0);

  return (
    <div className="proto-stack">
      <h1 className="sr-only">{copy.title}</h1>
      <div className="tq-home-top">
      <section className="tq-hero">
        <div className="tq-hero-copy">
          <h2>{copy.heroTitle}</h2>
          <p className="tq-hero-sub">{copy.heroDescription}</p>
          <form
            className="tq-hero-search"
            action="/app/tasks/new"
            onSubmit={(event) => {
              // Client-side navigation: no full page reload, so the click responds instantly.
              event.preventDefault();
              const brief = new FormData(event.currentTarget).get("brief")?.toString().trim() ?? "";
              router.push(brief ? `/app/tasks/new?brief=${encodeURIComponent(brief)}` : "/app/tasks/new");
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input aria-label={copy.briefLabel} name="brief" placeholder={copy.briefPlaceholder} />
            <button type="submit">{copy.createTask}<span aria-hidden>→</span></button>
          </form>
          <div className="tq-hero-try">
            <span>Try:</span>
            {["Podcast trailer", "Logo design", "YouTube banner", "Fix a bug"].map((chip) => <Link key={chip} href={`/app/tasks/new?brief=${encodeURIComponent(chip)}`}>{chip}</Link>)}
          </div>
        </div>
      </section>
      <section className="tq-balance">
        <div className="tq-balance-head">
          <span>{copy.balance}</span>
          <Link href="/app/balance">{copy.balanceDetails}</Link>
        </div>
        <b className="tq-balance-total">${fmt(650)}</b>
        <span className="tq-balance-caption">{copy.available}</span>
        <div className="tq-balance-rows">
          <div><span><i className="is-held" />{copy.locked}</span><b>${fmt(locked)}</b></div>
          <div><span><i className="is-paid" />{copy.paid}</span><b>${fmt(paid)}</b></div>
        </div>
      </section>
      </div>
      <section className="proto-card">
        <div className="proto-card-head">
          <div><p className="proto-eyebrow">{copy.updates}</p><h2>{copy.notifications}</h2></div>
          <Link className="proto-inline-link" href="/app/activity">{copy.allActivity}</Link>
        </div>
        <div className="proto-notifications">
          {NOTES.slice(0, 4).map((note, index) => {
            const status = TASKS[note.go]?.status;
            const kind = status === "dispute" ? "dispute" : status === "review" || status === "submitted" ? "review" : "info";
            const action = kind === "dispute" ? "Reply" : kind === "review" ? "Review" : "View";
            return (
              <Link className={`proto-notice tq-notice-${kind}`} href={`/app/tasks/${note.go}`} key={`${note.go}-${index}`}>
                <span className="tq-notice-icon" aria-hidden>
                  {kind === "review" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 14l2 2 4-4" /></svg>}
                  {kind === "dispute" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M12 8v4M12 15.5v.01" /></svg>}
                  {kind === "info" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>}
                </span>
                <span className="tq-notice-text"><b>{note.t}</b><small>{note.s}</small></span>
                <span className="tq-notice-action">{action}<span aria-hidden>→</span></span>
              </Link>
            );
          })}
          {NOTES.length === 0 && <p className="proto-empty">{copy.caughtUp}</p>}
        </div>
      </section>
      <TaskList />
    </div>
  );
}

export function PrototypeTasksPage() {
  return (
    <div className="proto-stack">
      <PageTitle
        eyebrow="Workspace"
        title="My tasks"
        description="What needs your review, who is on each task, and where your money is."
        action={<Link className="app-cta" href="/app/tasks/new">＋ New task</Link>}
      />
      <TaskList showHeader={false} />
    </div>
  );
}

export function PrototypeActivityPage() {
  const events = useMemo(
    () => tasksInOrder()
      .flatMap((task) => task.events.map((event) => ({ ...event, task })))
      .sort((a, b) => b.time.localeCompare(a.time)),
    [],
  );
  const [filter, setFilter] = useState<"All activity" | "Money">("All activity");
  const visible = filter === "Money" ? events.filter((event) => event.tone === "money") : events;

  return (
    <div className="proto-stack">
      <PageTitle eyebrow="Workspace" title="Activity" description="A timeline of every important event across your tasks." />
      <section className="proto-card">
        <div className="proto-card-head">
          <div><p className="proto-eyebrow">History</p><h2>All activity</h2></div>
          <div className="proto-filter-row compact">
            {(["All activity", "Money"] as const).map((item) => (
              <button key={item} className={filter === item ? "proto-filter active" : "proto-filter"} onClick={() => setFilter(item)} type="button" aria-pressed={filter === item}>{item}</button>
            ))}
          </div>
        </div>
        <div className="proto-timeline">
          {visible.map((event, index) => (
            <div className="proto-event" key={`${event.task.id}-${event.time}-${index}`}>
              <span className={event.tone === "money" ? "proto-event-dot money" : "proto-event-dot"} />
              <div><b>{event.title}</b><p>{event.sub} · <Link href={`/app/tasks/${event.task.id}`}>{event.task.title}</Link></p></div>
              <time>{event.time}</time>
            </div>
          ))}
          {visible.length === 0 && <p className="proto-empty">No activity yet.</p>}
        </div>
      </section>
    </div>
  );
}

export function PrototypeBalancePage() {
  return (
    <div className="proto-stack narrow">
      <PageTitle eyebrow="Workspace" title="Balance" description="Payment accounts will appear here when fiat payments are available." />
      <section className="proto-card" role="status">
        <p className="proto-eyebrow">Payments unavailable</p>
        <h2 className="mt-2 text-lg font-bold">Fiat payments are being integrated</h2>
        <p className="proto-subtitle mt-2">Funding, withdrawals, task escrow and payouts are disabled for now. No balance or transaction history is available.</p>
      </section>
    </div>
  );
}

type HistoryItem = { id: string; title: string; cat: string; client: string; amount: number; date: string; result: string; quote?: string };

const SPECIALISTS: { id: string; name: string; role: string; skills: string[]; since: string; history: HistoryItem[] }[] = [
  {
    id: "3107",
    name: "Maya Kowalska",
    role: "Video editor and motion designer",
    skills: ["Podcast trailers", "Product demos", "Captions", "After Effects"],
    since: "Aug 2026",
    history: [
      { id: "launch", title: "Product demo video (45 s)", cat: "Video", client: "Northwind Studio", amount: 60, date: "Sep 18", result: "Accepted, all 3 criteria met", quote: "Clean cut, both formats on time." },
      { id: "icons", title: "Icon set cleanup", cat: "Design", client: "Northwind Studio", amount: 45, date: "Sep 12", result: "Accepted, all criteria met" },
      { id: "x1", title: "Podcast trailer, episode 7", cat: "Video", client: "Signal Room", amount: 100, date: "Sep 3", result: "Accepted after 1 revision" },
    ],
  },
  {
    id: "2744",
    name: "Daniel Okafor",
    role: "Editor for podcasts and short-form video",
    skills: ["Podcast trailers", "Shorts", "Premiere Pro"],
    since: "Sep 2026",
    history: [
      { id: "x2", title: "3 shorts from a webinar", cat: "Video", client: "Fernway", amount: 90, date: "Sep 10", result: "Accepted, all criteria met" },
    ],
  },
];

function SpecialistCard({ s }: { s: (typeof SPECIALISTS)[number] }) {
  const total = s.history.reduce((sum, item) => sum + item.amount, 0);
  const firstTry = s.history.filter((item) => !item.result.includes("revision")).length;
  return (
    <section className="proto-card tq-specialist">
      <div className="tq-spec-head">
        <span className="tq-avatar">{s.name.split(" ").map((w) => w[0]).join("")}</span>
        <div><h2>{s.name}</h2><p className="proto-subtitle">{s.role} · on Task.quo since {s.since}</p></div>
      </div>
      <div className="tq-skill-row">{s.skills.map((skill) => <span className="tq-chip" key={skill}>{skill}</span>)}</div>
      <div className="tq-spec-stats">
        <span><b>{s.history.length}</b><small>Accepted projects</small></span>
        <span><b>{firstTry}/{s.history.length}</b><small>Accepted on first try</small></span>
        <span><b>${fmt(total)}</b><small>Earned on Task.quo</small></span>
      </div>
      <h3 className="tq-h3">Project history</h3>
      <ol className="tq-history">
        {s.history.map((item) => (
          <li key={item.id}>
            <div>
              <b>{TASKS[item.id] ? <Link href={`/app/tasks/${item.id}`}>{item.title}</Link> : item.title}</b>
              <small><span className={`tq-cat tq-cat-${catKey(item.cat)}`}>{item.cat}</span> for {item.client} · {item.date}</small>
              {item.quote && <q>{item.quote}</q>}
            </div>
            <span className="tq-history-side"><span className="proto-status success">{item.result}</span><b>${fmt(item.amount)}</b></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PrototypeProfilePage({ settings = false }: { settings?: boolean }) {
  const [mode] = useAppMode();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("Northwind Studio");
  const [website, setWebsite] = useState("northwind.studio");
  const [about, setAbout] = useState("A product team building useful tools for independent professionals.");
  if (!settings && mode === "working") {
    return (
      <div className="proto-stack narrow">
        <PageTitle eyebrow="Account" title="Your specialist profile" description="Clients see the projects you delivered and how they were accepted, not just a rating." />
        <SpecialistCard s={SPECIALISTS[0]} />
      </div>
    );
  }
  return (
    <div className="proto-stack narrow">
      <PageTitle eyebrow="Account" title={settings ? "Settings" : "Company profile"} description={settings ? "Manage account preferences and notifications." : "Tell specialists who you are and what kind of work you need."} />
      {saved && <p className="proto-success" role="status">Changes saved on this device.</p>}
      <form className="proto-card proto-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        {!settings ? <>
          <label>Company name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Website<input value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
          <label>About your company<textarea rows={5} value={about} onChange={(event) => setAbout(event.target.value)} /></label>
          <label>What you usually need<select defaultValue="Video"><option>Video</option><option>Design</option><option>Development</option><option>A mix</option></select></label>
        </> : <>
          <label>Email for account updates<input type="email" defaultValue="team@northwind.studio" /></label>
          <label>Language<select defaultValue="English"><option>English</option><option>Українська</option></select></label>
          <label className="proto-check"><input type="checkbox" defaultChecked /> Email me when a specialist submits work</label>
          <label className="proto-check"><input type="checkbox" defaultChecked /> Notify me about messages and review requests</label>
          <label className="proto-check"><input type="checkbox" /> Product announcements</label>
        </>}
        <div className="proto-form-actions"><button className="app-cta" type="submit">Save changes</button><button className="app-cta-ghost" type="button" onClick={() => { setName("Northwind Studio"); setWebsite("northwind.studio"); setAbout("A product team building useful tools for independent professionals."); setSaved(false); }}>Cancel</button></div>
      </form>
      {!settings && <>
        <div className="tq-section-label"><h2>Specialists you worked with</h2><p className="proto-subtitle">Every profile shows real accepted projects.</p></div>
        {SPECIALISTS.map((sp) => <SpecialistCard key={sp.id} s={sp} />)}
      </>}
    </div>
  );
}

const FAQS = [
  ["How is a specialist protected?", "The budget is reserved before anyone starts. Once a specialist is assigned, the client can’t take it back on their own."],
  ["When does a task get paid?", "Payment is released after the work is accepted. Tasks with independent verification pay automatically when the reviewer passes the submission."],
  ["What happens if a task needs changes?", "The client can request a revision against a written criterion. The budget stays reserved while the specialist responds."],
  ["How can I open a dispute?", "Open the task and use its dispute action. Task.quo reviews the submitted evidence and criteria before making a decision."],
];

export function PrototypeHelpPage() {
  const [open, setOpen] = useState(0);
  return (
    <div className="proto-stack narrow">
      <PageTitle eyebrow="Account" title="Help & disputes" description="Answers about payments, skill tests, reviews, and resolving a task issue." />
      <section className="proto-card">
        <p className="proto-eyebrow">Frequently asked questions</p>
        <div className="proto-faq">
          {FAQS.map(([question, answer], index) => (
            <div className="proto-faq-item" key={question}>
              <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}<span>{open === index ? "−" : "+"}</span></button>
              {open === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="proto-card proto-help-callout"><h2>Need help with a task?</h2><p>Open the task workroom to see its conversation, files, review, and activity in one place.</p><Link className="app-cta-ghost" href="/app/tasks/signup/room/conversation">Open a workroom</Link></section>
    </div>
  );
}

export function PrototypeHowPage() {
  const steps = [
    ["01", "Describe the outcome", "Write a short brief and 3–5 criteria anyone can check: video, design or dev."],
    ["02", "Reserve the budget", "The budget is held for this task only. Nothing is paid until the work passes."],
    ["03", "Qualify specialists", "Specialists take a short skill test for your task. The first who pass get the job."],
    ["04", "Review the work", "The worker submits against your criteria. You or an independent reviewer checks the result."],
    ["05", "Accept and pay", "Accept the work and the specialist gets paid. Not happy? Request a revision or open a dispute."],
  ];
  return (
    <div className="proto-stack">
      <PageTitle eyebrow="Task.quo" title="How it works" description="From a short brief to accepted work, usually within days." />
      <section className="proto-card proto-steps">{steps.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}</section>
      <section className="proto-card proto-help-callout"><h2>Ready to get started?</h2><p>Create a task, set the scope, and reserve the budget only when you are ready to publish.</p><Link className="app-cta" href="/app/tasks/new">Post a task</Link></section>
    </div>
  );
}

export function PrototypeAboutPage() {
  return (
    <div className="proto-stack">
      <section className="proto-about-hero"><p className="proto-eyebrow">About Task.quo</p><h1>Proof of work, not promises.</h1><p>Task.quo helps teams get short tasks done: a video edit, a logo, a bug fix, by specialists who can show they are ready to do the work.</p><Link className="app-cta" href="/app/how">See how it works</Link></section>
      <section className="proto-about-grid"><article className="proto-card"><p className="proto-eyebrow">The problem</p><h2>Hiring is too much process for a small job.</h2><p>Short projects still need clear scope, trusted delivery, fair review, and reliable payment.</p></article><article className="proto-card"><p className="proto-eyebrow">The approach</p><h2>Make the outcome verifiable.</h2><p>A skill test per task, written criteria, a reserved budget and a review create a straightforward path from brief to payout.</p></article></section>
    </div>
  );
}

export function PrototypeWorkroomPage({ taskId, tab }: { taskId: string; tab: string }) {
  const task = TASKS[taskId] ?? TASKS.signup;
  const [messages, setMessages] = useState(task.chat ?? []);
  const [draft, setDraft] = useState("");
  const tabs = [
    ["review", "Review"],
    ["conversation", "Conversation"],
    ["files", "Files & links"],
    ["activity", "Activity"],
  ];
  const hrefFor = (nextTab: string) => `/app/tasks/${task.id}/room/${nextTab}`;
  const events = task.events;

  return (
    <div className="proto-stack">
      <div className="proto-room-head">
        <div><Link className="proto-inline-link" href={`/app/tasks/${task.id}`}>← Task details</Link><p className="proto-eyebrow">Workroom</p><h1>{task.title}</h1><p className="proto-subtitle">{task.cat} · {task.worker ? `Specialist #${task.worker}` : "No specialist yet"}</p></div>
        <span className={`proto-status ${STATUS_LABELS[task.status][1] || "neutral"}`}>{STATUS_LABELS[task.status][0]}</span>
      </div>
      <nav className="proto-room-tabs" aria-label="Workroom sections">{tabs.map(([key, label]) => <Link key={key} href={hrefFor(key)} aria-current={tab === key ? "page" : undefined}>{label}</Link>)}</nav>
      {tab === "review" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Submission review</p><h2>{task.sub ? "Work submitted" : "Task criteria"}</h2></div><span className="proto-status warning">{task.sub ? "Awaiting review" : "In progress"}</span></div>{task.sub && <p className="proto-room-note">{task.sub.note}</p>}<h3>Acceptance criteria</h3><ol className="proto-criteria">{task.crit.map((criterion, index) => <li key={criterion}><span>{index + 1}</span>{criterion}</li>)}</ol><div className="proto-room-actions"><Link className="app-cta-ghost" href={`/app/tasks/${task.id}/verify`}>Open verification</Link><Link className="app-cta-ghost" href={`/app/tasks/${task.id}`}>Task status &amp; actions</Link></div></section>}
      {tab === "conversation" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Private to this workroom</p><h2>Conversation</h2></div></div><div className="proto-messages">{messages.map((message, index) => <article className={message[0] === "y" ? "proto-message mine" : "proto-message"} key={`${message[1]}-${index}`}><small>{message[0] === "y" ? "You" : `Specialist #${task.worker ?? "4821"}`} · {message[1]}</small><p>{message[2]}</p></article>)}</div><form className="proto-composer" onSubmit={(event) => { event.preventDefault(); const text = draft.trim(); if (!text) return; setMessages((current) => [...current, ["y", "Just now", text]]); setDraft(""); }}><input aria-label="Write a message" placeholder="Write a message…" value={draft} onChange={(event) => setDraft(event.target.value)} /><button className="app-cta" type="submit" disabled={!draft.trim()}>Send</button></form></section>}
      {tab === "files" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Shared materials</p><h2>Files &amp; links</h2></div><button className="app-cta-ghost" type="button" onClick={() => window.alert("File upload will be connected in a future release.")}>＋ Add file</button></div><div className="proto-file-list">{(task.files ?? task.sub?.files ?? []).map(([kind, name, detail], index) => <div className="proto-file" key={`${name}-${index}`}><span className="proto-file-type">{kind}</span><span><b>{name}</b><small>{detail}</small></span><button type="button" aria-label={`Open ${name}`} onClick={() => window.alert(`File reference: ${name}`)}>↗</button></div>)}{!task.files?.length && !task.sub?.files.length && <p className="proto-empty">No files shared yet.</p>}</div></section>}
      {tab === "activity" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Workroom log</p><h2>Activity</h2></div></div><div className="proto-timeline">{events.map((event, index) => <div className="proto-event" key={`${event.time}-${index}`}><span className={`proto-event-dot ${event.tone === "money" ? "money" : ""}`} /><div><b>{event.title}</b><p>{event.sub}</p></div><time>{event.time}</time></div>)}</div></section>}
    </div>
  );
}
