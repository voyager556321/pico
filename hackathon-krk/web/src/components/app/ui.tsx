"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function PicoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[12px] text-[#1a120c]"
      style={{
        width: size,
        height: size,
        background: "var(--accent)",
      }}
      aria-hidden
    >
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v18M5 8.5c2.5-3 11.5-3 14 0M5 15.5c2.5 3 11.5 3 14 0"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost";
type BtnSize = "sm" | "md" | "lg";

function btnClass(
  variant: BtnVariant,
  size: BtnSize,
  loading: boolean,
  className: string
) {
  const v =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : "btn-ghost";
  const s = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "btn-md";
  return `${v} ${s} ${loading ? "btn-loading" : ""} ${className}`.trim();
}

export function Btn({
  children,
  className = "",
  disabled,
  loading,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      onClick={onClick}
      className={btnClass(variant, size, Boolean(loading), className)}
    >
      {loading ? <span className="btn-spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}

/** Primary CTA — teal trust */
export function BtnPink({
  children,
  className = "",
  disabled,
  loading,
  onClick,
  type = "button",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  size?: BtnSize;
}) {
  return (
    <Btn
      variant="primary"
      size={size}
      className={className}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      type={type}
    >
      {children}
    </Btn>
  );
}

export function BtnGhost({
  children,
  className = "",
  disabled,
  loading,
  onClick,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  size?: BtnSize;
}) {
  return (
    <Btn
      variant="secondary"
      size={size}
      className={className}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      {children}
    </Btn>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)] sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-ghost mb-4 !justify-start !px-0"
    >
      <span aria-hidden>←</span> Back
    </button>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "err" | "info";
  children: ReactNode;
}) {
  const map = {
    ok: "border border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.1)] text-[#6ee7b7]",
    warn: "border border-[rgba(251,191,36,0.22)] bg-[rgba(251,191,36,0.1)] text-[var(--warn)]",
    err: "border border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.1)] text-[var(--danger)]",
    info: "border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent-ink)]",
  } as const;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  onPaste,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onPaste?: () => void;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="mono min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        />
        <button
          type="button"
          className="btn-ghost !min-h-0 !px-2 !py-1 !text-sm"
          onClick={async () => {
            if (onPaste) {
              onPaste();
              return;
            }
            try {
              const t = await navigator.clipboard.readText();
              if (t) onChange(t.trim());
            } catch {
              /* ignore */
            }
          }}
        >
          Paste
        </button>
      </div>
    </label>
  );
}

export function CostRow({
  cost,
  available,
  afterLabel,
  after,
}: {
  cost: number;
  available: number | null;
  afterLabel: string;
  after: number | null;
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-2 py-2.5">
        <p className="text-[var(--muted)]">Cost</p>
        <p className="mt-1 font-semibold">${cost.toFixed(2)}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-2 py-2.5">
        <p className="text-[var(--muted)]">Available</p>
        <p className="mt-1 font-semibold">
          {available === null ? "—" : `$${available.toFixed(2)}`}
        </p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-2 py-2.5">
        <p className="text-[var(--muted)]">{afterLabel}</p>
        <p className="mt-1 font-semibold">
          {after === null ? "—" : `$${after.toFixed(2)}`}
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--board)]">
      <div
        className={`relative mx-auto w-full px-4 pb-16 pt-0 sm:px-6 ${
          wide ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function BrandLink() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <PicoMark />
      <span className="display text-lg font-bold tracking-tight">pico</span>
    </Link>
  );
}

/** Shared form controls for /app */
export const inputClass =
  "mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--border-strong)]";

export const textareaClass =
  "mt-2 min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--border-strong)]";
