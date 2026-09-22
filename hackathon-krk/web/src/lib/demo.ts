import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  MAX_SLOTS,
  defaultSlotBps,
  usdcToBaseUnits,
} from "./constants";
import type { TaskStatusName } from "./constants";
import type { TaskAccount } from "./accounts";
import {
  type QualifyEntry,
  type TaskMeta,
  ZERO,
  loadQualifyBoard,
  saveTaskMeta,
  upsertQualifyEntry,
} from "./offchain";

export const DEMO_STORAGE_KEY = "pico:demo:tasks";
export const DEMO_FLAG_KEY = "pico:demo";

/** Stable demo addresses (not real wallets). */
export const DEMO_TASK_PK = demoPk("pico-demo-task-v1");
export const DEMO_CLIENT_PK = demoPk("pico-demo-client-v1");
export const DEMO_WORKER_PK = demoPk("pico-demo-worker-v1");
export const DEMO_VERIFIER_PKS = [
  demoPk("pico-demo-verify-v1"),
  demoPk("pico-demo-verify-v2"),
] as const;

function demoPk(label: string): PublicKey {
  const buf = new Uint8Array(32);
  const enc = new TextEncoder().encode(label);
  buf.set(enc.slice(0, 32));
  return new PublicKey(buf);
}

export function isDemoEnabled(): boolean {
  if (typeof window !== "undefined") {
    try {
      const v = localStorage.getItem(DEMO_FLAG_KEY);
      if (v === "0") return false;
      if (v === "1") return true;
    } catch {
      /* ignore */
    }
  }
  return process.env.NEXT_PUBLIC_DEMO !== "0";
}

export function setDemoEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_FLAG_KEY, on ? "1" : "0");
}

export function isDemoTask(pk: PublicKey | string): boolean {
  const s = typeof pk === "string" ? pk : pk.toBase58();
  return s === DEMO_TASK_PK.toBase58() || s.startsWith("Demo");
}

type DemoTaskJson = {
  publicKey: string;
  client: string;
  skillId: number;
  taskNonce: string;
  reward: string;
  deadline: string;
  status: TaskStatusName;
  reviewCount: number;
  slotCount: number;
  slotBps: number[];
  slotHolders: string[];
  slotTimesMs: number[];
  workHashes: number[][];
  explanationHash: number[];
  activeSlot: number;
  hiringSlot: number;
  vault: string;
  bump: number;
  vaultBump: number;
  demo: true;
};

function toJson(t: TaskAccount): DemoTaskJson {
  return {
    publicKey: t.publicKey.toBase58(),
    client: t.client.toBase58(),
    skillId: t.skillId,
    taskNonce: t.taskNonce.toString(),
    reward: t.reward.toString(),
    deadline: t.deadline.toString(),
    status: t.status,
    reviewCount: t.reviewCount,
    slotCount: t.slotCount,
    slotBps: t.slotBps,
    slotHolders: t.slotHolders.map((p) => p.toBase58()),
    slotTimesMs: t.slotTimesMs,
    workHashes: t.workHashes,
    explanationHash: t.explanationHash,
    activeSlot: t.activeSlot,
    hiringSlot: t.hiringSlot,
    vault: t.vault.toBase58(),
    bump: t.bump,
    vaultBump: t.vaultBump,
    demo: true,
  };
}

function fromJson(j: DemoTaskJson): TaskAccount {
  const holders: PublicKey[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    holders.push(
      j.slotHolders[i] ? new PublicKey(j.slotHolders[i]) : ZERO
    );
  }
  const workHashes: number[][] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    workHashes.push(j.workHashes?.[i] ?? Array(32).fill(0));
  }
  return {
    publicKey: new PublicKey(j.publicKey),
    client: new PublicKey(j.client),
    skillId: j.skillId,
    taskNonce: new BN(j.taskNonce),
    reward: new BN(j.reward),
    deadline: new BN(j.deadline),
    status: j.status,
    reviewCount: j.reviewCount,
    slotCount: j.slotCount,
    slotBps: j.slotBps ?? Array(MAX_SLOTS).fill(0),
    slotHolders: holders,
    slotTimesMs: j.slotTimesMs ?? Array(MAX_SLOTS).fill(0),
    workHashes,
    explanationHash: j.explanationHash ?? Array(32).fill(0),
    activeSlot: j.activeSlot ?? 0,
    hiringSlot: j.hiringSlot ?? 0,
    vault: new PublicKey(j.vault),
    bump: j.bump ?? 0,
    vaultBump: j.vaultBump ?? 0,
  };
}

function loadRaw(): DemoTaskJson[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DemoTaskJson[];
  } catch {
    return [];
  }
}

function saveRaw(rows: DemoTaskJson[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(rows));
}

export function loadDemoTasks(): TaskAccount[] {
  if (!isDemoEnabled()) return [];
  return loadRaw().map(fromJson);
}

export function getDemoTask(taskId: string): TaskAccount | null {
  if (!isDemoEnabled()) return null;
  const row = loadRaw().find((t) => t.publicKey === taskId);
  return row ? fromJson(row) : null;
}

export function upsertDemoTask(task: TaskAccount) {
  const rows = loadRaw().filter(
    (t) => t.publicKey !== task.publicKey.toBase58()
  );
  rows.unshift(toJson(task));
  saveRaw(rows);
}

export function clearDemoTasks() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_STORAGE_KEY);
}

/** Merge on-chain + demo; demo wins for same pubkey. */
export function mergeWithDemo(onChain: TaskAccount[]): TaskAccount[] {
  if (!isDemoEnabled()) return onChain;
  const demo = loadDemoTasks();
  const demoKeys = new Set(demo.map((t) => t.publicKey.toBase58()));
  const rest = onChain.filter((t) => !demoKeys.has(t.publicKey.toBase58()));
  return [...demo, ...rest];
}

