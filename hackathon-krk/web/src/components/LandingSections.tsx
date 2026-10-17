"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { LANDING_COPY, type LandingLanguage } from "@/components/landingTranslations";
import { EXTRA_COPY, SECTIONS_COPY } from "@/components/landingSectionsCopy";

/* ------------------------------------------------------------------
   Scroll progress of a tall "sticky" section: 0 at its top, 1 when its
   bottom reaches the viewport bottom. Returns null when the section is
   not taller than the viewport (mobile layout), so the caller falls
   back to tap-driven state.
   ------------------------------------------------------------------ */
function useStickyProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState<number | null>(null);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        if (travel < 40) {
          setProgress(null);
          return;
        }
        setProgress(Math.min(1, Math.max(0, -rect.top / travel)));
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [ref]);
  return progress;
}

function scrollToStage(el: HTMLElement | null, index: number, count: number) {
  if (!el) return;
  const travel = el.offsetHeight - window.innerHeight;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: top + travel * ((index + 0.5) / count), behavior: "smooth" });
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

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Example tasks shown on the landing. Titles come from the existing
   translated copy; budgets are illustrative and labelled as examples. */
const EXAMPLE_TASKS = [
  { titleIndex: 1, lane: "debugging", budget: 180, skills: ["React", "Auth", "Next.js"] },
  { titleIndex: 0, lane: "codeReview", budget: 140, skills: ["Node.js", "Security"] },
  { titleIndex: 2, lane: "qa", budget: 90, skills: ["Mobile", "Playwright"] },
  { titleIndex: 3, lane: "design", budget: 120, skills: ["Figma", "UI"] },
] as const;

const CLIENT_PROGRESS = { done: [0, 1, 1, 2, 3, 5], active: [false, false, true, true, true, false] };
const WORKER_PROGRESS = { done: [1, 1, 2, 3, 3, 5], active: [false, true, true, false, true, false] };

