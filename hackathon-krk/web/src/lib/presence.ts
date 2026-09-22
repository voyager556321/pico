const TRUST_KEY = "pico:trust:";
const SESSION_KEY = "pico:presence:";

export const TRUST_START = 1000;
const TRUST_MIN = 700;
const TRUST_MAX = 1300;
/** Away this long drops trust once. Short so the local demo can show it. */
export const AWAY_PENALTY_MS = 20_000;
const AWAY_PENALTY = 40;
const PRESENT_BONUS_MS = 30_000;
const PRESENT_BONUS = 15;

export type PresenceSource = "web" | "editor";

export type WorkSession = {
  taskId: string;
  wallet: string;
  startedAt: number;
  activeMs: number;
  awayMs: number;
  lastTickAt: number;
  awayMarked: number;
  presentMarked: number;
  source: PresenceSource;
};

export function trustRequiredForReward(rewardUsd: number): number {
  if (rewardUsd >= 100) return 1050;
  if (rewardUsd >= 70) return 980;
  return 0;
}

export function loadTrust(wallet: string): number {
  if (typeof window === "undefined") return TRUST_START;
  try {
    const raw = localStorage.getItem(TRUST_KEY + wallet);
    if (!raw) return TRUST_START;
    const value = Number(raw);
    return Number.isFinite(value) ? value : TRUST_START;
  } catch {
    return TRUST_START;
  }
}

export function setTrust(wallet: string, value: number): number {
  const next = Math.max(TRUST_MIN, Math.min(TRUST_MAX, Math.round(value)));
  if (typeof window !== "undefined") {
    localStorage.setItem(TRUST_KEY + wallet, String(next));
  }
  return next;
}

function sessionStorageKey(taskId: string, wallet: string) {
  return `${SESSION_KEY}${taskId}:${wallet}`;
}

export function loadWorkSession(taskId: string, wallet: string): WorkSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(sessionStorageKey(taskId, wallet));
    return raw ? (JSON.parse(raw) as WorkSession) : null;
  } catch {
    return null;
  }
}

export function startWorkSession(taskId: string, wallet: string): WorkSession {
  const existing = loadWorkSession(taskId, wallet);
  if (existing) return existing;
  const now = Date.now();
  const session: WorkSession = {
    taskId,
    wallet,
    startedAt: now,
    activeMs: 0,
    awayMs: 0,
    lastTickAt: now,
    awayMarked: 0,
    presentMarked: 0,
    source: "web",
  };
  localStorage.setItem(sessionStorageKey(taskId, wallet), JSON.stringify(session));
  return session;
}

/**
 * Advance the clock. `present` is true when the tab is focused or an editor
 * heartbeat is fresh. Absence past AWAY_PENALTY_MS lowers trust.
 */
export function tickPresence(
  session: WorkSession,
  present: boolean,
  source: PresenceSource
): { session: WorkSession; trust: number; dropped: boolean } {
  const now = Date.now();
  const delta = Math.min(5_000, Math.max(0, now - session.lastTickAt));
  const next: WorkSession = {
    ...session,
    lastTickAt: now,
    source: present && source === "editor" ? "editor" : session.source,
    activeMs: session.activeMs + (present ? delta : 0),
    awayMs: session.awayMs + (present ? 0 : delta),
  };
  let trust = loadTrust(session.wallet);
  let dropped = false;
  const awayBuckets = Math.floor(next.awayMs / AWAY_PENALTY_MS);
  if (awayBuckets > next.awayMarked) {
    trust = setTrust(session.wallet, trust - AWAY_PENALTY * (awayBuckets - next.awayMarked));
    next.awayMarked = awayBuckets;
    dropped = true;
  }
  const presentBuckets = Math.floor(next.activeMs / PRESENT_BONUS_MS);
  if (presentBuckets > next.presentMarked) {
    trust = setTrust(session.wallet, trust + PRESENT_BONUS * (presentBuckets - next.presentMarked));
    next.presentMarked = presentBuckets;
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(sessionStorageKey(session.taskId, session.wallet), JSON.stringify(next));
  }
  return { session: next, trust, dropped };
}

const ACTIVE_KEY = "pico:presence-active";
export const PRESENCE_EVENT = "pico:presence";

export function markActiveSession(session: WorkSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    ACTIVE_KEY,
    JSON.stringify({ taskId: session.taskId, wallet: session.wallet })
  );
}

export function loadActiveSession(): { taskId: string; wallet: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as { taskId: string; wallet: string }) : null;
  } catch {
    return null;
  }
}

export function clearActiveSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_KEY);
}

export function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
