"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TASKS, TASK_ORDER, NOTES } from "@/lib/mockdata";
import {
  ACTIVE_STATUSES,
  STATUS_LABELS,
  fmt,
  lockedOf,
  type Task,
} from "@/lib/types";

const ACTIVE_FILTERS = ["All", "Active", "Completed", "Drafts", "Cancelled"] as const;
type TaskFilter = (typeof ACTIVE_FILTERS)[number];

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

  return (
    <section className="proto-card">
      <div className="proto-card-head">
        <div>
          <p className="proto-eyebrow">Workspace</p>
          <h2>My tasks</h2>
        </div>
        <Link className="app-cta" href="/app/tasks/new">New task</Link>
      </div>
      <div className="proto-filter-row" role="group" aria-label="Filter tasks">
        {ACTIVE_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "proto-filter active" : "proto-filter"}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}<span>{counts[item]}</span>
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
                <small>{task.cat} · {task.funded || task.paid || task.cancelled || "Draft"}</small>
              </span>
              <span className={`proto-status ${tone || "neutral"}`}>{label}</span>
              <span className="proto-amount">{fmt(task.reward)} <small>USDC</small></span>
              <span className="proto-task-worker">
                {task.worker ? `Worker #${task.worker}` : task.status === "finding" ? "Finding…" : "—"}
              </span>
              <span className="proto-arrow" aria-hidden>↗</span>
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="proto-empty">No tasks in this filter.</p>}
      </div>
    </section>
  );
}

