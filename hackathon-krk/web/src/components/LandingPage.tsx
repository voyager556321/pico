"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  APP_LANGUAGE_STORAGE_KEY,
  isLandingLanguage,
} from "@/components/app/AppLanguage";
import {
  HERO_COPY,
  LANDING_COPY,
  LANDING_LANGUAGES,
  type HeroMode,
  type LandingLanguage,
} from "@/components/landingTranslations";
import { EMAIL_RE, LandingSections, WaitlistModal, postWaitlist, type WaitlistModalState } from "@/components/LandingSections";
import { WAITLIST_COPY } from "@/components/landingSectionsCopy";
import { track } from "@/lib/analytics";

/* Big background word under the hero, translated per language. */
const BACKDROP_WORD: Record<LandingLanguage, string> = {
  en: "TASKS",
  es: "TAREAS",
  pl: "ZADANIA",
  de: "AUFGABEN",
  uk: "ЗАВДАННЯ",
};

/* Renders the word as SVG whose viewBox is the word's tight glyph box,
   so it always fits its area whole, whatever the language. The box is
   measured with canvas once the font is loaded. */
function HeroBackdrop({ word }: { word: string }) {
  const [box, setBox] = useState("-16 -750 3080 766");
  useEffect(() => {
    let cancelled = false;
    const font = '800 1000px "Inter Tight"';
    const measure = () => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || cancelled) return;
      ctx.font = font;
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "-35px";
      const m = ctx.measureText(word);
      const left = -Math.max(0, m.actualBoundingBoxLeft);
      const top = -Math.ceil(m.actualBoundingBoxAscent);
      const width = Math.ceil(m.actualBoundingBoxRight - left);
      const height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
      if (width > 0 && height > 0) setBox(`${Math.floor(left)} ${top} ${width} ${height}`);
    };
    if (document.fonts?.load) {
      document.fonts.load(font, word).then(measure, measure);
    } else {
      measure();
    }
    return () => {
      cancelled = true;
    };
  }, [word]);
  return (
    <div className="ph-backdrop" aria-hidden>
      <svg viewBox={box} preserveAspectRatio="xMinYMax meet">
        <text x="0" y="0">{word}</text>
      </svg>
    </div>
  );
}

