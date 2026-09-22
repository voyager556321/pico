/**
 * Topic rounds. Pico does not host a private problem bank.
 * Each round points at a public task and runs the checks that ship with it.
 * Rating is the person's place among whoever entered the same window.
 */

export type ThreadId = "web3" | "embedded" | "kernel" | "web" | "android";
export type Channel = "email" | "telegram" | "discord";
export type CheckKind = "tests" | "build" | "gradle";

export type Fixture = {
  args: unknown[];
  expect: unknown;
};

export type RoundDef = {
  id: string;
  threadId: ThreadId;
  title: string;
  source: string;
  sourceLabel: string;
  kind: CheckKind;
  /** Shared window length. The clock starts once, for everyone on this device. */
  windowMs: number;
  prompt: string;
  stub: string;
  fnName: string;
  fixtures: Fixture[];
};

export type ThreadDef = {
  id: ThreadId;
  label: string;
  blurb: string;
  round: RoundDef;
};

const HOUR = 60 * 60 * 1000;

export const THREADS: ThreadDef[] = [
  {
    id: "web3",
    label: "Web3",
    blurb: "Short timed checks against a public Solana or EVM exercise.",
    round: {
      id: "web3-pda-seeds",
      threadId: "web3",
      title: "PDA seeds must match",
      source: "https://solanacookbook.com/core-concepts/pdas.html",
      sourceLabel: "Solana Cookbook · PDAs",
      kind: "tests",
      windowMs: 45 * 60 * 1000,
      prompt:
        "Public task: two accounts share a PDA only when their seeds are equal and the bump is set. Write seedsMatch(left, right, bump).",
      stub: "function seedsMatch(left, right, bump) {\n  \n}\n",
      fnName: "seedsMatch",
      fixtures: [
        { args: [[1, 2], [1, 2], 255], expect: true },
        { args: [[1, 2], [1, 3], 255], expect: false },
        { args: [[1], [1], 0], expect: false },
      ],
    },
  },
  {
    id: "embedded",
    label: "Linux embedded",
    blurb: "A small module. Pico builds the checks that come with the exercise.",
    round: {
      id: "embedded-gpio",
      threadId: "embedded",
      title: "GPIO pin is exported",
      source: "https://bootlin.com/doc/training/embedded-linux/",
      sourceLabel: "Bootlin · Embedded Linux",
      kind: "build",
      windowMs: 2 * HOUR,
      prompt:
        "Public lab: a pin is ready only when it is in 0..255 and sysfs has it exported. Write gpioReady(pin, exported).",
      stub: "function gpioReady(pin, exported) {\n  \n}\n",
      fnName: "gpioReady",
      fixtures: [
        { args: [17, true], expect: true },
        { args: [17, false], expect: false },
        { args: [300, true], expect: false },
        { args: [-1, true], expect: false },
      ],
    },
  },
  {
    id: "kernel",
    label: "Linux kernel",
    blurb: "A first patch. The round ranks who passes the tree checks inside the window.",
    round: {
      id: "kernel-staging",
      threadId: "kernel",
      title: "Staging patch, small diff",
      source: "https://kernelnewbies.org/FirstKernelPatch",
      sourceLabel: "Kernel Newbies · first patch",
      kind: "build",
      windowMs: 3 * HOUR,
      prompt:
        "Public guide: a first patch is acceptable when it targets staging and the diff is under 50 lines. Write shouldAcceptPatch(subsystem, lines).",
      stub: "function shouldAcceptPatch(subsystem, lines) {\n  \n}\n",
      fnName: "shouldAcceptPatch",
      fixtures: [
        { args: ["staging", 12], expect: true },
        { args: ["staging", 50], expect: false },
        { args: ["mm", 12], expect: false },
      ],
    },
  },
  {
    id: "web",
    label: "Web",
    blurb: "A timed route check from a public web exercise.",
    round: {
      id: "web-health",
      threadId: "web",
      title: "Health route stays public",
      source: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET",
      sourceLabel: "MDN · GET",
      kind: "tests",
      windowMs: 45 * 60 * 1000,
      prompt:
        "Public exercise: only GET /health is allowed through the gate. Write routeAllowed(path, method).",
      stub: "function routeAllowed(path, method) {\n  \n}\n",
      fnName: "routeAllowed",
      fixtures: [
        { args: ["/health", "GET"], expect: true },
        { args: ["/health", "POST"], expect: false },
        { args: ["/admin", "GET"], expect: false },
      ],
    },
  },
  {
    id: "android",
    label: "Android",
    blurb: "A few-hour project round. Pico runs the exercise tests.",
    round: {
      id: "android-runtime",
      threadId: "android",
      title: "Runtime permission gate",
      source: "https://developer.android.com/training/permissions/requesting",
      sourceLabel: "Android docs · runtime permissions",
      kind: "gradle",
      windowMs: 4 * HOUR,
      prompt:
        "Public lesson: a runtime grant is ready when the permission name is set and SDK is 23 or newer. Write grantReady(permission, sdk).",
      stub: "function grantReady(permission, sdk) {\n  \n}\n",
      fnName: "grantReady",
      fixtures: [
        { args: ["android.permission.CAMERA", 33], expect: true },
        { args: ["android.permission.CAMERA", 22], expect: false },
        { args: ["", 33], expect: false },
      ],
    },
  },
];