const DEFAULT_BRIEF =
  "Demo: review PDA seed collisions on the escrow vault before assign_team. Deliver short findings + patch sketch.";

/** 1) Stub: created Qualifying task */
export function seedDemoTask(opts?: {
  client?: PublicKey | null;
  reviewCount?: number;
}): TaskAccount {
  const reviewCount = opts?.reviewCount ?? 2;
  const slotCount = reviewCount + 1;
  const bps = defaultSlotBps(reviewCount);
  const client = opts?.client ?? DEMO_CLIENT_PK;
  const now = Math.floor(Date.now() / 1000);
  const vault = demoPk("pico-demo-vault-v1");

  const task: TaskAccount = {
    publicKey: DEMO_TASK_PK,
    client,
    skillId: 1,
    taskNonce: new BN(Date.now()),
    reward: new BN(usdcToBaseUnits(85)),
    deadline: new BN(now + 3 * 86400),
    status: "Qualifying",
    reviewCount,
    slotCount,
    slotBps: bps,
    slotHolders: Array(MAX_SLOTS).fill(ZERO),
    slotTimesMs: Array(MAX_SLOTS).fill(0),
    workHashes: Array.from({ length: MAX_SLOTS }, () => Array(32).fill(0)),
    explanationHash: Array(32).fill(0),
    activeSlot: 0,
    hiringSlot: 0,
    vault,
    bump: 255,
    vaultBump: 255,
  };

  upsertDemoTask(task);
  saveTaskMeta(DEMO_TASK_PK.toBase58(), {
    brief: DEFAULT_BRIEF,
  } satisfies TaskMeta);

  // reset qualify board for fresh seed
  if (typeof window !== "undefined") {
    localStorage.removeItem(`pico:qualify:${DEMO_TASK_PK.toBase58()}`);
  }

  return task;
}

/** 2) Stub: worker passed all 3 timed tests */
export function simulateWorkerPassed(
  taskKey: string,
  wallet: PublicKey | string,
  timesMs: [number, number, number] = [4200, 3800, 2100]
): QualifyEntry {
  const entry: QualifyEntry = {
    wallet: typeof wallet === "string" ? wallet : wallet.toBase58(),
    timesMs,
    passedRound: 3,
    finishedAt: Date.now(),
  };
  upsertQualifyEntry(taskKey, entry);
  return entry;
}

/** Ensure enough finishers for N+1 seats (demo verifiers fill gaps). */
function ensurePodium(
  taskKey: string,
  slotCount: number,
  executionWallet: string
): { holders: PublicKey[]; timesMs: number[] } {
  const board = loadQualifyBoard(taskKey);
  let finishers = board.entries
    .filter((e) => e.passedRound >= 3)
    .sort((a, b) => a.timesMs[2] - b.timesMs[2]);

  // Put chosen worker first (Execution)
  const mine = finishers.find((e) => e.wallet === executionWallet);
  if (!mine) {
    simulateWorkerPassed(taskKey, executionWallet, [4000, 3500, 1800]);
    finishers = loadQualifyBoard(taskKey)
      .entries.filter((e) => e.passedRound >= 3)
      .sort((a, b) => a.timesMs[2] - b.timesMs[2]);
  }

  finishers = [
    finishers.find((e) => e.wallet === executionWallet)!,
    ...finishers.filter((e) => e.wallet !== executionWallet),
  ];

  let t = 1800;
  while (finishers.length < slotCount) {
    const v =
      DEMO_VERIFIER_PKS[finishers.length - 1] ??
      demoPk(`pico-demo-fill-${finishers.length}`);
    t += 400;
    const entry = simulateWorkerPassed(taskKey, v, [5000, 4500, t]);
    finishers.push(entry);
  }

  const holders = Array(MAX_SLOTS).fill(ZERO) as PublicKey[];
  const timesMs = Array(MAX_SLOTS).fill(0);
  let prev = 0;
  for (let i = 0; i < slotCount; i++) {
    holders[i] = new PublicKey(finishers[i].wallet);
    let ms = finishers[i].timesMs[2] || 1;
    if (i === 0) ms = Math.min(ms, 1800);
    if (i > 0 && ms <= prev) ms = prev + 1;
    timesMs[i] = ms;
    prev = ms;
  }
  // Re-sort times so Execution is uniquely fastest on-chain style
  timesMs[0] = Math.min(...timesMs.slice(0, slotCount).filter((x) => x > 0));
  for (let i = 1; i < slotCount; i++) {
    if (timesMs[i] <= timesMs[0]) timesMs[i] = timesMs[0] + i * 100;
  }

  return { holders, timesMs };
}

/** 3) Stub: passed tests → Working + Execution seat */
export function promoteDemoToWorking(
  taskKey: string,
  executionWallet: PublicKey | string
): TaskAccount | null {
  const key =
    typeof executionWallet === "string"
      ? executionWallet
      : executionWallet.toBase58();
  let task = getDemoTask(taskKey);
  if (!task) {
    // auto-seed if missing
    seedDemoTask();
    task = getDemoTask(taskKey);
  }
  if (!task) return null;

  const { holders, timesMs } = ensurePodium(taskKey, task.slotCount, key);
  const next: TaskAccount = {
    ...task,
    status: "Working",
    slotHolders: holders,
    slotTimesMs: timesMs,
    activeSlot: 0,
    hiringSlot: 0,
  };
  upsertDemoTask(next);
  return next;
}

export function demoWorkerLabel(wallet: string): string {
  if (wallet === DEMO_WORKER_PK.toBase58()) return "demo worker";
  return "worker";
}
