"use client";

/**
 * Account/payment slot for the app header.
 * All wallet-specific UI lives here, so the rest of the shell stays
 * provider-agnostic. Swap this file for email / Sign in with X later.
 */
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortPk } from "@/lib/constants";

export function useAccountIdentity(fallback: string) {
  const { publicKey } = useWallet();
  const id = publicKey?.toBase58();
  return {
    signedIn: Boolean(id),
    name: id ? shortPk(id, 4) : fallback,
    initials: id ? id.slice(0, 2).toUpperCase() : fallback.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  };
}

export function AccountSlot({ label }: { label: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <button className="tq-pill tq-pill-ghost" type="button" disabled>{label}</button>;
  return <div className="tq-account-slot"><WalletMultiButton>{label}</WalletMultiButton></div>;
}
