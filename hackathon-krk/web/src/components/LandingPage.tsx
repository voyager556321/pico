"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { LandingSections } from "@/components/LandingSections";

export function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState<LandingLanguage>("en");
  const [mode, setMode] = useState<HeroMode>("hire");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const queryRef = useRef<HTMLInputElement>(null);
  const copy = LANDING_COPY[language];
  const hero = HERO_COPY[language];
  const heroMode = hero.modes[mode];

  function submitHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    if (mode === "hire") {
      router.push(text ? `/app/tasks/new?brief=${encodeURIComponent(text)}` : "/app/tasks/new");
    } else {
      router.push("/app");
    }
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
            <Link href="/" className="ph-logo" aria-label="Pico">pico</Link>

            <nav className="ph-nav" aria-label="Main">
              <a href="#flow">{copy.nav.how}</a>
              <a href="#clients">{copy.nav.clients}</a>
              <Link href="/app">{copy.nav.findWork}</Link>
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
              <Link href="/app" className="ph-signin">{copy.nav.signIn}</Link>
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
              <Link href="/app" onClick={() => setNavOpen(false)}>{copy.nav.findWork}</Link>
              <Link href="/app" onClick={() => setNavOpen(false)}>{copy.nav.signIn}</Link>
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
                  setMode(item);
                  setQuery("");
                }}
              >
                {item === "hire" ? hero.hire : hero.work}
              </button>
            ))}
          </div>

          <h1 id="ph-title" className="ph-title" key={`title-${mode}`}>
            {heroMode.headline[0]}<span>{heroMode.headline[1]}</span>{heroMode.headline[2]}
          </h1>
          <p className="ph-subtitle" key={`sub-${mode}`}>{heroMode.subtitle}</p>

          <form className="ph-search" onSubmit={submitHero}>
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
            <button type="submit" className="ph-cta">
              {heroMode.cta}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

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
        </div>

        <div className="ph-backdrop" aria-hidden><span>TASKS</span></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ph-arrow" src="/landing/hero-arrow.webp" alt="" aria-hidden width={920} height={714} />
      </section>

      <LandingSections language={language} />
    </div>
  );
}
