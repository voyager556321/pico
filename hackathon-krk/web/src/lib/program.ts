import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "@/idl/pico.json";
import {
  MAX_SLOTS,
  PROGRAM_ID,
  TASK_STATUS,
  TaskStatusName,
  USDC_MINT,
} from "./constants";
import { credentialPda, taskPda } from "./pdas";
import { ZERO } from "./offchain";
import type { ConfigAccount, TaskAccount } from "./accounts";

export type PicoIdl = Idl;
export type { ConfigAccount, TaskAccount } from "./accounts";

export {
  META_PREFIX,
  QUALIFY_PREFIX,
  ZERO,
  exportTaskPack,
  importTaskPack,
  isDefaultPk,
  loadQualifyBoard,
  loadTaskMeta,
  podiumFromBoard,
  saveQualifyBoard,
  saveTaskMeta,
  upsertQualifyEntry,
} from "./offchain";
export type {
  QualifyBoard,
  QualifyEntry,
  TaskMeta,
  TaskPack,
} from "./offchain";

export function getPicoProgram(
  connection: Connection,
  wallet: anchor.Wallet
): Program {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program(idl as Idl, PROGRAM_ID, provider);
}

/** Read-only program (no signing) for listing tasks on landing / board. */
export function getReadonlyProgram(connection: Connection): Program {
  const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async <T>(tx: T) => tx,
    signAllTransactions: async <T>(txs: T[]) => txs,
  };
  return getPicoProgram(connection, wallet as never);
}

function parseStatus(raw: unknown): TaskStatusName {
  if (typeof raw === "string" && TASK_STATUS.includes(raw as TaskStatusName)) {
    return raw as TaskStatusName;
  }
  if (raw && typeof raw === "object") {
    const key = Object.keys(raw as object)[0];
    const mapped = TASK_STATUS.find(
      (s) => s.toLowerCase() === key?.toLowerCase()
    );
    if (mapped) return mapped;
  }
  return "Qualifying";
}

function asPk(v: unknown): PublicKey {
  if (v instanceof PublicKey) return v;
  if (typeof v === "string") return new PublicKey(v);
  return ZERO;
}

function asNumArr(v: unknown, len: number): number[] {
  if (Array.isArray(v)) return v.map((x) => Number(x));
  return Array(len).fill(0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTask(publicKey: PublicKey, a: any): TaskAccount {
  const holdersRaw = a.slotHolders ?? [];
  const holders: PublicKey[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    holders.push(asPk(holdersRaw[i]));
  }
  const workRaw = a.workHashes ?? [];
  const workHashes: number[][] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    workHashes.push(
      Array.isArray(workRaw[i]) ? Array.from(workRaw[i]) : Array(32).fill(0)
    );
  }
  return {
    publicKey,
    client: asPk(a.client),
    skillId: Number(a.skillId),
    taskNonce: a.taskNonce instanceof BN ? a.taskNonce : new BN(a.taskNonce),
    reward: a.reward instanceof BN ? a.reward : new BN(a.reward),
    deadline: a.deadline instanceof BN ? a.deadline : new BN(a.deadline),
    status: parseStatus(a.status),
    reviewCount: Number(a.reviewCount ?? 1),
    slotCount: Number(a.slotCount ?? 2),
    slotBps: asNumArr(a.slotBps, MAX_SLOTS),
    slotHolders: holders,
    slotTimesMs: asNumArr(a.slotTimesMs, MAX_SLOTS),
    workHashes,
    explanationHash: Array.from(a.explanationHash ?? Array(32).fill(0)),
    activeSlot: Number(a.activeSlot ?? 0),
    hiringSlot: Number(a.hiringSlot ?? 0),
    vault: asPk(a.vault),
    bump: Number(a.bump),
    vaultBump: Number(a.vaultBump),
  };
}

export async function fetchConfig(
  program: Program
): Promise<ConfigAccount | null> {
  const { configPda } = await import("./pdas");
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = await (program.account as any).config.fetch(configPda());
    return {
      authority: a.authority,
      operator: a.operator,
      mint: a.mint,
      treasury: a.treasury,
      feeBps: a.feeBps,
      bump: a.bump,
    };
  } catch {
    return null;
  }
}

export async function fetchCredential(
  program: Program,
  worker: PublicKey,
  skillId: number
): Promise<{ worker: PublicKey; skillId: number; level: number } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = await (program.account as any).skillCredential.fetch(
      credentialPda(worker, skillId)
    );
    return { worker: a.worker, skillId: a.skillId, level: a.level };
  } catch {
    return null;
  }
}

export async function fetchTaskByKey(
  program: Program,
  taskKey: PublicKey
): Promise<TaskAccount | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = await (program.account as any).task.fetch(taskKey);
    return mapTask(taskKey, a);
  } catch {
    return null;
  }
}

export async function fetchTask(
  program: Program,
  client: PublicKey,
  taskNonce: number
): Promise<TaskAccount | null> {
  return fetchTaskByKey(program, taskPda(client, taskNonce));
}

export async function fetchAllTasks(program: Program): Promise<TaskAccount[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (program.account as any).task.all();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => mapTask(r.publicKey, r.account));
}

export async function sha256Bytes(text: string): Promise<number[]> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash));
}

export { USDC_MINT };