/** Paid board cards that belong to a topic. High pay needs that topic's rating. */
export const LISTING_THREAD: Record<string, ThreadId> = {
  t7: "web3",
  t8: "web",
};

const SUB_KEY = "pico:thread-sub";
const NOTICE_KEY = "pico:thread-notices";
const ENTRY_KEY = "pico:round-entries:";
const HISTORY_KEY = "pico:round-history:";
const WINDOW_KEY = "pico:round-window:";

export const TOPIC_BASE = 1000;
const TOPIC_MIN = 700;
const TOPIC_MAX = 1600;
/** A quiet thread loses this much after a day without a passed round. */
export const FRESH_AFTER_MS = 24 * HOUR;
const FRESH_DECAY = 30;

export type Subscription = {
  threads: ThreadId[];
  channel: Channel;
  destination: string;
};

export type RoundNotice = {
  id: string;
  threadId: ThreadId;
  text: string;
  at: number;
  channel: Channel;
  destination: string;
};

export type RoundEntry = {
  wallet: string;
  name: string;
  passed: boolean;
  timeMs: number;
  at: number;
  seeded?: boolean;
};

export type RoundWindow = { opensAt: number; closesAt: number };

const RIVALS: { name: string; wallet: string; timeMs: number }[] = [
  { name: "Ada", wallet: "rival-ada", timeMs: 48_000 },
  { name: "Kai", wallet: "rival-kai", timeMs: 71_000 },
  { name: "Noor", wallet: "rival-noor", timeMs: 95_000 },
  { name: "Syd", wallet: "rival-syd", timeMs: 130_000 },
];

export function threadById(id: string): ThreadDef | null {
  return THREADS.find((thread) => thread.id === id) ?? null;
}

export function emptySubscription(): Subscription {
  return { threads: [], channel: "email", destination: "" };
}

export function loadSubscription(): Subscription {
  if (typeof window === "undefined") return emptySubscription();
  try {
    const raw = localStorage.getItem(SUB_KEY);
    if (!raw) return emptySubscription();
    const parsed = JSON.parse(raw) as Subscription;
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      channel: parsed.channel ?? "email",
      destination: parsed.destination ?? "",
    };
  } catch {
    return emptySubscription();
  }
}

export function saveSubscription(sub: Subscription) {
  localStorage.setItem(SUB_KEY, JSON.stringify(sub));
}

export function loadNotices(): RoundNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    return raw ? (JSON.parse(raw) as RoundNotice[]) : [];
  } catch {
    return [];
  }
}

function saveNotices(notices: RoundNotice[]) {
  localStorage.setItem(NOTICE_KEY, JSON.stringify(notices.slice(0, 12)));
}

export function pushNotice(notice: Omit<RoundNotice, "id" | "at">): RoundNotice {
  const next: RoundNotice = {
    ...notice,
    id: `${notice.threadId}-${Date.now()}`,
    at: Date.now(),
  };
  saveNotices([next, ...loadNotices()]);
  return next;
}

export function roundWindow(round: RoundDef): RoundWindow {
  if (typeof window === "undefined") return { opensAt: 0, closesAt: 0 };
  const key = WINDOW_KEY + round.id;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as RoundWindow;
  } catch {
    /* open a fresh window */
  }
  const opensAt = Date.now();
  const opened = { opensAt, closesAt: opensAt + round.windowMs };
  localStorage.setItem(key, JSON.stringify(opened));
  return opened;
}

const START_KEY = "pico:round-start:";

/** Personal solve clock. The shared window only decides whether the round is still open. */
export function markStarted(roundId: string, wallet: string): number {
  if (typeof window === "undefined") return Date.now();
  const key = START_KEY + roundId + ":" + wallet;
  const existing = Number(localStorage.getItem(key));
  if (existing) return existing;
  const now = Date.now();
  localStorage.setItem(key, String(now));
  return now;
}

export function windowOpen(span: RoundWindow, now = Date.now()): boolean {
  return now >= span.opensAt && now < span.closesAt;
}

function entryKey(roundId: string) {
  return ENTRY_KEY + roundId;
}

