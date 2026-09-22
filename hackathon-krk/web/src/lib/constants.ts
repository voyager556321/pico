import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j"
);

/** Circle USDC on Solana Devnet */
export const USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const TREASURY_ATA = new PublicKey(
  "J7vNqKbJTitt4C3ec1EQaddSQer1Tf9V4NwRRUoAmQgq"
);

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";

export const USDC_DECIMALS = 6;
export const MAX_SLOTS = 4;
export const BPS_DENOM = 10_000;

/** skill_id = matching only (not budget envelopes) */
export const SKILLS = [
  { id: 1, label: "Code review" },
  { id: 2, label: "Debugging" },
  { id: 3, label: "QA" },
  { id: 4, label: "Design" },
  { id: 5, label: "Build" },
] as const;

export type SkillId = (typeof SKILLS)[number]["id"];

export const TASK_STATUS = [
  "Qualifying",
  "Working",
  "InReview",
  "HiringSlot",
  "Submitted",
  "Paid",
  "Disputed",
  "Cancelled",
] as const;

export type TaskStatusName = (typeof TASK_STATUS)[number];

export const SLOT_NAMES = [
  "Execution",
  "Primary Verification",
  "Audit Verification",
  "Audit Verification 2",
] as const;

export function slotLabel(index: number, slotCount: number): string {
  if (index === 0) return "Execution Slot";
  if (index === 1) return "Primary Verification Slot";
  if (index === slotCount - 1) return "Audit Verification Slot → client";
  return `Audit Verification Slot ${index}`;
}

export function skillLabel(id: number): string {
  return SKILLS.find((s) => s.id === id)?.label ?? `Skill #${id}`;
}

export function usdcToBaseUnits(amountUsd: number): number {
  return Math.round(amountUsd * 10 ** USDC_DECIMALS);
}

export function baseUnitsToUsdc(amount: number | bigint): number {
  return Number(amount) / 10 ** USDC_DECIMALS;
}

export function shortPk(pk: string, n = 4): string {
  if (pk.length < n * 2 + 3) return pk;
  return `${pk.slice(0, n)}…${pk.slice(-n)}`;
}

/** Default bps for N verification seats (Execution + N). Must sum 10000. */
export function defaultSlotBps(reviewCount: number): number[] {
  const slotCount = reviewCount + 1;
  const out = [0, 0, 0, 0];
  if (slotCount === 2) {
    out[0] = 8000;
    out[1] = 2000;
  } else if (slotCount === 3) {
    out[0] = 7000;
    out[1] = 2000;
    out[2] = 1000;
  } else {
    out[0] = 6000;
    out[1] = 2000;
    out[2] = 1000;
    out[3] = 1000;
  }
  return out;
}