export function LandingSections({ language }: { language: LandingLanguage }) {
  const copy = LANDING_COPY[language];
  const s = SECTIONS_COPY[language];
  const x = EXTRA_COPY[language];

  /* 02 · explore */
  const [openTask, setOpenTask] = useState(0);

  /* 03 · how it works */
  const howRef = useRef<HTMLElement>(null);
  const howProgress = useStickyProgress(howRef);
  const [howMode, setHowMode] = useState<"client" | "worker">("client");
  const [howTap, setHowTap] = useState(0);
  const howStep = howProgress === null ? howTap : Math.min(5, Math.floor(howProgress * 6));
  const steps = s.how.steps[howMode];
  const progressMap = howMode === "client" ? CLIENT_PROGRESS : WORKER_PROGRESS;
  const doneRows = progressMap.done[howStep];
  const activeRow = progressMap.active[howStep] ? doneRows : -1;
  const exampleTask = EXAMPLE_TASKS[0];

  /* 05 · payments */
  const payRef = useRef<HTMLElement>(null);
  const payProgress = useStickyProgress(payRef);
  const [payTap, setPayTap] = useState(0);
  const payStage = payProgress === null ? payTap : Math.min(2, Math.floor(payProgress * 3));

  /* 06 · faq */
  const [openFaq, setOpenFaq] = useState(0);

  const laneLabel = (lane: (typeof EXAMPLE_TASKS)[number]["lane"]) => copy.board[lane];

  return (
    <div className="pk">
      {/* ============ 02 · Explore tasks ============ */}
      <section className="pk-section pk-explore" aria-labelledby="pk-explore-title">
        <div className="pk-wrap">
          <div className="pk-explore-head">
            <h2 id="pk-explore-title" className="pk-title"><Title parts={s.explore.title} /></h2>
            <p className="pk-lead">{s.explore.lead}</p>
          </div>

          <div className="pk-toolbar">
            <p className="pk-toolbar-label">{s.explore.example}<b>{EXAMPLE_TASKS.length}</b></p>
            <Link href="/app" className="pk-link">{s.explore.viewAll}<ArrowIcon /></Link>
          </div>
          <ul className="pk-tasks">
            {EXAMPLE_TASKS.map((task, index) => (
              <li
                key={task.titleIndex}
                className={`pk-task${openTask === index ? " is-open" : ""}`}
                onMouseEnter={() => setOpenTask(index)}
                onFocus={() => setOpenTask(index)}
              >
                <div className="pk-task-top">
                  <span className="pk-chip">{laneLabel(task.lane)}</span>
                  <Link href="/app" className="pk-task-cta" aria-label={`${copy.board.enterBoard}: ${copy.taskTitles[task.titleIndex]}`}>
                    <ArrowIcon />
                  </Link>
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
                    <strong>{task.budget}<em>USDC</em></strong>
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
      <section id="flow" ref={howRef} className="pk-how" aria-labelledby="pk-how-title">
        <div className="pk-sticky">
          <div className="pk-wrap pk-how-inner">
            <div className="pk-head">
              <div>
                <h2 id="pk-how-title" className="pk-title"><Title parts={s.how.title} /></h2>
              </div>
              <div className="pk-toggle" role="tablist" aria-label={s.how.modeLabel}>
                {(["client", "worker"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={howMode === mode}
                    className={howMode === mode ? "is-active" : undefined}
                    onClick={() => setHowMode(mode)}
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
                    onClick={() => (howProgress === null ? setHowTap(index) : scrollToStage(howRef.current, index, 6))}
                    aria-current={index === howStep ? "step" : undefined}
                  >
                    <span className="pk-dot">{index < howStep ? <Check /> : String(index + 1).padStart(2, "0")}</span>
                    <span className="pk-step-name">{step.title}</span>
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
                  <strong>{exampleTask.budget}.00 <em>USDC</em></strong>
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
        </div>
      </section>

      {/* ============ 04 · Why Pico ============ */}
      <section id="clients" className="pk-section pk-why" aria-labelledby="pk-why-title">
        <div className="pk-wrap">
          <h2 id="pk-why-title" className="pk-title"><Title parts={[s.why.title[0], s.why.title[1]]} /></h2>

          <div className="pk-split">
            <div className="pk-old">
              <p className="pk-side-label">{s.why.oldLabel}</p>
              <div className="pk-pile" aria-hidden>
                {[0, 1, 2].map((n) => (
                  <div key={n} className="pk-pile-card">
                    <span className="pk-avatar" />
                    <div><b>{s.why.proposal} #{n + 14}</b><i /><i /></div>
                  </div>
                ))}
                <span className="pk-waiting">{s.why.oldTag}</span>
              </div>
              <ul className="pk-old-list">
                {s.why.old.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="pk-new">
              <p className="pk-side-label">{s.why.picoLabel}</p>
              <div className="pk-new-card">
                <div className="pk-new-top">
                  <p>{copy.taskTitles[1]}</p>
                  <span className="pk-status is-paid">{s.why.picoTag}</span>
                </div>
                <ul>
                  {s.why.pico.map((item) => (
                    <li key={item}><span className="pk-ui-mark is-on"><Check /></span>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 05 · Secure payments ============ */}
      <section ref={payRef} className="pk-pay" aria-labelledby="pk-pay-title">
        <div className="pk-sticky pk-pay-sticky">
          <div className="pk-wrap pk-pay-inner">
            <div className="pk-pay-copy">
              <h2 id="pk-pay-title" className="pk-title"><Title parts={[s.pay.title[0], s.pay.title[1]]} /></h2>
              <ol className="pk-pay-states">
                {s.pay.states.map((state, index) => (
                  <li key={state.label} className={index < payStage ? "is-done" : index === payStage ? "is-current" : undefined}>
                    <button
                      type="button"
                      onClick={() => (payProgress === null ? setPayTap(index) : scrollToStage(payRef.current, index, 3))}
                    >
                      <span className="pk-pay-dot">{index < payStage ? <Check /> : null}</span>
                      <span>
                        <b>{state.title}</b>
                        {index === payStage ? <small>{state.body}</small> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className={`pk-vault is-stage-${payStage}`}>
              <svg className="pk-lock" viewBox="0 0 120 140" aria-hidden>
                <path className="pk-lock-shackle" d="M34 62V44a26 26 0 0 1 52 0v18" fill="none" strokeWidth="11" strokeLinecap="round" />
                <rect x="16" y="60" width="88" height="72" rx="20" className="pk-lock-body" />
                <circle cx="60" cy="92" r="8" className="pk-lock-key" />
                <rect x="56" y="96" width="8" height="16" rx="4" className="pk-lock-key" />
              </svg>
              <p className="pk-vault-label">{s.pay.amountLabel}</p>
              <p className="pk-vault-amount">180.00<span> USDC</span></p>
              <p className="pk-vault-state"><i />{s.pay.states[payStage].label}</p>
              <p className="pk-vault-network">{s.pay.network}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 06 · FAQ ============ */}
      <section className="pk-section pk-faq" aria-labelledby="pk-faq-title">
        <div className="pk-wrap pk-faq-grid">
          <div className="pk-faq-side">
            <h2 id="pk-faq-title" className="pk-title">{s.faq.title}</h2>
            <div className="pk-help">
              <p>{x.helpTitle}</p>
              <Link href="/app/help" className="pk-help-link">{x.helpCta}<ArrowIcon /></Link>
            </div>
          </div>
          <ol className="pk-faq-list">
            {s.faq.items.map((item, index) => {
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

      {/* ============ 07 · Final CTA ============ */}
      <section className="pk-final" aria-labelledby="pk-final-title">
        <div className="pk-wrap pk-final-inner">
          <h2 id="pk-final-title" className="pk-final-title"><Title parts={s.cta.title} /></h2>
          <div className="pk-final-actions">
            <Link href="/app/tasks/new" className="pk-btn pk-btn-primary">{s.cta.post}<ArrowIcon /></Link>
            <Link href="/app" className="pk-btn pk-btn-ghost">{s.cta.find}</Link>
          </div>
          <p className="pk-final-note">{s.cta.note}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pk-final-arrow" src="/landing/hero-arrow.webp" alt="" aria-hidden width={920} height={714} loading="lazy" />
      </section>

      <footer className="pk-footer">
        <div className="pk-wrap">
          <div className="pk-footer-top">
            <div className="pk-footer-brand">
              <Link href="/" className="pk-footer-logo" aria-label="Pico">pico</Link>
              <p>{copy.footer.description}</p>
              <span className="pk-footer-network"><i />{s.pay.network}</span>
            </div>
            <nav className="pk-footer-cols" aria-label="Footer">
              <div>
                <p>{x.product}</p>
                <Link href="/app/tasks/new">{copy.footer.post}</Link>
                <Link href="/app">{copy.nav.findWork}</Link>
                <a href="#flow">{copy.footer.flow}</a>
                <a href="#clients">{copy.footer.clients}</a>
              </div>
              <div>
                <p>{x.account}</p>
                <Link href="/app">{copy.nav.signIn}</Link>
                <Link href="/app/balance">{x.balance}</Link>
                <Link href="/app/activity">{x.activity}</Link>
                <Link href="/app/settings">{x.settings}</Link>
              </div>
              <div>
                <p>{x.company}</p>
                <Link href="/app/about">{x.about}</Link>
                <Link href="/app/help">{x.helpCenter}</Link>
              </div>
            </nav>
          </div>
          <div className="pk-footer-bottom">
            <span>© {new Date().getFullYear()} Pico. {x.rights}</span>
            <span>{copy.footer.tagline}</span>
          </div>
        </div>
        <div className="pk-footer-mark" aria-hidden>pico</div>
      </footer>
    </div>
  );
}
