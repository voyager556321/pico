import { PublicKey } from "@solana/web3.js";
import { MAX_SLOTS } from "./constants";

/** Default / empty pubkey used for vacant slots. */
export const ZERO = PublicKey.default;

export const META_PREFIX = "pico:task:";
export const QUALIFY_PREFIX = "pico:qualify:";

/** Same three problems for every participant. Order is shuffled per person. */
export type QualifyProblem = {
  id: string;
  title: string;
  prompt: string;
  stub: string;
  mustInclude: string[];
};

export type TaskMeta = {
  brief: string;
  result?: string;
  explanation?: string;
  reviews?: Record<string, string>;
  qualifyProblems?: QualifyProblem[];
  /** Plain description of the real delivery, shown to Execution after qualify. */
  executorBrief?: string;
  /** Review of existing code, or a project the executor develops. */
  delivery?: "review" | "project";
};

export function loadTaskMeta(taskKey: string): TaskMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(META_PREFIX + taskKey);
    return raw ? (JSON.parse(raw) as TaskMeta) : null;
  } catch {
    return null;
  }
}

export function saveTaskMeta(taskKey: string, meta: TaskMeta) {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_PREFIX + taskKey, JSON.stringify(meta));
}

/** Off-chain mock qualification results for operator assign_team */
export type QualifyEntry = {
  wallet: string;
  timesMs: [number, number, number];
  passedRound: number;
  finishedAt: number;
};

export type QualifyBoard = {
  entries: QualifyEntry[];
};

export function loadQualifyBoard(taskKey: string): QualifyBoard {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = localStorage.getItem(QUALIFY_PREFIX + taskKey);
    if (!raw) return { entries: [] };
    return JSON.parse(raw) as QualifyBoard;
  } catch {
    return { entries: [] };
  }
}

export function saveQualifyBoard(taskKey: string, board: QualifyBoard) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUALIFY_PREFIX + taskKey, JSON.stringify(board));
}

export function upsertQualifyEntry(taskKey: string, entry: QualifyEntry) {
  const board = loadQualifyBoard(taskKey);
  const i = board.entries.findIndex((e) => e.wallet === entry.wallet);
  if (i >= 0) board.entries[i] = entry;
  else board.entries.push(entry);
  saveQualifyBoard(taskKey, board);
  return board;
}

/** Finishers of all 3 tests, sorted by Test-3 time ascending (fastest first).
 *  Ties broken by finishedAt; times nudged so on-chain RankingInvalid (strict) passes.
 */
export function podiumFromBoard(
  board: QualifyBoard,
  slotCount: number
): { holders: string[]; timesMs: number[] } | null {
  const finishers = board.entries
    .filter((e) => e.passedRound >= 3)
    .sort((a, b) => {
      const d = a.timesMs[2] - b.timesMs[2];
      if (d !== 0) return d;
      return a.finishedAt - b.finishedAt;
    });
  if (finishers.length < slotCount) return null;
  const holders = Array(MAX_SLOTS).fill(ZERO.toBase58());
  const timesMs = Array(MAX_SLOTS).fill(0);
  let prev = 0;
  for (let i = 0; i < slotCount; i++) {
    holders[i] = finishers[i].wallet;
    let t = finishers[i].timesMs[2] || 1;
    if (i > 0 && t <= prev) t = prev + 1;
    timesMs[i] = t;
    prev = t;
  }
  return { holders, timesMs };
}

/** Portable pack for cross-browser demo (qualify board + work artifacts). */
export type TaskPack = {
  v: 1;
  taskKey: string;
  qualify?: QualifyBoard;
  meta?: TaskMeta;
};

export function exportTaskPack(taskKey: string): TaskPack {
  return {
    v: 1,
    taskKey,
    qualify: loadQualifyBoard(taskKey),
    meta: loadTaskMeta(taskKey) ?? undefined,
  };
}

export function importTaskPack(raw: string | TaskPack): TaskPack {
  const pack = typeof raw === "string" ? (JSON.parse(raw) as TaskPack) : raw;
  if (!pack?.taskKey || pack.v !== 1) {
    throw new Error("Invalid task pack (expect v:1 + taskKey)");
  }
  if (pack.qualify) saveQualifyBoard(pack.taskKey, pack.qualify);
  if (pack.meta) saveTaskMeta(pack.taskKey, pack.meta);
  return pack;
}

export function isDefaultPk(pk: PublicKey): boolean {
  return pk.equals(ZERO);
}
