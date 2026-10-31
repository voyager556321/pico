// ---------- Task types (ported from prototype) ----------

export type TaskStatus =
  | "draft"
  | "finding"
  | "assigned"
  | "progress"
  | "submitted"
  | "review"
  | "verification"
  | "revision"
  | "dispute"
  | "completed"
  | "cancelled";

export type TaskCategory = "Video" | "Design" | "Development" | "QA & Testing";

export type AppMode = "hire" | "work" | "rev";

export interface TimelineEvent {
  title: string;
  sub: string;
  time: string;
  tone?: "" | "money" | "warn" | "err" | "rev";
}

export interface Submission {
  at: string;
  note: string;
  files: [string, string, string][];
}

export type ChatMsg = ["y" | "w", string, string];

export interface Candidate {
  id: string;
  lvl: string;
  st: "taking" | "below" | "passed";
  score?: number;
  t: string;
  ans?: (number | number[])[];
}

export interface Task {
  id: string;
  title: string;
  cat: TaskCategory;
  reward: number;
  status: TaskStatus;
  iv?: boolean; // independent verification
  level?: string;
  days?: number;
  funded?: string;
  assigned?: string;
  started?: string;
  due?: string;
  submitted?: string;
  paid?: string;
  paidAmt?: number;
  cancelled?: string;
  proof?: string;
  how?: "accepted" | "before";
  review?: string;
  worker?: string;
  company?: string;
  desc: string;
  crit: string[];
  deliv?: string[];
  qual?: { on: boolean; pass: number; qs: QItem[] };
  sub?: Submission;
  chat?: ChatMsg[];
  unread?: number;
  files?: [string, string, string][];
  events: TimelineEvent[];
  cands?: Candidate[];
  req?: { crit: number; note: string; at: string; by: string };
  dsp?: {
    crit: number;
    by: string;
    opened: string;
    decideBy: string;
    claim: string;
    pos: string;
    evidence: [string, string, string][];
    status: string;
  };
  dcrit?: number;
  notMet?: number[];
}

export interface QItem {
  k: string;
  q: string;
  o: string[];
  c: number[];
  multi?: boolean;
  chk: string;
}

export interface WorkerTask {
  id: string;
  title: string;
  company: string;
  cat: TaskCategory;
  level: string;
  pay: number;
  deadline: string;
  desc: string;
  crit: string[];
  qs: [string, string, string, string[]?][];
}

// ---------- Status labels ----------

export const STATUS_LABELS: Record<TaskStatus, [string, string]> = {
  draft: ["Draft", ""],
  finding: ["Finding Worker", ""],
  assigned: ["Assigned", "accent"],
  progress: ["In Progress", "accent"],
  submitted: ["Submitted", "accent"],
  review: ["Awaiting Review", "warning"],
  verification: ["In Verification", "tech"],
  revision: ["Needs Revision", "rev"],
  dispute: ["Dispute", "error"],
  completed: ["Completed", "success"],
  cancelled: ["Cancelled", ""],
};

export const ACTIVE_STATUSES: TaskStatus[] = [
  "finding",
  "assigned",
  "progress",
  "submitted",
  "review",
  "verification",
  "revision",
  "dispute",
];

// ---------- Question bank ----------

export const QBANK: Record<TaskCategory, QItem[]> = {
  Video: [
    { k: "fmt", q: "Which export format will you deliver?", o: ["MP4 (H.264)", "GIF", "Raw project only"], c: [0], chk: "Delivered as MP4" },
    { k: "len", q: "Will the final cut match the requested length?", o: ["Yes, within a second or two", "Roughly", "No"], c: [0], chk: "Length matches brief" },
  ],
  Design: [
    { k: "Criteria check · Single choice", q: 'Which hero meets "mobile layout at 375 px with no horizontal scroll"?', o: ["A · Two columns side by side, 440 px minimum width", "B · Stacked: headline, offer, image below, 16 px text", "C · Desktop hero scaled down to fit 375 px"], c: [1], chk: "criterion 1" },
    { k: "Criteria check · Single choice", q: "The brief allows 8 words or fewer in the headline. Which headline passes?", o: ['A · "Spring sale: 30% off everything until Sunday"', 'B · "Get ready for our biggest spring sale of the year with 30% off"', 'C · "Spring is here and so are our amazing deals for everyone"'], c: [0], chk: "criterion 5" },
    { k: "Brief check · Single choice", q: "Where do the colors and fonts for this page come from?", o: ["A · The shared brand kit", "B · Any accessible palette you choose", "C · The colors of the current live site"], c: [0], chk: "criterion 2" },
    { k: "Deliverables · Multiple choice", q: "Which files must you deliver? Select all that apply.", o: ["A · Figma file with desktop 1440 and mobile 375 frames", "B · Auto layout and named layers", "C · PNG exports only"], c: [0, 1], multi: true, chk: "deliverables" },
  ],
  Development: [
    { k: "Criteria check · Single choice", q: "Which retry schedule avoids hammering a failing server?", o: ["A · Every 1 s, 5 times", "B · 1 s, 2 s, 4 s, 8 s, 16 s", "C · Retry forever until it works"], c: [1], chk: "criterion 2" },
    { k: "Criteria check · Single choice", q: "A payload must be verified on receipt. What do you compare?", o: ["A · The HMAC signature with the shared secret", "B · The sender IP address", "C · The payload size"], c: [0], chk: "criterion 1" },
    { k: "Brief check · Single choice", q: "Where do failed events go after the last retry?", o: ["A · They are dropped", "B · A dead-letter queue", "C · Back to the main queue"], c: [1], chk: "criterion 3" },
    { k: "Deliverables · Multiple choice", q: "What belongs in the pull request? Select all that apply.", o: ["A · Tests for the retry path", "B · A README update", "C · Production credentials"], c: [0, 1], multi: true, chk: "deliverables" },
  ],
  "QA & Testing": [
    { k: "Criteria check · Single choice", q: "A test passes locally and fails in CI 1 time in 5. What do you check first?", o: ["A · Add a longer wait", "B · Shared state between tests", "C · Rerun until it is green"], c: [1], chk: "criterion 1" },
    { k: "Criteria check · Single choice", q: "What must every logged issue include?", o: ["A · A screenshot and steps to reproduce", "B · Only the page URL", "C · A severity guess"], c: [0], chk: "criterion 2" },
    { k: "Brief check · Single choice", q: "Where does the regression run happen?", o: ["A · Production", "B · Staging", "C · A developer laptop"], c: [1], chk: "criterion 3" },
    { k: "Deliverables · Multiple choice", q: "Which browsers does the brief require? Select all that apply.", o: ["A · Chrome", "B · Safari", "C · Internet Explorer"], c: [0, 1], multi: true, chk: "criterion 1" },
  ],
};

export const feeOf = (t: Pick<Task, "reward" | "iv">) =>
  t.iv ? Math.round(t.reward * 10) / 100 : 0;

export const lockedOf = (t: Task) =>
  ACTIVE_STATUSES.includes(t.status)
    ? Math.round((t.reward + feeOf(t) + (t.extraLocked || 0) - (t.paidOut || 0)) * 100) / 100
    : 0;

// augment Task with optional fields used by helpers
declare module "./types" {
  interface Task {
    extraLocked?: number;
    paidOut?: number;
    crPaid?: number;
  }
}

export const fmt = (n: number) =>
  (Math.round(n * 100) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
