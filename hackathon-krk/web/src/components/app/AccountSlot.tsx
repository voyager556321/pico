"use client";

/** Payment availability indicator for the app header. */
export function useAccountIdentity(fallback: string) {
  return {
    signedIn: false,
    name: fallback,
    initials: fallback.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  };
}

export function AccountSlot({ label }: { label: string }) {
  return (
    <div className="tq-account-slot">
      <span className="tq-pill tq-pill-ghost" role="status">{label}</span>
    </div>
  );
}
