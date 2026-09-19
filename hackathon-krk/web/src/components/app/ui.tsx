"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function PicoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[10px] text-sm font-bold text-white"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #ff4fd8, #8b5cff)",
      }}
      aria-hidden
    >
      P
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
      ? "btn-primary btn-pink"
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

/** Primary CTA — Figma Button / Primary */
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

/** Secondary / outline — Figma Button / Secondary */
export function BtnGhost({
  children,
  className = "",
  disabled,
  onClick,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: BtnSize;
}) {
  return (
    <Btn
      variant="secondary"
      size={size}
      className={className}
      disabled={disabled}
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
      className={`rounded-2xl border border-white/10 bg-[#14101f]/90 p-4 shadow-[0_0_40px_rgba(139,92,255,0.12)] sm:rounded-[20px] sm:p-5 ${className}`}
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
      className="btn-ghost mb-4 !justify-start !px-0 !text-[var(--muted)] hover:!text-white"
    >
      <span aria-hidden>←</span> Back to Dashboard
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
    ok: "bg-[rgba(109,255,176,0.12)] text-[var(--ok)]",
    warn: "bg-[rgba(255,184,0,0.12)] text-[#ffb800]",
    err: "bg-[rgba(255,107,138,0.12)] text-[var(--danger)]",
    info: "bg-[rgba(255,79,216,0.12)] text-[var(--pink)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}
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
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
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
      <div className="rounded-xl border border-white/8 bg-black/25 px-2 py-2.5">
        <p className="text-[var(--muted)]">Cost</p>
        <p className="mt-1 font-semibold">${cost.toFixed(2)}</p>
      </div>
      <div className="rounded-xl border border-white/8 bg-black/25 px-2 py-2.5">
        <p className="text-[var(--muted)]">Available</p>
        <p className="mt-1 font-semibold">
          {available === null ? "—" : `$${available.toFixed(2)}`}
        </p>
      </div>
      <div className="rounded-xl border border-white/8 bg-black/25 px-2 py-2.5">
        <p className="text-[var(--muted)]">{afterLabel}</p>
        <p className="mt-1 font-semibold">
          {after === null ? "—" : `$${after.toFixed(2)}`}
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute left-[-10%] top-[-8%] h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "rgba(255,79,216,0.18)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-12%] top-[20%] h-[26rem] w-[26rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "rgba(139,92,255,0.22)" }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-xl px-4 pb-12 pt-5 sm:max-w-2xl sm:px-5 sm:pt-6">
        {children}
      </div>
    </div>
  );
}

export function BrandLink() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <PicoMark />
      <span className="text-lg font-semibold tracking-tight">pico</span>
    </Link>
  );
}
