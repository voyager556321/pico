"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";
import { IconCheck, IconAlert, IconInfo } from "@/components/icons";
import { ICONS, type IconName } from "@/components/icons";

// ---------- Pill ----------

export function Pill({
  children,
  tone = "",
  dot = false,
}: {
  children: ReactNode;
  tone?: "" | "accent" | "success" | "warning" | "error" | "rev" | "tech";
  dot?: boolean;
}) {
  return (
    <span className={`pill${tone ? ` ${tone}` : ""}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

// ---------- Button (flow) ----------

type BtnVariant = "p" | "s" | "g" | "d";
type BtnSize = "" | "sm";

export function Pbtn({
  children,
  variant = "p",
  size = "",
  disabled,
  loading,
  onClick,
  type = "button",
  className = "",
  icon,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  icon?: IconName;
}) {
  const Icon = icon ? ICONS[icon] : null;
  return (
    <button
      type={type}
      className={`pbtn ${variant}${size ? ` ${size}` : ""}${className ? ` ${className}` : ""}`}
      disabled={disabled || loading}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {loading ? <span className="spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

// ---------- Card ----------

export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`card${className ? ` ${className}` : ""}`} id={id}>
      {children}
    </section>
  );
}

// ---------- Card header ----------

export function CardHeader({
  icon,
  title,
  right,
  siCls = "",
}: {
  icon?: IconName;
  title: ReactNode;
  right?: ReactNode;
  siCls?: string;
}) {
  const Icon = icon ? ICONS[icon] : null;
  return (
    <div className="ch">
      {Icon && <span className={`si${siCls ? ` ${siCls}` : ""}`}><Icon size={14} /></span>}
      <h2>{title}</h2>
      <span className="sp" />
      {right}
    </div>
  );
}

// ---------- Callout ----------

export function Callout({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: "" | "success" | "error";
}) {
  const Icon = tone === "error" ? IconAlert : tone === "success" ? IconCheck : IconInfo;
  return (
    <div className={`callout${tone ? ` ${tone}` : ""}`}>
      <Icon size={16} />
      <span>{children}</span>
    </div>
  );
}

// ---------- Key-Value rows ----------

export function KvRows({ rows }: { rows: [string, ReactNode, string?][] }) {
  return (
    <div className="kv2">
      {rows.map((r, i) => (
        <div key={i} className={`r${r[2] ? ` ${r[2]}` : ""}`}>
          <span>{r[0]}</span>
          <b>{r[1]}</b>
        </div>
      ))}
    </div>
  );
}

// ---------- Stats ----------

export function Stats({
  items,
  cols,
}: {
  items: [string, string, string?, string?][];
  cols?: number;
}) {
  return (
    <div
      className="stats"
      style={{ gridTemplateColumns: `repeat(${cols || items.length}, 1fr)` }}
    >
      {items.map((x, i) => (
        <div key={i} className="stat">
          <div className="v" style={x[3] ? { color: x[3] } : undefined}>
            {x[0]}
          </div>
          <b>{x[1]}</b>
          {x[2] && <small>{x[2]}</small>}
        </div>
      ))}
    </div>
  );
}

// ---------- Empty state ----------

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

// ---------- Page header ----------

export function PageHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="pgh">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {right && <div className="acts">{right}</div>}
    </div>
  );
}

// ---------- Timeline ----------

export function Timeline({ events }: { events: { title: string; sub: string; time: string; tone?: string }[] }) {
  return (
    <div className="tl">
      {events.map((e, i) => (
        <div key={i} className={`te ${e.tone || ""}`}>
          <span className="td" />
          <div>
            <b>{e.title}</b>
            <small>{e.sub}</small>
          </div>
          <span className="tm">{e.time}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- File list ----------

export function FileList({
  files,
  onOpen,
}: {
  files: [string, string, string][];
  onOpen?: (name: string) => void;
}) {
  return (
    <div className="lst">
      {files.map((f, i) => (
        <div key={i} className="li">
          <span className="ext">{f[0]}</span>
          <div className="tx">
            <b>{f[1]}</b>
            <small>{f[2]}</small>
          </div>
          <Pbtn variant="g" size="sm" onClick={() => onOpen?.(f[2])}>
            Open
          </Pbtn>
        </div>
      ))}
    </div>
  );
}

// ---------- Messages ----------

export function Messages({
  list,
  who,
}: {
  list: ["y" | "w", string, string][];
  who: string;
}) {
  if (!list.length) return <Empty>No messages yet.</Empty>;
  return (
    <div className="msgs">
      {list.map((m, i) => (
        <div key={i} className={`msg${m[0] === "y" ? " you" : ""}`}>
          <small>{m[0] === "y" ? "You" : who} · {m[1]}</small>
          {m[2]}
        </div>
      ))}
    </div>
  );
}

// ---------- Toast ----------

import { createContext, useCallback, useContext, useState, useEffect } from "react";

type ToastTone = "info" | "success" | "error";
interface ToastState {
  show: (msg: string, tone?: ToastTone) => void;
}
const ToastCtx = createContext<ToastState>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; tone: ToastTone } | null>(null);
  const show = useCallback((msg: string, tone: ToastTone = "info") => {
    setToast({ msg, tone });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);
  const Icon = toast?.tone === "success" ? IconCheck : toast?.tone === "error" ? IconAlert : IconInfo;
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {toast && (
        <div className={`toast ${toast.tone}`} role="status" aria-live="polite">
          <Icon size={16} />
          <span>{toast.msg}</span>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

// ---------- Progress Rail ----------

export function ProgressRail({
  steps,
}: {
  steps: [string, string, string][];
}) {
  return (
    <div className="rail" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
      {steps.map((s, i) => (
        <div key={i} className={`rs ${s[2]}${i === 0 ? " first" : ""}`}>
          <div className="ln">
            <span className="d" />
            {i < steps.length - 1 && <span className="rbar" />}
          </div>
          <div>
            <b>{s[0]}</b>
            <small>{s[1]}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Stepper ----------

export function Stepper({
  steps,
  current,
}: {
  steps: [string, string][];
  current: number;
}) {
  return (
    <div className="steps">
      {steps.map(([l, c], i) => {
        const st = i < current ? "done" : i === current ? "cur" : "todo";
        return (
          <div key={i} style={{ display: "contents" }}>
            {i > 0 && <span className="cn" />}
            <button type="button" className={`stp ${st}`} tabIndex={-1}>
              <span className="n">
                {st === "done" ? <IconCheck size={14} /> : i + 1}
              </span>
              <span>
                <b>{l}</b>
                <small>{c}</small>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Toggle ----------

export function Toggle({
  on,
  onChange,
  label,
  disabled,
}: {
  on: boolean;
  onChange?: (on: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="xtgl"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
    />
  );
}

// ---------- Chip ----------

export function Chip({
  label,
  on,
  onClick,
  disabled,
}: {
  label: string;
  on?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="xchip"
      aria-pressed={on ?? false}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ---------- Tabs ----------

export function Tabs({
  items,
  selected,
  onSelect,
}: {
  items: { key: string; label: string; count?: number | string; isNew?: boolean }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="xtabs" role="tablist">
      {items.map((t) => (
        <button
          key={t.key}
          type="button"
          className="xtab"
          role="tab"
          aria-selected={t.key === selected}
          onClick={() => onSelect(t.key)}
        >
          {t.label}
          {t.count != null && t.count !== "" && (
            <span className={`cnt${t.isNew ? " new" : ""}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------- Field ----------

export function Field({
  label,
  optional,
  error,
  ok,
  help,
  children,
}: {
  label?: string;
  optional?: boolean;
  error?: string;
  ok?: boolean;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="fg">
      {label && (
        <label className="mlabel">
          {label}
          {optional && <span className="optl">Optional</span>}
        </label>
      )}
      <div
        className={`mfield${error ? " error" : ""}${ok ? " ok" : ""}`}
      >
        {children}
        {error && <span className="badge-err"><IconAlert size={14} /></span>}
        {ok && !error && <span className="badge-ok"><IconCheck size={14} /></span>}
      </div>
      {(error || help) && (
        <div className={`mhelp${error ? " error" : ok ? " ok" : ""}`}>
          {error || help}
        </div>
      )}
    </div>
  );
}

// ---------- Modal ----------

export function Modal({
  title,
  sub,
  children,
  onClose,
  wide,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? " wide" : ""}`} role="dialog" aria-modal="true">
        <div>
          <h2>{title}</h2>
          {sub && <p className="sub">{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}