"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  APP_LANGUAGE_STORAGE_KEY,
  isLandingLanguage,
} from "@/components/app/AppLanguage";
import {
  LANDING_COPY,
  LANDING_LANGUAGES,
  type LandingLanguage,
} from "@/components/landingTranslations";

export function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState<LandingLanguage>("en");
  const copy = LANDING_COPY[language];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
      if (isLandingLanguage(stored)) setLanguage(stored);
    } catch {
      return;
    }
  }, []);

  function changeLanguage(value: string) {
    const selectedLanguage = LANDING_LANGUAGES.find(
      (item) => item.code === value,
    );
    if (selectedLanguage) {
      setLanguage(selectedLanguage.code);
      try {
        window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, selectedLanguage.code);
      } catch {
        return;
      }
    }
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
              <Link href="/app" className="nav-link">{copy.nav.findWork}</Link>
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
                <div><span>01</span><b>{copy.preview.execution}</b><small>{copy.preview.submitted}</small></div>
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

      <section className="landing-urgent-section px-4 py-16 sm:px-6 sm:py-20">
        <div className="landing-urgent-card mx-auto grid max-w-6xl items-center gap-10 overflow-hidden">
          <div className="landing-urgent-copy">
            <p className="landing-urgent-eyebrow"><span />{copy.urgent.eyebrow}</p>
            <h2>{copy.urgent.title}</h2>
            <p className="landing-urgent-description">{copy.urgent.description}</p>
            <ul className="landing-urgent-benefits">
              {copy.urgent.benefits.map((benefit) => (
                <li key={benefit}><span aria-hidden>✓</span>{benefit}</li>
              ))}
            </ul>
            <div className="landing-urgent-actions">
              <Link href="/app/tasks/new" className="landing-urgent-cta">
                {copy.urgent.cta}<span aria-hidden>→</span>
              </Link>
              <span className="landing-urgent-note">{copy.urgent.note}</span>
            </div>
          </div>

          <div className="landing-urgent-visual" aria-label={copy.urgent.visualLabel}>
            <div className="landing-urgent-visual-top">
              <span>{copy.urgent.briefLabel}</span>
              <span className="landing-urgent-live"><i />{copy.urgent.status}</span>
            </div>
            <p className="landing-urgent-visual-title">{copy.urgent.briefTitle}</p>
            <p className="landing-urgent-visual-subtitle">{copy.urgent.briefSubtitle}</p>
            <div className="landing-urgent-task">
              <span>01</span><p>{copy.urgent.taskOne}</p><b>{copy.urgent.skillOne}</b>
            </div>
            <div className="landing-urgent-task">
              <span>02</span><p>{copy.urgent.taskTwo}</p><b>{copy.urgent.skillTwo}</b>
            </div>
            <div className="landing-urgent-match">
              <span className="landing-urgent-avatar" aria-hidden>✓</span>
              <span><b>{copy.urgent.verifiedLabel}</b><small>{copy.urgent.verifiedDescription}</small></span>
              <span className="landing-urgent-arrow" aria-hidden>↗</span>
            </div>
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
          </div>
        </div>
        <div className="landing-footer-note px-4 py-4 text-center text-xs">
          Pico · {copy.footer.tagline}
        </div>
      </footer>
    </div>
  );
}
