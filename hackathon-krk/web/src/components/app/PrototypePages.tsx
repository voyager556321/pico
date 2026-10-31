"use client";

import Link from "next/link";
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

function TaskList({ initialFilter = "All" }: { initialFilter?: TaskFilter }) {
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
      <div className="proto-card-head">
        <div>
          <p className="proto-eyebrow">{APP_COPY[language].chrome.workspace}</p>
          <h2>{copy.tasks}</h2>
        </div>
        <Link className="app-cta" href="/app/tasks/new">{copy.newTask}</Link>
      </div>
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
      <div className="proto-task-list">
        {filtered.map((task) => {
          const [label, tone] = STATUS_LABELS[task.status];
          return (
            <Link className="proto-task-row" href={`/app/tasks/${task.id}`} key={task.id}>
              <span className="proto-task-main">
                <b>{task.title}</b>
                <small><span className={`tq-cat tq-cat-${catKey(task.cat)}`}>{task.cat}</span> {task.funded || task.paid || task.cancelled || "Draft"}</small>
              </span>
              <span className={`proto-status ${tone || "neutral"}`}>{label}</span>
              <span className="proto-amount">${fmt(task.reward)}</span>
              <span className="proto-task-worker">
                {task.worker ? `${copy.worker} #${task.worker}` : task.status === "finding" ? "…" : "—"}
              </span>
              <span className="proto-arrow" aria-hidden>↗</span>
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="proto-empty">{copy.noTasks}</p>}
      </div>
    </section>
  );
}

export function PrototypeHomePage() {
  const { language } = useAppLanguage();
  const copy = APP_COPY[language].home;
  const tasks = useMemo(tasksInOrder, []);
  const activeCount = tasks.filter((task) => ACTIVE_STATUSES.includes(task.status)).length;
  const locked = tasks.reduce((sum, task) => sum + lockedOf(task), 0);
  const paid = tasks.reduce((sum, task) => sum + (task.paidAmt || 0), 0);

  return (
    <div className="proto-stack">
      <PageTitle
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={<Link className="app-cta" href="/app/tasks/new">＋ {copy.postTask}</Link>}
      />
      <div className="proto-home-grid">
        <section className="proto-home-hero">
          <p className="proto-eyebrow">{copy.workspace}</p>
          <h2>{copy.heroTitle}</h2>
          <p>{copy.heroDescription}</p>
          <form action="/app/tasks/new">
            <input aria-label={copy.briefLabel} name="brief" placeholder={copy.briefPlaceholder} />
            <button className="app-cta" type="submit">{copy.createTask} <span aria-hidden>→</span></button>
          </form>
          <div className="tq-popular"><span>Popular:</span>{["Podcast trailer", "Logo design", "YouTube banner", "Fix a bug"].map((chip) => <Link key={chip} className="tq-chip" href={`/app/tasks/new?brief=${encodeURIComponent(chip)}`}>{chip}</Link>)}</div>
          <div className="proto-home-stats">
            <span><b>{activeCount}</b><small>{copy.activeTasks}</small></span>
            <span><b>{tasks.length}</b><small>{copy.totalTasks}</small></span>
            <span><b>${fmt(locked)}</b><small>{copy.inEscrow}</small></span>
          </div>
        </section>
        <section className="proto-balance-card">
          <div className="proto-card-head">
            <div><p className="proto-eyebrow">{copy.devnet}</p><h2>{copy.balance}</h2></div>
            <span className="proto-balance-icon">$</span>
          </div>
          <div className="proto-balance-total">${fmt(650)}</div>
          <div className="proto-kv"><span>{copy.available}</span><b>${fmt(650)}</b></div>
          <div className="proto-kv"><span>{copy.locked}</span><b>${fmt(locked)}</b></div>
          <div className="proto-kv"><span>{copy.paid}</span><b>${fmt(paid)}</b></div>
          <Link className="proto-inline-link" href="/app/balance">{copy.balanceDetails}</Link>
        </section>
      </div>
      <section className="proto-card">
        <div className="proto-card-head">
          <div><p className="proto-eyebrow">{copy.updates}</p><h2>{copy.notifications}</h2></div>
          <Link className="proto-inline-link" href="/app/activity">{copy.allActivity}</Link>
        </div>
        <div className="proto-notifications">
          {NOTES.slice(0, 4).map((note, index) => (
            <Link className="proto-notice" href={`/app/tasks/${note.go}`} key={`${note.go}-${index}`}>
              <span className="proto-notice-dot" />
              <span><b>{note.t}</b><small>{note.s}</small></span>
              <span className="proto-arrow" aria-hidden>→</span>
            </Link>
          ))}
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
        description="Video, design and dev tasks you posted: who is on it, what is due, and what needs your review."
        action={<Link className="app-cta" href="/app/tasks/new">＋ New task</Link>}
      />
      <TaskList />
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
  const tasks = useMemo(tasksInOrder, []);
  const locked = tasks.reduce((sum, task) => sum + lockedOf(task), 0);
  const paid = tasks.reduce((sum, task) => sum + (task.paidAmt || 0), 0);
  const moneyEvents = tasks.flatMap((task) =>
    task.events.filter((event) => event.tone === "money").map((event) => ({ ...event, task })),
  );
  return (
    <div className="proto-stack">
      <PageTitle eyebrow="Workspace" title="Balance" description="Money reserved for a task stays reserved until you accept the work or a reviewer passes it." />
      <div className="proto-metric-grid">
        {[
          ["Available", fmt(650), "Ready to fund a task"],
          ["Reserved for tasks", fmt(locked), `${tasks.filter((task) => ACTIVE_STATUSES.includes(task.status)).length} active tasks`],
          ["Paid out", fmt(paid), "Released after acceptance"],
        ].map(([label, value, detail]) => (
          <section className="proto-card proto-metric" key={label}><p className="proto-eyebrow">{label}</p><p className="proto-metric-value">${value}</p><p className="proto-subtitle">{detail}</p></section>
        ))}
      </div>
      <section className="proto-card">
        <div className="proto-card-head"><div><p className="proto-eyebrow">Ledger</p><h2>Transaction history</h2></div></div>
        <div className="proto-timeline">
          {moneyEvents.map((event, index) => (
            <div className="proto-event" key={`${event.task.id}-${index}`}><span className="proto-event-dot money" /><div><b>{event.title}</b><p>{event.sub} · <Link href={`/app/tasks/${event.task.id}`}>{event.task.title}</Link></p></div><time>{event.time}</time></div>
          ))}
        </div>
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