export function PrototypeHomePage() {
  const tasks = useMemo(tasksInOrder, []);
  const activeCount = tasks.filter((task) => ACTIVE_STATUSES.includes(task.status)).length;
  const locked = tasks.reduce((sum, task) => sum + lockedOf(task), 0);
  const paid = tasks.reduce((sum, task) => sum + (task.paidAmt || 0), 0);

  return (
    <div className="proto-stack">
      <PageTitle
        eyebrow="Workspace · Hiring"
        title="Home"
        description="Fund a short task in USDC escrow. Pico finds qualified specialists, then tracks delivery and payment."
        action={<Link className="app-cta" href="/app/tasks/new">＋ Post a task</Link>}
      />
      <div className="proto-home-grid">
        <section className="proto-home-hero">
          <p className="proto-eyebrow">Your workspace</p>
          <h2>Ship work without hiring.</h2>
          <p>Describe a focused task, lock its budget, and let the qualification race fill execution and review slots.</p>
          <form action="/app/tasks/new">
            <input aria-label="Task description" name="brief" placeholder="Describe the result you need…" />
            <button className="app-cta" type="submit">Create task <span aria-hidden>→</span></button>
          </form>
          <div className="proto-home-stats">
            <span><b>{activeCount}</b><small>Active tasks</small></span>
            <span><b>{tasks.length}</b><small>Total tasks</small></span>
            <span><b>{fmt(locked)} USDC</b><small>Locked in escrow</small></span>
          </div>
        </section>
        <section className="proto-balance-card">
          <div className="proto-card-head">
            <div><p className="proto-eyebrow">USDC · Devnet</p><h2>Balance</h2></div>
            <span className="proto-balance-icon">◈</span>
          </div>
          <div className="proto-balance-total">{fmt(650)} <small>USDC</small></div>
          <div className="proto-kv"><span>Available</span><b>{fmt(650)} USDC</b></div>
          <div className="proto-kv"><span>Locked in tasks</span><b>{fmt(locked)} USDC</b></div>
          <div className="proto-kv"><span>Paid out</span><b>{fmt(paid)} USDC</b></div>
          <Link className="proto-inline-link" href="/app/balance">View balance details →</Link>
        </section>
      </div>
      <section className="proto-card">
        <div className="proto-card-head">
          <div><p className="proto-eyebrow">Recent updates</p><h2>Notifications</h2></div>
          <Link className="proto-inline-link" href="/app/activity">All activity →</Link>
        </div>
        <div className="proto-notifications">
          {NOTES.slice(0, 4).map((note, index) => (
            <Link className="proto-notice" href={`/app/tasks/${note.go}`} key={`${note.go}-${index}`}>
              <span className="proto-notice-dot" />
              <span><b>{note.t}</b><small>{note.s}</small></span>
              <span className="proto-arrow" aria-hidden>→</span>
            </Link>
          ))}
          {NOTES.length === 0 && <p className="proto-empty">You’re all caught up.</p>}
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
        description="Track qualification, delivery, review, and payout for every task you have posted."
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
      <PageTitle eyebrow="Workspace" title="Balance" description="USDC on Solana Devnet. Funds stay in task escrow until work is accepted or verified." action={<Link className="app-cta" href="/app#wallet">Connect wallet</Link>} />
      <div className="proto-metric-grid">
        {[
          ["Available", fmt(650), "Ready to fund a task"],
          ["Locked in tasks", fmt(locked), `${tasks.filter((task) => ACTIVE_STATUSES.includes(task.status)).length} active tasks`],
          ["Paid out", fmt(paid), "Settled on Solana"],
        ].map(([label, value, detail]) => (
          <section className="proto-card proto-metric" key={label}><p className="proto-eyebrow">{label}</p><p className="proto-metric-value">{value}<small> USDC</small></p><p className="proto-subtitle">{detail}</p></section>
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

export function PrototypeProfilePage({ settings = false }: { settings?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("Northwind Studio");
  const [website, setWebsite] = useState("northwind.studio");
  const [about, setAbout] = useState("A product team building useful tools for independent professionals.");
  return (
    <div className="proto-stack narrow">
      <PageTitle eyebrow="Account" title={settings ? "Settings" : "Company profile"} description={settings ? "Manage account preferences and notifications." : "Tell specialists who you are and what kind of work you need."} />
      {saved && <p className="proto-success" role="status">Changes saved on this device.</p>}
      <form className="proto-card proto-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        {!settings ? <>
          <label>Company name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Website<input value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
          <label>About your company<textarea rows={5} value={about} onChange={(event) => setAbout(event.target.value)} /></label>
          <label>Industry<select defaultValue="Software"><option>Software</option><option>Design</option><option>Commerce</option><option>Other</option></select></label>
        </> : <>
          <label>Email for account updates<input type="email" defaultValue="team@northwind.studio" /></label>
          <label>Language<select defaultValue="English"><option>English</option><option>Українська</option></select></label>
          <label className="proto-check"><input type="checkbox" defaultChecked /> Email me when a worker submits a task</label>
          <label className="proto-check"><input type="checkbox" defaultChecked /> Notify me about messages and review requests</label>
          <label className="proto-check"><input type="checkbox" /> Product announcements</label>
        </>}
        <div className="proto-form-actions"><button className="app-cta" type="submit">Save changes</button><button className="app-cta-ghost" type="button" onClick={() => { setName("Northwind Studio"); setWebsite("northwind.studio"); setAbout("A product team building useful tools for independent professionals."); setSaved(false); }}>Cancel</button></div>
      </form>
    </div>
  );
}

const FAQS = [
  ["How does escrow protect a worker?", "The task budget is locked before qualification begins. Once a worker is assigned, the client cannot unilaterally reclaim those funds."],
  ["When does a task get paid?", "Payment is released after the work is accepted. Tasks with independent verification pay automatically when the reviewer passes the submission."],
  ["What happens if a task needs changes?", "The client can request a revision against a written criterion. Funds remain locked while the worker responds."],
  ["How can I open a dispute?", "Open the task and use its dispute action. Pico reviews the submitted evidence and criteria before making a decision."],
];

export function PrototypeHelpPage() {
  const [open, setOpen] = useState(0);
  return (
    <div className="proto-stack narrow">
      <PageTitle eyebrow="Account" title="Help & disputes" description="Answers about escrow, qualification, reviews, and resolving a task issue." />
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
    ["01", "Describe the outcome", "Write a focused brief, define checkable criteria, and choose the skill lane."],
    ["02", "Fund the task", "Lock USDC in a task-specific escrow and set the reward split for execution and review."],
    ["03", "Qualify specialists", "Eligible workers complete timed tests. The first qualified results fill the available slots."],
    ["04", "Review the work", "The worker submits against your criteria. You or an independent reviewer checks the result."],
    ["05", "Settle on-chain", "Accept or verify the delivery to release the escrow according to the agreed split."],
  ];
  return (
    <div className="proto-stack">
      <PageTitle eyebrow="Pico" title="How it works" description="A clear path from a focused task brief to verified, on-chain payment." />
      <section className="proto-card proto-steps">{steps.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}</section>
      <section className="proto-card proto-help-callout"><h2>Ready to get started?</h2><p>Create a task, set the scope, and lock the budget only when you are ready to publish.</p><Link className="app-cta" href="/app/tasks/new">Post a task</Link></section>
    </div>
  );
}

export function PrototypeAboutPage() {
  return (
    <div className="proto-stack">
      <section className="proto-about-hero"><p className="proto-eyebrow">About Pico</p><h1>Proof of work, not promises.</h1><p>Pico helps teams get short, verifiable tasks done by specialists who can show they are ready to do the work.</p><Link className="app-cta" href="/app/how">See how it works</Link></section>
      <section className="proto-about-grid"><article className="proto-card"><p className="proto-eyebrow">The problem</p><h2>Hiring is too much process for a small job.</h2><p>Short projects still need clear scope, trusted delivery, fair review, and reliable payment.</p></article><article className="proto-card"><p className="proto-eyebrow">The approach</p><h2>Make the outcome verifiable.</h2><p>Task-specific qualification, written criteria, escrow, and review create a straightforward path from brief to payout.</p></article></section>
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
        <div><Link className="proto-inline-link" href={`/app/tasks/${task.id}`}>← Task details</Link><p className="proto-eyebrow">Workroom</p><h1>{task.title}</h1><p className="proto-subtitle">{task.cat} · {task.worker ? `Worker #${task.worker}` : "Worker not assigned"}</p></div>
        <span className={`proto-status ${STATUS_LABELS[task.status][1] || "neutral"}`}>{STATUS_LABELS[task.status][0]}</span>
      </div>
      <nav className="proto-room-tabs" aria-label="Workroom sections">{tabs.map(([key, label]) => <Link key={key} href={hrefFor(key)} aria-current={tab === key ? "page" : undefined}>{label}</Link>)}</nav>
      {tab === "review" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Submission review</p><h2>{task.sub ? "Work submitted" : "Task criteria"}</h2></div><span className="proto-status warning">{task.sub ? "Awaiting review" : "In progress"}</span></div>{task.sub && <p className="proto-room-note">{task.sub.note}</p>}<h3>Acceptance criteria</h3><ol className="proto-criteria">{task.crit.map((criterion, index) => <li key={criterion}><span>{index + 1}</span>{criterion}</li>)}</ol><div className="proto-room-actions"><Link className="app-cta-ghost" href={`/app/tasks/${task.id}/verify`}>Open verification</Link><Link className="app-cta-ghost" href={`/app/tasks/${task.id}`}>Task status &amp; actions</Link></div></section>}
      {tab === "conversation" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Private to this workroom</p><h2>Conversation</h2></div></div><div className="proto-messages">{messages.map((message, index) => <article className={message[0] === "y" ? "proto-message mine" : "proto-message"} key={`${message[1]}-${index}`}><small>{message[0] === "y" ? "You" : `Worker #${task.worker ?? "4821"}`} · {message[1]}</small><p>{message[2]}</p></article>)}</div><form className="proto-composer" onSubmit={(event) => { event.preventDefault(); const text = draft.trim(); if (!text) return; setMessages((current) => [...current, ["y", "Just now", text]]); setDraft(""); }}><input aria-label="Write a message" placeholder="Write a message…" value={draft} onChange={(event) => setDraft(event.target.value)} /><button className="app-cta" type="submit" disabled={!draft.trim()}>Send</button></form></section>}
      {tab === "files" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Shared materials</p><h2>Files &amp; links</h2></div><button className="app-cta-ghost" type="button" onClick={() => window.alert("File upload will be connected in a future release.")}>＋ Add file</button></div><div className="proto-file-list">{(task.files ?? task.sub?.files ?? []).map(([kind, name, detail], index) => <div className="proto-file" key={`${name}-${index}`}><span className="proto-file-type">{kind}</span><span><b>{name}</b><small>{detail}</small></span><button type="button" aria-label={`Open ${name}`} onClick={() => window.alert(`File reference: ${name}`)}>↗</button></div>)}{!task.files?.length && !task.sub?.files.length && <p className="proto-empty">No files shared yet.</p>}</div></section>}
      {tab === "activity" && <section className="proto-card"><div className="proto-card-head"><div><p className="proto-eyebrow">Workroom log</p><h2>Activity</h2></div></div><div className="proto-timeline">{events.map((event, index) => <div className="proto-event" key={`${event.time}-${index}`}><span className={`proto-event-dot ${event.tone === "money" ? "money" : ""}`} /><div><b>{event.title}</b><p>{event.sub}</p></div><time>{event.time}</time></div>)}</div></section>}
    </div>
  );
}