export function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState<LandingLanguage>("en");
  const [mode, setMode] = useState<HeroMode>("hire");
  const [query, setQuery] = useState("");
  const queryRef = useRef<HTMLInputElement>(null);
  const copy = LANDING_COPY[language];
  const hero = HERO_COPY[language];
  const heroMode = hero.modes[mode];
  const w = WAITLIST_COPY[language];
  /* Hero waitlist, two steps in the same bar — the visitor never leaves the
     first screen and never retypes anything:
     1. "ask"   — what do you need / what can you do (optional) → Join the waitlist
     2. "email" — the answer stays as a chip, the bar asks for the email
     3. result  — success / already on the list / error, shown in place */
  const [step, setStep] = useState<"ask" | "email">("ask");
  const [email, setEmail] = useState("");
  const [heroErrors, setHeroErrors] = useState<{ email?: boolean }>({});
  const [heroStatus, setHeroStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [modal, setModal] = useState<WaitlistModalState>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  async function submitHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "ask") {
      track("cta_clicked", { location: "hero", role: mode === "hire" ? "client" : "specialist", language });
      setStep("email");
      setHeroStatus("idle");
      window.setTimeout(() => emailRef.current?.focus(), 30);
      return;
    }
    const errors = { email: !EMAIL_RE.test(email.trim()) };
    setHeroErrors(errors);
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    setHeroStatus("submitting");
    const role = mode === "hire" ? "client" : "worker";
    const result = await postWaitlist({ email: email.trim(), role, interest: query.trim(), language, source: "hero" });
    if (result === "error") {
      setHeroStatus("error");
      return;
    }
    // Success or already on the list → popup, and the hero goes back to its first step.
    setModal({ result, email: email.trim(), role });
    setHeroStatus("idle");
    setStep("ask");
    setQuery("");
    setEmail("");
  }

  function editAnswer() {
    setStep("ask");
    setHeroStatus("idle");
    setHeroErrors({});
    window.setTimeout(() => queryRef.current?.focus(), 30);
  }

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
      track("language_changed", { language: selectedLanguage.code, from: language });
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
      <section className="ph-hero" aria-labelledby="ph-title">
        <header className="ph-header">
          <div className="ph-header-row">
            <Link href="/" className="ph-logo" aria-label="Task.quo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/taskquo-lockup-color.svg" alt="Task.quo" width={123} height={32} />
            </Link>

            <nav className="ph-nav" aria-label="Main">
              <a href="#flow">{copy.nav.how}</a>
              <a href="#clients">{copy.nav.clients}</a>
              <a href="#faq">{w.navFaq}</a>
            </nav>

            <div className="ph-header-actions">
              <label className="ph-language">
                <span className="sr-only">{copy.languageLabel}</span>
                <select
                  value={language}
                  onChange={(event) => changeLanguage(event.currentTarget.value)}
                  aria-label={copy.languageLabel}
                >
                  {LANDING_LANGUAGES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <a href="#waitlist" className="ph-signin" onClick={() => track("cta_clicked", { location: "header", language })}>{w.navJoin}</a>
              <button
                type="button"
                className="ph-menu-button"
                aria-expanded={navOpen}
                aria-label={navOpen ? copy.nav.closeMenu : copy.nav.openMenu}
                onClick={() => setNavOpen((v) => !v)}
              >
                <span aria-hidden>{navOpen ? "×" : "☰"}</span>
              </button>
            </div>
          </div>
          {navOpen ? (
            <div className="ph-mobile-nav">
              <a href="#flow" onClick={() => setNavOpen(false)}>{copy.nav.how}</a>
              <a href="#clients" onClick={() => setNavOpen(false)}>{copy.nav.clients}</a>
              <a href="#faq" onClick={() => setNavOpen(false)}>{w.navFaq}</a>
              <a href="#waitlist" onClick={() => { setNavOpen(false); track("cta_clicked", { location: "mobile_nav", language }); }}>{w.navJoin}</a>
            </div>
          ) : null}
        </header>

        <div className="ph-content">
          <div className="ph-mode" role="tablist" aria-label={hero.modeLabel}>
            {(["hire", "work"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                className={mode === item ? "is-active" : undefined}
                onClick={() => {
                  if (item !== mode) track("waitlist_role_selected", { role: item === "hire" ? "client" : "specialist", location: "hero", language });
                  setMode(item);
                  if (step === "ask") setQuery("");
                }}
              >
                {item === "hire" ? hero.hire : hero.work}
              </button>
            ))}
          </div>

          <h1 id="ph-title" className="ph-title" key={`title-${mode}`}>
            {heroMode.headline[0]}<span>{heroMode.headline[1]}</span>{heroMode.headline[2]}
          </h1>
          <p className={`ph-subtitle${step === "email" ? " is-step" : ""}`} key={`sub-${mode}-${step}`}>
            {step === "email" ? w.emailStep : heroMode.subtitle}
          </p>

          <>
              <form className={`ph-search${step === "email" ? " is-email" : ""}`} onSubmit={submitHero} noValidate>
                {step === "ask" ? (
                  <>
                    <svg className="ph-search-icon" width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                      <circle cx="10.5" cy="10.5" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.7" />
                      <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                    <label htmlFor="ph-query" className="sr-only">{heroMode.inputLabel}</label>
                    <input
                      ref={queryRef}
                      id="ph-query"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={heroMode.placeholder}
                      autoComplete="off"
                    />
                  </>
                ) : (
                  <>
                    {query.trim() ? (
                      <button type="button" className="ph-answer" onClick={editAnswer} aria-label={`${w.editAnswer}: ${query.trim()}`}>
                        <span>{query.trim()}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="m14.5 5.5 4 4L9 19H5v-4l9.5-9.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                      </button>
                    ) : null}
                    {query.trim() ? <span className="ph-divider" aria-hidden /> : null}
                    <svg className="ph-search-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                      <path d="M4 6h16v12H4zM4.5 6.5l7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                    <label htmlFor="ph-email" className="sr-only">{w.email}</label>
                    <input
                      ref={emailRef}
                      id="ph-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      placeholder={w.emailPlaceholder}
                      aria-invalid={heroErrors.email || undefined}
                      disabled={heroStatus === "submitting"}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (heroErrors.email) setHeroErrors((current) => ({ ...current, email: false }));
                      }}
                    />
                  </>
                )}
                <button type="submit" className="ph-cta" disabled={heroStatus === "submitting"}>
                  {heroStatus === "submitting" ? <span className="ph-spinner" aria-hidden /> : null}
                  {heroStatus === "submitting" ? w.submitting : w.heroCta}
                  {heroStatus === "submitting" ? null : (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                      <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>

              {step === "ask" ? (
                <div className="ph-popular">
                  <span className="ph-popular-label">{hero.popular}</span>
                  {heroMode.suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={query === item ? "is-picked" : undefined}
                      onClick={() => {
                        setQuery(item);
                        queryRef.current?.focus();
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="ph-step2">
                  <p className="ph-note">{w.consentNote}</p>
                  {heroErrors.email ? <p className="ph-msg is-error" role="alert">{w.errEmail}</p> : null}
                  {heroStatus === "error" ? <p className="ph-msg is-error" role="alert">{w.errServer}</p> : null}
                </div>
              )}
          </>
        </div>

        <HeroBackdrop word={BACKDROP_WORD[language]} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ph-arrow" src="/landing/hero-arrow.webp" alt="" aria-hidden width={920} height={714} />
      </section>

      <LandingSections language={language} />
      <WaitlistModal state={modal} language={language} onClose={() => setModal(null)} />
    </div>
  );
}
