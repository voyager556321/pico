import { demoWallet } from "@/lib/demo";
import { loadQualifyBoard, upsertQualifyEntry } from "@/lib/offchain";

const KEY = "pico:local-bots";
const BOT_COUNT = 8;

export type LocalBot = {
  id: string;
  wallet: string;
  rating: number;
  speed: number;
};

type Store = {
  bots: LocalBot[];
  decided: Record<string, Record<string, "in" | "skip">>;
  rng: number;
  log: string;
};

export type BotEntrant = {
  id: string;
  passed: boolean;
  timeMs: number | null;
};

function freshStore(): Store {
  return {
    bots: Array.from({ length: BOT_COUNT }, (_, i) => ({
      id: `bot-${i + 1}`,
      wallet: demoWallet(`pico-bot-${i + 1}`).toBase58(),
      rating: 1000,
      speed: 0.75 + i * 0.08,
    })),
    decided: {},
    rng: 7,
    log: "Bots are on this device. Post a local task and they will enter it.",
  };
}

function loadStore(): Store {
  if (typeof window === "undefined") return freshStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshStore();
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.bots?.length) return freshStore();
    return parsed;
  } catch {
    return freshStore();
  }
}

function saveStore(store: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

function nextRandom(state: number) {
  const rng = (Math.imul(state >>> 0 || 1, 1664525) + 1013904223) >>> 0;
  return { state: rng || 1, value: (rng || 1) / 4294967296 };
}

export function localBotRoster(): LocalBot[] {
  return loadStore().bots;
}

export function localBotLog(): string {
  return loadStore().log;
}

export function botName(wallet: string): string | null {
  return loadStore().bots.find((bot) => bot.wallet === wallet)?.id ?? null;
}

export function entrantsFor(taskKey: string): BotEntrant[] {
  const bots = loadStore().bots;
  return loadQualifyBoard(taskKey).entries
    .map((entry) => ({
      id: bots.find((bot) => bot.wallet === entry.wallet)?.id ?? "worker",
      passed: entry.passedRound >= 3,
      timeMs: entry.passedRound >= 3 ? entry.timesMs[2] : null,
      finishedAt: entry.finishedAt,
    }))
    .sort((a, b) => {
      if (a.timeMs == null) return 1;
      if (b.timeMs == null) return -1;
      return a.timeMs - b.timeMs;
    });
}

/** One local decision: a bot enters or skips one open Qualifying task. */
export function tickLocalBots(
  tasks: { key: string; title: string; status: string }[]
): string {
  const store = loadStore();
  const open = tasks.filter((task) => task.status === "Qualifying");
  if (open.length === 0) {
    store.log = "No local Qualifying task. Post one and the bots will click in.";
    saveStore(store);
    return store.log;
  }

  let state = store.rng >>> 0 || 1;
  const roll = () => {
    const next = nextRandom(state);
    state = next.state;
    return next.value;
  };

  for (const task of open) {
    const decided = store.decided[task.key] ?? {};
    const bot = store.bots.find((item) => !decided[item.id]);
    if (!bot) continue;
    const enter = roll() < 0.62;
    decided[bot.id] = enter ? "in" : "skip";
    store.decided[task.key] = decided;
    store.rng = state;
    if (!enter) {
      store.log = `${bot.id} saw ${task.title} and did not enter`;
      saveStore(store);
      return store.log;
    }
    const solved = roll() > 0.18;
    const timeMs = Math.round(bot.speed * (28_000 + roll() * 55_000));
    upsertQualifyEntry(task.key, {
      wallet: bot.wallet,
      timesMs: solved
        ? [Math.round(timeMs * 0.4), Math.round(timeMs * 0.35), timeMs]
        : [Math.round(timeMs * 0.4), 0, 0],
      passedRound: solved ? 3 : 1,
      finishedAt: Date.now(),
    });
    if (solved) bot.rating += timeMs <= 45_000 ? 40 : 25;
    store.rng = state;
    store.log = solved
      ? `${bot.id} finished ${task.title} in ${timeMs} ms`
      : `${bot.id} entered ${task.title} and dropped out`;
    saveStore(store);
    return store.log;
  }

  store.rng = state;
  store.log = "Every bot has already decided on the open tasks. Seat the podium in Operator.";
  saveStore(store);
  return store.log;
}
