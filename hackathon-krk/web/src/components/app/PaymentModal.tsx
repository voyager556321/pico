"use client";

import { Panel } from "@/components/app/ui";

type ModalKind = "deposit" | "withdraw" | null;

export function PaymentModal({
  kind,
  onClose,
}: {
  kind: ModalKind;
  onClose: () => void;
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
      <Panel className="relative z-10 w-full max-w-md !p-5 sm:!p-6">
        <h2 className="text-xl font-semibold">Payments unavailable</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Fiat payments are being integrated. Deposits and withdrawals are disabled.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-full border border-white/10 px-4 py-3 text-sm text-[var(--muted)]"
          onClick={onClose}
        >
          Close
        </button>
      </Panel>
    </div>
  );
}