export function loadEntries(roundId: string): RoundEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(entryKey(roundId));
    if (raw) return JSON.parse(raw) as RoundEntry[];
  } catch {
    return [];
  }
  const seeded: RoundEntry[] = RIVALS.map((rival) => ({
    wallet: rival.wallet,
    name: rival.name,
    passed: true,
    timeMs: rival.timeMs,
    at: Date.now() - rival.timeMs,
    seeded: true,
  }));
  localStorage.setItem(entryKey(roundId), JSON.stringify(seeded));
  return seeded;
}

export function saveEntry(roundId: string, threadId: ThreadId, entry: RoundEntry): RoundEntry[] {
  const rest = loadEntries(roundId).filter((row) => row.wallet !== entry.wallet);
  const next = [...rest, entry];
  localStorage.setItem(entryKey(roundId), JSON.stringify(next));
  const history = loadHistory(threadId).filter((row) => row.wallet === entry.wallet);
  localStorage.setItem(
    HISTORY_KEY + threadId,
    JSON.stringify([...history, entry].slice(-8))
  );
  return next;
}

function loadHistory(threadId: ThreadId): RoundEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY + threadId);
    return raw ? (JSON.parse(raw) as RoundEntry[]) : [];
  } catch {
    return [];
  }
}

export type Grade = { ok: boolean; passed: number; total: number; detail: string };

/** Run the public task's fixtures. The function must be declared in the source. */
export function gradeRound(round: RoundDef, source: string): Grade {
  const total = round.fixtures.length;
  const trimmed = source.trim();
  if (!trimmed || trimmed === round.stub.trim()) {
    return { ok: false, passed: 0, total, detail: "Write the function, then submit." };
  }
  let fn: (...args: unknown[]) => unknown;
  try {
    fn = new Function(`${source}\nreturn ${round.fnName};`)() as (...args: unknown[]) => unknown;
    if (typeof fn !== "function") {
      return { ok: false, passed: 0, total, detail: `Declare function ${round.fnName}.` };
    }
  } catch (error) {
    return {
      ok: false,
      passed: 0,
      total,
      detail: error instanceof Error ? error.message : "The solution did not parse.",
    };
  }
  let passed = 0;
  for (const fixture of round.fixtures) {
    try {
      const got = fn(...fixture.args);
      if (Object.is(got, fixture.expect)) passed += 1;
      else {
        return {
          ok: false,
          passed,
          total,
          detail: `${round.fnName}(${fixture.args.map(show).join(", ")}) returned ${show(got)}. Expected ${show(fixture.expect)}.`,
        };
      }
    } catch (error) {
      return {
        ok: false,
        passed,
        total,
        detail: error instanceof Error ? error.message : "A check threw.",
      };
    }
  }
  return { ok: true, passed, total, detail: `${passed}/${total} checks passed.` };
}

function show(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

export function passers(entries: RoundEntry[]): RoundEntry[] {
  return entries.filter((entry) => entry.passed).sort((a, b) => a.timeMs - b.timeMs || a.at - b.at);
}

/** 1 is the fastest passer. 0 when the entry did not pass. */
export function placeOf(entries: RoundEntry[], wallet: string): number {
  const ranked = passers(entries);
  const index = ranked.findIndex((entry) => entry.wallet === wallet);
  return index === -1 ? 0 : index + 1;
}

/**
 * Topic rating from the rounds this wallet finished in the thread.
 * Place among passers matters. A second passed round in a row adds stability.
 * A day without a pass decays the score.
 */
export function topicRating(wallet: string, threadId: ThreadId, now = Date.now()): number {
  const thread = threadById(threadId);
  if (!thread || typeof window === "undefined") return TOPIC_BASE;
  const mine = loadHistory(threadId)
    .filter((entry) => entry.wallet === wallet)
    .sort((a, b) => a.at - b.at);
  if (mine.length === 0) return TOPIC_BASE;

  let score = TOPIC_BASE;
  let streak = 0;
  for (const entry of mine.slice(-5)) {
    if (!entry.passed) {
      streak = 0;
      score -= 20;
      continue;
    }
    const board = loadEntries(thread.round.id);
    const place = placeOf(board, wallet);
    const field = passers(board).length;
    const pct = field <= 1 ? 1 : (field - place) / (field - 1);
    score += Math.round(15 + pct * 40);
    streak += 1;
    if (streak >= 2) score += 10;
  }
  const lastPass = [...mine].reverse().find((entry) => entry.passed);
  if (lastPass && now - lastPass.at > FRESH_AFTER_MS) score -= FRESH_DECAY;
  return Math.max(TOPIC_MIN, Math.min(TOPIC_MAX, score));
}

export function topicRequiredForReward(rewardUsd: number): number {
  if (rewardUsd >= 100) return 1050;
  if (rewardUsd >= 70) return 980;
  return 0;
}

export function formatRemain(ms: number): string {
  if (ms <= 0) return "closed";
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
