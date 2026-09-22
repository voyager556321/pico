import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { TaskStatusName } from "./constants";

export type TaskAccount = {
  publicKey: PublicKey;
  client: PublicKey;
  skillId: number;
  taskNonce: BN;
  reward: BN;
  deadline: BN;
  status: TaskStatusName;
  reviewCount: number;
  slotCount: number;
  slotBps: number[];
  slotHolders: PublicKey[];
  slotTimesMs: number[];
  workHashes: number[][];
  explanationHash: number[];
  activeSlot: number;
  hiringSlot: number;
  vault: PublicKey;
  bump: number;
  vaultBump: number;
};

export type ConfigAccount = {
  authority: PublicKey;
  operator: PublicKey;
  mint: PublicKey;
  treasury: PublicKey;
  feeBps: number;
  bump: number;
};
