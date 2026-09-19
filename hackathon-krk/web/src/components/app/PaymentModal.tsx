"use client";

import { BtnGhost, BtnPink, Panel, StatusPill } from "@/components/app/ui";

type ModalKind = "deposit" | "withdraw" | null;
type ModalPhase = "form" | "pending" | "success" | "error";

const PRESETS = [1, 2, 5] as const;

export function PaymentModal({
  kind,
  phase,
  amount,
  available,
  error,
  loading,
  onAmount,
  onClose,
  onConfirmDeposit,
  onConfirmWithdraw,
  onRetry,
}: {
  kind: ModalKind;
  phase: ModalPhase;
  amount: number;
  available: number | null;
  error: string;
  loading: boolean;
  onAmount: (n: number) => void;
  onClose: () => void;
  onConfirmDeposit: () => void;
  onConfirmWithdraw: () => void;
  onRetry: () => void;
}) {
  if (!kind) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <Panel className="relative z-10 w-full max-w-md !p-5 shadow-[0_0_60px_rgba(139,92,255,0.35)] sm:!p-6">
        {kind === "deposit" ? (
          <DepositBody
            phase={phase}
            amount={amount}
            error={error}
            loading={loading}
            onAmount={onAmount}
            onClose={onClose}
            onConfirm={onConfirmDeposit}
            onRetry={onRetry}
          />
        ) : (
          <WithdrawBody
            phase={phase}
            available={available}
            error={error}
            loading={loading}
            onClose={onClose}
            onConfirm={onConfirmWithdraw}
            onRetry={onRetry}
          />
        )}
      </Panel>
    </div>
  );
}

function DepositBody({
  phase,
  amount,
  error,
  loading,
  onAmount,
  onClose,
  onConfirm,
  onRetry,
}: {
  phase: ModalPhase;
  amount: number;
  error: string;
  loading: boolean;
  onAmount: (n: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  onRetry: () => void;
}) {
  if (phase === "pending") {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[var(--pink)]" />
        <p className="mt-4 text-lg font-semibold">Confirming deposit…</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Waiting for on-chain confirmation.
        </p>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="text-center">
        <StatusPill tone="ok">Budget updated</StatusPill>
        <p className="mt-4 text-lg font-semibold">Funds added to your vault</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          +${amount.toFixed(2)} USDC deposited on Devnet.
        </p>
        <BtnPink className="mt-6 w-full justify-center py-3" onClick={onClose}>
          Back to dashboard
        </BtnPink>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div>
        <div className="rounded-xl border border-[var(--danger)]/30 bg-[rgba(255,107,138,0.1)] px-4 py-3 text-sm text-[var(--danger)]">
          Deposit failed. {error || "Something went wrong."}
        </div>
        <BtnPink className="mt-5 w-full justify-center py-3" onClick={onRetry}>
          Try again
        </BtnPink>
        <button
          type="button"
          className="mt-3 w-full text-sm text-[var(--muted)]"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Add Funds</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Deposit USDC into your spending vault. This is a limit — not full wallet
        access.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onAmount(n)}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              amount === n
                ? "border-[var(--pink)] bg-[var(--pink)]/15 text-white"
                : "border-white/10 bg-black/25 text-[var(--muted)]"
            }`}
          >
            ${n}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <Row label="Amount" value={`$${amount.toFixed(2)} USDC`} />
        <Row label="Network" value="Solana Devnet" />
      </div>
      <BtnPink
        className="mt-5 w-full justify-center"
        disabled={loading}
        loading={loading && phase === "form"}
        onClick={onConfirm}
      >
        Add ${amount.toFixed(0)}
      </BtnPink>
      <button
        type="button"
        className="mt-3 w-full text-sm text-[var(--muted)]"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
}

function WithdrawBody({
  phase,
  available,
  error,
  loading,
  onClose,
  onConfirm,
  onRetry,
}: {
  phase: ModalPhase;
  available: number | null;
  error: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRetry: () => void;
}) {
  const amt = available ?? 0;

  if (phase === "pending") {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[var(--pink)]" />
        <p className="mt-4 text-lg font-semibold">Confirming withdrawal…</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Waiting for on-chain confirmation.
        </p>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="text-center">
        <StatusPill tone="ok">Funds returned</StatusPill>
        <p className="mt-4 text-lg font-semibold">Remaining balance withdrawn</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          USDC sent back to your connected wallet.
        </p>
        <BtnPink className="mt-6 w-full justify-center py-3" onClick={onClose}>
          Back to dashboard
        </BtnPink>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div>
        <div className="rounded-xl border border-[var(--danger)]/30 bg-[rgba(255,107,138,0.1)] px-4 py-3 text-sm text-[var(--danger)]">
          Withdrawal failed. {error || "Something went wrong."}
        </div>
        <BtnPink className="mt-5 w-full justify-center py-3" onClick={onRetry}>
          Try again
        </BtnPink>
        <button
          type="button"
          className="mt-3 w-full text-sm text-[var(--muted)]"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Withdraw remaining balance</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Funds return to your connected wallet. Your spend vault will be empty.
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <Row
          label="Available to withdraw"
          value={`$${amt.toFixed(2)} USDC`}
        />
        <Row label="Network" value="Solana Devnet" />
      </div>
      <BtnPink
        className="mt-5 w-full justify-center py-3.5"
        disabled={loading || amt <= 0}
        onClick={onConfirm}
      >
        Withdraw ${amt.toFixed(2)}
      </BtnPink>
      <BtnGhost className="mt-3 w-full" onClick={onClose}>
        Cancel
      </BtnGhost>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/8 py-2 last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
