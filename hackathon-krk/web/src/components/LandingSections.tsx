"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { HERO_COPY, LANDING_COPY, type LandingLanguage } from "@/components/landingTranslations";
import { EXTRA_COPY, SECTIONS_COPY, WAITLIST_COPY, type Stat } from "@/components/landingSectionsCopy";

/* ------------------------------------------------------------------
   Pre-launch landing. No scroll-driven animation: sections are static,
   "How it works" auto-advances only while visible and stops as soon as
   the visitor clicks, "Secure payments" shows all three states at once.
   Every CTA leads to the waitlist form at the end of the page.
   ------------------------------------------------------------------ */

/** One sourced statistic with a small link to where the number comes from. */
function StatLine({ stat, className }: { stat: Stat; className?: string }) {
  return (
    <p className={className ? `pk-stat ${className}` : "pk-stat"}>
      {stat.text}{" "}
      <a href={stat.href} target="_blank" rel="noopener noreferrer">{stat.source}</a>
    </p>
  );
}

export type WaitlistRole = "client" | "worker";

/** true once the element has been at least `threshold` visible; `once` keeps it true. */
function useInView(ref: RefObject<HTMLElement | null>, { threshold = 0.35, once = false } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, once]);
  return inView;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Title({ parts }: { parts: string[] }) {
  return (
    <>
      {parts[0]}
      <span>{parts[1]}</span>
      {parts[2] ?? ""}
    </>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StageIcon({ stage }: { stage: number }) {
  if (stage === 1) {
    return (
      <svg viewBox="0 0 48 48" aria-hidden>
        <path d="M24 5 9 11v11c0 9.5 6.4 17.8 15 21 8.6-3.2 15-11.5 15-21V11L24 5Z" fill="currentColor" opacity=".16" />
        <path d="M24 5 9 11v11c0 9.5 6.4 17.8 15 21 8.6-3.2 15-11.5 15-21V11L24 5Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="m17 24 5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const open = stage === 2;
  return (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d={open ? "M15 21v-6a9 9 0 0 1 17.4-3.2" : "M15 21v-6a9 9 0 0 1 18 0v6"} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="9" y="21" width="30" height="22" rx="7" fill="currentColor" opacity=".16" />
      <rect x="9" y="21" width="30" height="22" rx="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="24" cy="31" r="2.6" fill="currentColor" />
      <path d="M24 33v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* Example tasks. Titles come from the translated copy; budgets are
   illustrative and labelled as examples on the page. */
const EXAMPLE_TASKS = [
  { titleIndex: 1, lane: "debugging", budget: 180, skills: ["React", "Auth", "Next.js"] },
  { titleIndex: 0, lane: "codeReview", budget: 140, skills: ["Node.js", "Security"] },
  { titleIndex: 2, lane: "qa", budget: 90, skills: ["Mobile", "Playwright"] },
  { titleIndex: 3, lane: "design", budget: 120, skills: ["Figma", "UI"] },
] as const;


const SECURITY_ICONS = [
  // confidentiality — document with a lock
  <svg key="conf" viewBox="0 0 24 24" aria-hidden><path d="M7 3h7l4 4v6M14 3v4h4M7 3v18h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="15" width="7" height="6" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M15.6 15v-1.4a1.9 1.9 0 0 1 3.8 0V15" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>,
  // skill-tested — award badge with check
  <svg key="skill" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="9.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m9.4 9.6 1.8 1.8 3.6-3.6M8.5 14.5 7 21l5-2.6 5 2.6-1.5-6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  // you control access — git branch
  <svg key="branch" viewBox="0 0 24 24" aria-hidden><circle cx="6.5" cy="5.5" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="6.5" cy="18.5" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="17.5" cy="8" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M6.5 7.8v8.4M17.5 10.3c0 4-5 3.2-9.6 6.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  // no production keys — key with a slash
  <svg key="nokey" viewBox="0 0 24 24" aria-hidden><circle cx="8.5" cy="14.5" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m11.2 11.8 7-7M16 7l2 2M14.2 8.8l1.6 1.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M3.5 3.5l17 17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
];

const CLIENT_PROGRESS = { done: [0, 1, 1, 2, 3, 5], active: [false, false, true, true, true, false] };
const WORKER_PROGRESS = { done: [1, 1, 2, 3, 3, 5], active: [false, true, true, false, true, false] };
const STEP_MS = 2000;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type WaitlistResult = "success" | "duplicate" | "error";

/** POST /api/waitlist — shared by the hero and the form at the end of the page. */
export async function postWaitlist(data: {
  email: string;
  role: WaitlistRole;
  interest: string;
  language: LandingLanguage;
  source: "hero" | "waitlist";
}): Promise<WaitlistResult> {
  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, consent: true }),
    });
    if (response.status === 409) return "duplicate";
    return response.ok ? "success" : "error";
  } catch {
    return "error";
  }
}

export function LandingSections({ language }: { language: LandingLanguage }) {
  const copy = LANDING_COPY[language];
  const s = SECTIONS_COPY[language];
  const x = EXTRA_COPY[language];
  const w = WAITLIST_COPY[language];
  const laneLabel = (lane: (typeof EXAMPLE_TASKS)[number]["lane"]) => copy.board[lane];

  /* 02 · explore */
  const [openTask, setOpenTask] = useState(0);

  /* 03 · how it works: auto-advance while visible, stop on first click */
  const howRef = useRef<HTMLElement>(null);
  const howVisible = useInView(howRef, { threshold: 0.45 });
  const [howMode, setHowMode] = useState<"client" | "worker">("client");
  const [howStep, setHowStep] = useState(0);
  const howPlaying = howVisible;
  useEffect(() => {
    if (!howPlaying || prefersReducedMotion()) return;
    const id = window.setTimeout(() => setHowStep((step) => (step + 1) % 6), STEP_MS);
    return () => window.clearTimeout(id);
  }, [howPlaying, howStep, howMode]);
  const steps = s.how.steps[howMode];
  const progressMap = howMode === "client" ? CLIENT_PROGRESS : WORKER_PROGRESS;
  const doneRows = progressMap.done[howStep];
  const activeRow = progressMap.active[howStep] ? doneRows : -1;
  const exampleTask = EXAMPLE_TASKS[0];

  /* 05 · payments: one-time reveal */
  const payRef = useRef<HTMLElement>(null);
  const payVisible = useInView(payRef, { threshold: 0.3, once: true });

  /* 06 · faq */
  const [openFaq, setOpenFaq] = useState(0);
  const faqItems = [s.faq.items[0], { q: w.faqPriceQ, a: w.faqPriceA }, ...s.faq.items.slice(1, 4), { q: w.faqNdaQ, a: w.faqNdaA }, ...s.faq.items.slice(4), { q: w.faqLaunchQ, a: w.faqLaunchA }];

  /* 04 · why: clients / specialists */
  const [whyAud, setWhyAud] = useState<"client" | "worker">("client");
  const whyOld = whyAud === "client" ? s.why.old : w.whyOldW;
  const whyPico = whyAud === "client" ? s.why.pico : w.whyPicoW;

  return (
    <div className="pk">
      <div className="pk-wrap pk-stat-band"><StatLine stat={s.stats.hire} /></div>
      {/* ============ 02 · Explore tasks ============ */}
      <section id="tasks" className="pk-section pk-explore" aria-labelledby="pk-explore-title">
        <div className="pk-wrap">
          <div className="pk-explore-head">
            <h2 id="pk-explore-title" className="pk-title"><Title parts={s.explore.title} /></h2>
            <p className="pk-lead">{s.explore.lead}</p>
          </div>

          <div className="pk-toolbar">
            <p className="pk-toolbar-label">{s.explore.example}<b>{EXAMPLE_TASKS.length}</b></p>
            <a href="#waitlist" className="pk-link">{w.tasksCta}<ArrowIcon /></a>
          </div>

          <ul className="pk-tasks">
            {EXAMPLE_TASKS.map((task, index) => (
              <li
                key={task.titleIndex}
                className={`pk-task${openTask === index ? " is-open" : ""}`}
                onMouseEnter={() => setOpenTask(index)}
                onFocus={() => setOpenTask(index)}
                tabIndex={0}
              >
                <div className="pk-task-top">
                  <span className="pk-chip">{laneLabel(task.lane)}</span>
                  {task.lane === "design" ? <span className="pk-soon">{w.soonTag}</span> : null}
                </div>
                <div className="pk-task-body">
                  <h3>{copy.taskTitles[task.titleIndex]}</h3>
                  <div className="pk-task-more">
                    <p>{copy.taskDescriptions[task.titleIndex]}</p>
                    <div className="pk-skills">
                      {task.skills.map((skill) => <span key={skill}>{skill}</span>)}
                    </div>
                  </div>
                </div>
                <div className="pk-task-bottom">
                  <div className="pk-task-budget">
                    <small>{s.explore.budget}</small>
                    <strong>${task.budget}</strong>
                  </div>
                  <div className="pk-due">
                    <b>{s.explore.deadlines[index]}</b>
                    <span className="pk-secured"><i />{copy.board.securedPayment}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 03 · How it works ============ */}
      <section
        id="flow"
        ref={howRef}
        className="pk-section pk-how"
        aria-labelledby="pk-how-title"
      >
        <div className="pk-wrap pk-how-inner">
          <div className="pk-head">
            <h2 id="pk-how-title" className="pk-title"><Title parts={s.how.title} /></h2>
            <div className="pk-toggle" role="tablist" aria-label={s.how.modeLabel}>
              {(["client", "worker"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={howMode === mode}
                  className={howMode === mode ? "is-active" : undefined}
                  onClick={() => {
                    setHowMode(mode);
                    setHowStep(0);
                  }}
                >
                  {mode === "client" ? s.how.client : s.how.worker}
                </button>
              ))}
            </div>
          </div>

          <ol className="pk-line" style={{ ["--pk-f" as string]: howStep / 5 }}>
            {steps.map((step, index) => (
              <li key={step.title} className={index < howStep ? "is-done" : index === howStep ? "is-current" : undefined}>
                <button
                  type="button"
                  onClick={() => {
                    setHowStep(index);
                  }}
                  aria-current={index === howStep ? "step" : undefined}
                >
                  <span className="pk-dot">{index < howStep ? <Check /> : String(index + 1).padStart(2, "0")}</span>
                  <span className="pk-step-name">{step.title}</span>
                  {index === howStep && howPlaying ? (
                    <span className="pk-step-timer" key={`${howMode}-${howStep}`} style={{ animationDuration: `${STEP_MS}ms` }} aria-hidden />
                  ) : null}
                </button>
              </li>
            ))}
          </ol>

          <div className="pk-stage">
            <div className="pk-stage-copy" key={`${howMode}-${howStep}`}>
              <p className="pk-stage-n">{s.how.step} {String(howStep + 1).padStart(2, "0")} / 06</p>
              <h3>{steps[howStep].title}</h3>
              <p>{steps[howStep].body}</p>
            </div>

            <div className="pk-ui" aria-label={s.how.example}>
              <div className="pk-ui-head">
                <div>
                  <small>{s.how.example} · {laneLabel(exampleTask.lane)}</small>
                  <p>{copy.taskTitles[exampleTask.titleIndex]}</p>
                </div>
                <span className={`pk-status${howStep === 5 ? " is-paid" : ""}`}>{s.how.status[howMode][howStep]}</span>
              </div>
              <div className="pk-ui-budget">
                <span>{s.explore.budget}</span>
                <strong>${exampleTask.budget}.00</strong>
              </div>
              <ul className="pk-ui-rows">
                {s.how.rows.map((row, index) => {
                  const state = index < doneRows ? "is-done" : index === activeRow ? "is-active" : "";
                  return (
                    <li key={row} className={state}>
                      <span className="pk-ui-mark">{index < doneRows ? <Check /> : null}</span>
                      {row}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 04 · Why Pico ============ */}
      <section id="clients" className="pk-section pk-why" aria-labelledby="pk-why-title">
        <div className="pk-wrap">
          <div className="pk-head">
            <h2 id="pk-why-title" className="pk-title"><Title parts={[s.why.title[0], s.why.title[1]]} /></h2>
            <div className="pk-toggle" role="tablist" aria-label={s.how.modeLabel}>
              {(["client", "worker"] as const).map((aud) => (
                <button
                  key={aud}
                  type="button"
                  role="tab"
                  aria-selected={whyAud === aud}
                  className={whyAud === aud ? "is-active" : undefined}
                  onClick={() => setWhyAud(aud)}
                >
                  {aud === "client" ? s.how.client : s.how.worker}
                </button>
              ))}
            </div>
          </div>

          {whyAud === "client" ? <StatLine stat={s.stats.downtime} className="pk-stat-why" /> : null}

          <div className="pk-split" key={whyAud}>
            <div className="pk-old">
              <p className="pk-side-label">{s.why.oldLabel}</p>
              <div className="pk-pile" aria-hidden>
                {[0, 1, 2].map((n) => (
                  <div key={n} className="pk-pile-card">
                    <span className="pk-avatar" />
                    <div><b>{whyAud === "client" ? s.why.proposal : w.whyProposalW} #{n + 14}</b><i /><i /></div>
                  </div>
                ))}
                <span className="pk-waiting">{whyAud === "client" ? s.why.oldTag : w.whyOldTagW}</span>
              </div>
              <ul className="pk-old-list">
                {whyOld.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="pk-new">
              <p className="pk-side-label">{s.why.picoLabel}</p>
              <div className="pk-new-card">
                <div className="pk-new-top">
                  <p>{copy.taskTitles[1]}</p>
                  <span className="pk-status is-paid">{whyAud === "client" ? s.why.picoTag : w.whyPicoTagW}</span>
                </div>
                <ul>
                  {whyPico.map((item) => (
                    <li key={item}><span className="pk-ui-mark is-on"><Check /></span>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 05 · Secure payments ============ */}
      <section ref={payRef} className={`pk-section pk-pay${payVisible ? " is-visible" : ""}`} aria-labelledby="pk-pay-title">
        <div className="pk-wrap">
          <h2 id="pk-pay-title" className="pk-title"><Title parts={[s.pay.title[0], s.pay.title[1]]} /></h2>

          <ol className="pk-pay-flow">
            {s.pay.states.map((state, index) => (
              <li key={state.label} style={{ ["--pk-i" as string]: index }}>
                <div className="pk-pay-top">
                  <div className="pk-pay-icon"><StageIcon stage={index} /></div>
                  <span className="pk-pay-n">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{state.title}</h3>
                <p className="pk-pay-body">{state.body}</p>
                <div className="pk-pay-row">
                  <strong>$180.00</strong>
                  <span className="pk-pay-chip"><i />{state.label}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ 05b · Code security ============ */}
      <section id="security" className="pk-section pk-sec" aria-labelledby="pk-sec-title">
        <div className="pk-wrap pk-sec-grid">
          <div className="pk-sec-head">
            <h2 id="pk-sec-title" className="pk-title"><Title parts={[w.secTitle[0], w.secTitle[1]]} /></h2>
            <p className="pk-lead">{w.secLead}</p>
            <AccessCard card={w.secCard} task={copy.taskTitles[1]} />
          </div>
          <ul className="pk-sec-list">
            {w.secItems.map((item, index) => (
              <li key={item.title}>
                <span className="pk-sec-icon">{SECURITY_ICONS[index]}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 06 · FAQ ============ */}
      <section id="faq" className="pk-section pk-faq" aria-labelledby="pk-faq-title">
        <div className="pk-wrap pk-faq-grid">
          <div className="pk-faq-side">
            <h2 id="pk-faq-title" className="pk-title">{s.faq.title}</h2>
            <div className="pk-help">
              <p className="pk-help-title">{w.readyTitle}</p>
              <p className="pk-help-sub">{w.readySub}</p>
              <a href="#waitlist" className="pk-help-link">{w.heroCta}<ArrowIcon /></a>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pk-help-arrow" src="/landing/hero-arrow.webp" alt="" aria-hidden width={920} height={714} loading="lazy" />
            </div>
          </div>
          <ol className="pk-faq-list">
            {faqItems.map((item, index) => {
              const open = openFaq === index;
              return (
                <li key={item.q} className={open ? "is-open" : undefined}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`pk-faq-${index}`}
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    <span className="pk-faq-n">{String(index + 1).padStart(2, "0")}</span>
                    <span className="pk-faq-q">{item.q}</span>
                    <span className="pk-plus" aria-hidden />
                  </button>
                  <div id={`pk-faq-${index}`} className="pk-faq-answer" role="region" hidden={!open}>
                    <p>{item.a}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============ 07 · Waitlist ============ */}
      <section id="waitlist" className="pk-final" aria-labelledby="pk-final-title">
        <div className="pk-wrap pk-final-inner">
          <div className="pk-final-copy">
            <StatLine stat={s.stats.checkout} className="pk-stat-final" />
            <h2 id="pk-final-title" className="pk-final-title"><Title parts={s.cta.title} /></h2>
            <p className="pk-final-lead">{w.lead}</p>
            <ol className="pk-next" aria-label={w.nextTitle}>
              {w.nextTitles.map((title, index) => (
                <li key={title}>
                  <span className="pk-next-n">{String(index + 1).padStart(2, "0")}</span>
                  <b>{title}</b>
                  <p>{w.nextDescs[index]}</p>
                </li>
              ))}
            </ol>
          </div>
          <WaitlistForm language={language} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pk-final-arrow" src="/landing/hero-arrow.webp" alt="" aria-hidden width={920} height={714} loading="lazy" />
      </section>

      <footer className="pk-footer">
        <div className="pk-wrap">
          <div className="pk-footer-top">
            <div className="pk-footer-brand">
              <a href="#" className="pk-footer-logo" aria-label="Pico">pico</a>
              <p>{copy.footer.description}</p>
                          </div>
            <nav className="pk-footer-cols" aria-label="Footer">
              <div>
                <p>{x.product}</p>
                <a href="#tasks">{w.footerTasks}</a>
                <a href="#flow">{copy.footer.flow}</a>
                <a href="#clients">{copy.footer.clients}</a>
                <a href="#faq">{w.navFaq}</a>
              </div>
              <div>
                <p>{w.footerEarly}</p>
                <a href="#waitlist">{w.navJoin}</a>
              </div>
            </nav>
          </div>
          <div className="pk-footer-bottom">
            <span>© {new Date().getFullYear()} Pico. {x.rights}</span>
            <span>{copy.footer.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------
   Waitlist form
   Sends POST /api/waitlist (JSON):
     { email, role: "client" | "worker", interest, language, source: "hero" | "waitlist", consent: true }
   Expected responses: 200/201 saved · 409 already on the list · anything else = error.
   The endpoint itself is backend work (see handoff note).
   ------------------------------------------------------------------ */
type FormStatus = "idle" | "submitting" | "success" | "duplicate" | "error";

function WaitlistForm({ language }: { language: LandingLanguage }) {
  const w = WAITLIST_COPY[language];
  const [role, setRole] = useState<WaitlistRole>("client");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [modal, setModal] = useState<WaitlistModalState>(null);
  const [errors, setErrors] = useState<{ email?: boolean }>({});
  const emailRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = { email: !EMAIL_RE.test(email.trim()) };
    setErrors(nextErrors);
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    setStatus("submitting");
    const result = await postWaitlist({ email: email.trim(), role, interest: interest.trim(), language, source: "waitlist" });
    if (result === "error") {
      setStatus("error");
      return;
    }
    setModal({ result, email: email.trim(), role });
    setStatus("idle");
    if (result === "success") {
      setEmail("");
      setInterest("");
    }
  }

  const submitting = status === "submitting";
  const interestLabel = role === "client" ? w.interestHire : w.interestWork;
  const interestPh = role === "client" ? w.interestHirePh : w.interestWorkPh;
  const suggestions = HERO_COPY[language].modes[role === "client" ? "hire" : "work"].suggestions;

  return (
    <>
    <WaitlistModal state={modal} language={language} onClose={() => setModal(null)} />
    <form className="pk-form" onSubmit={submit} noValidate>
      <div className="pk-form-head">
        <h3>{w.submit}</h3>
        <p>{w.formSub}</p>
      </div>

      <fieldset className="pk-form-role" disabled={submitting}>
        <legend>{w.roleLabel}</legend>
        <div className="pk-toggle pk-toggle-full">
          {(["client", "worker"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={role === item}
              className={role === item ? "is-active" : undefined}
              onClick={() => setRole(item)}
            >
              {item === "client" ? w.hire : w.work}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="pk-field">
        <span>{w.email}</span>
        <span className="pk-input">
          <svg viewBox="0 0 24 24" aria-hidden><path d="M4 6h16v12H4zM4.5 6.5l7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
          <input
            ref={emailRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            placeholder={w.emailPlaceholder}
            aria-invalid={errors.email || undefined}
            aria-describedby={errors.email ? "pk-email-error" : undefined}
            disabled={submitting}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((current) => ({ ...current, email: false }));
            }}
          />
        </span>
        {errors.email ? <small id="pk-email-error" className="pk-field-error">{w.errEmail}</small> : null}
      </label>

      <div className="pk-field">
        <label htmlFor="pk-interest">{interestLabel} <em>{w.optional}</em></label>
        <span className="pk-input">
          <svg viewBox="0 0 24 24" aria-hidden><path d="M5 5h14v10H9l-4 4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
          <input
            id="pk-interest"
            value={interest}
            placeholder={interestPh}
            maxLength={160}
            disabled={submitting}
            onChange={(event) => setInterest(event.target.value)}
          />
        </span>
        <div className="pk-quick">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              disabled={submitting}
              className={interest === item ? "is-picked" : undefined}
              onClick={() => setInterest(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>


      {status === "error" ? <p className="pk-form-note is-error" role="alert">{w.errServer}</p> : null}

      <button type="submit" className="pk-btn pk-btn-primary pk-form-submit" disabled={submitting}>
        {submitting ? <span className="pk-spinner" aria-hidden /> : null}
        {submitting ? w.submitting : w.submit}
        {submitting ? null : <ArrowIcon />}
      </button>
      <p className="pk-form-privacy">{w.consentNote}</p>
    </form>
    </>
  );
}

/* ------------------------------------------------------------------
   Result popup — shown after a waitlist submission (hero or form).
   Centered dialog over a blurred backdrop; closes on Esc, on the
   backdrop, on × and on the main button. Focus goes to the button.
   ------------------------------------------------------------------ */
export type WaitlistModalState = { result: "success" | "duplicate"; email: string; role: WaitlistRole } | null;

export function WaitlistModal({
  state,
  language,
  onClose,
}: {
  state: WaitlistModalState;
  language: LandingLanguage;
  onClose: () => void;
}) {
  const w = WAITLIST_COPY[language];
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = !!state;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => buttonRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  if (!state || typeof document === "undefined") return null;
  const success = state.result === "success";
  const [before, after] = (success ? w.successBody : w.dupBody).split("{email}");

  return createPortal(
    <div
      className="pico-landing pk-modal-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`pk-modal${success ? " is-success" : " is-duplicate"}`} role="dialog" aria-modal="true" aria-labelledby="pk-modal-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pk-modal-arrow" src="/landing/hero-arrow.webp" alt="" aria-hidden width={920} height={714} />
        <button type="button" className="pk-modal-x" aria-label={w.close} onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="pk-modal-badge" aria-hidden>
          <span className="pk-modal-ring" />
          <span className="pk-modal-ring is-2" />
          <span className="pk-modal-icon">
            {success ? (
              <Check size={30} />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4.5 6.5l7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" /></svg>
            )}
          </span>
        </div>

        <h3 id="pk-modal-title">{success ? w.successTitle : w.dupTitle}</h3>
        <p className="pk-modal-body">
          {before}
          <b>{state.email}</b>
          {after}
        </p>
        {success ? (
          <>
            <span className="pk-modal-role">{state.role === "client" ? w.successHire : w.successWork}</span>
            <ol className="pk-modal-next">
              {w.next.slice(1).map((item, index) => (
                <li key={item}><span>{index + 2}</span>{item}</li>
              ))}
            </ol>
          </>
        ) : null}

        <button ref={buttonRef} type="button" className="pk-btn pk-btn-primary pk-modal-cta" onClick={onClose}>
          {w.gotIt}
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------
   Security visual: a small product fragment instead of an icon —
   the access card a client would see for a task. The timer counts
   down to show that access is temporary.
   ------------------------------------------------------------------ */
function AccessCard({ card, task }: { task: string; card: { title: string; role: string; active: string; nda: string; id: string; env: string; ends: string } }) {
  const TOTAL = 24 * 3600;
  const [left, setLeft] = useState(TOTAL - 19);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setLeft((value) => (value <= 1 ? TOTAL - 19 : value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [TOTAL]);
  const hh = String(Math.floor(left / 3600)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const rows = [card.nda, card.id, card.env];
  return (
    <div className="pk-access" aria-hidden>
      <div className="pk-access-top">
        <span className="pk-access-title">{card.title}</span>
        <span className="pk-access-live"><i />{card.active}</span>
      </div>
      <div className="pk-access-who">
        <span className="pk-access-avatar">MK</span>
        <span>
          <b>{card.role} #2481</b>
          <small>{task}</small>
        </span>
      </div>
      <ul className="pk-access-rows">
        {rows.map((row) => (
          <li key={row}>
            <span className="pk-access-check"><Check size={12} /></span>
            {row}
          </li>
        ))}
      </ul>
      <div className="pk-access-timer">
        <span>{card.ends}</span>
        <strong>{hh}:{mm}:{ss}</strong>
      </div>
      <div className="pk-access-bar"><span style={{ width: `${(left / TOTAL) * 100}%` }} /></div>
    </div>
  );
}
