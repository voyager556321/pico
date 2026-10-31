import { QBANK, type Task, type TimelineEvent, type WorkerTask } from "./types";

export const TASKS: Record<string, Task> = {};

type TaskSeed = Omit<Task, "events"> & {
  events: [string, string, string, TimelineEvent["tone"]?][];
};

function addTask(t: TaskSeed) {
  TASKS[t.id] = {
    qual: { on: true, pass: 75, qs: JSON.parse(JSON.stringify(QBANK[t.cat] || QBANK.Design)) },
    iv: false,
    level: "Mid",
    days: 3,
    deliv: [],
    chat: [],
    files: [],
    cands: [],
    ...t,
    events: t.events.map(([title, sub, time, tone]) => ({ title, sub, time, tone })),
  };
}

addTask({
  id: "signup",
  title: "Sign-up regression test",
  cat: "Development",
  reward: 90,
  status: "review",
  worker: "4821",
  funded: "Sep 17",
  assigned: "Sep 18",
  due: "Sep 23",
  submitted: "Sep 22",
  desc: "Run a regression pass on the sign-up flow before Thursday's release. Cover email and Google sign-up, validation errors and the confirmation step. Log every failing case with steps to reproduce.",
  crit: [
    "Sign-up flow covered on Chrome, Safari and Firefox",
    "Each failing case logged with steps to reproduce",
    "Suite runs on staging, not production",
    "Report delivered with the submission",
  ],
  deliv: ["Regression report (PDF)", "Link to the staging test run"],
  sub: {
    at: "Sep 22, 16:40",
    note: "All three browsers covered on staging. 4 failing cases logged with steps to reproduce — report attached. Happy to walk through any case.",
    files: [
      ["PDF", "regression-report.pdf", "1.2 MB"],
      ["URL", "Staging test run", "staging.northwind.studio/signup"],
    ],
  },
  chat: [["w", "Sep 22 · 16:42", "Submitted. The report lists 4 failing cases with steps."]],
  files: [
    ["PDF", "regression-report.pdf", "1.2 MB"],
    ["URL", "Staging test run", "staging.northwind.studio/signup"],
    ["DOC", "Test plan", "docs.northwind.studio/signup-plan"],
  ],
  events: [
    ["Work submitted", "Report with 4 failing cases", "Sep 22, 16:40", ""],
    ["Specialist started", "Specialist #4821", "Sep 18, 10:20", ""],
    ["Specialist assigned", "Specialist #4821 · first to reach 75 / 100", "Sep 18, 09:12", ""],
    ["Funds locked", "$90.00 from Available", "Sep 17, 14:05", "money"],
  ],
});

addTask({
  id: "landingqa",
  title: "Landing copy QA",
  cat: "Development",
  reward: 70,
  status: "dispute",
  worker: "2209",
  funded: "Sep 15",
  assigned: "Sep 16",
  submitted: "Sep 20",
  desc: "Proofread the landing page copy against the brief and flag every mismatch.",
  crit: [
    "Every section checked against the brief v2.",
    "Headline matches the brief word for word.",
    "Every issue logged with a screenshot.",
  ],
  sub: { at: "Sep 20, 15:00", note: "Report with 12 issues, each with a screenshot.", files: [["PDF", "copy-issues.pdf", "12 issues · 3.4 MB"]] },
  dsp: {
    crit: 1,
    by: "client",
    opened: "Sep 21",
    decideBy: "Sep 28",
    claim: 'The headline on the page says "Ship faster with Task.quo". The brief says "Hire for a task in minutes". It wasn\'t flagged.',
    pos: "The headline follows the brief doc v2 from Sep 20. The version you mention is v3, shared after I submitted.",
    evidence: [
      ["PNG", "landing-headline.png", "Screenshot of the live headline · added by you"],
      ["DOC", "brief-v2.pdf", "Brief v2 from Sep 20 · added by the worker"],
    ],
    status: "review",
  },
  chat: [
    ["y", "Sep 21 · 18:02", "Opened a dispute on criterion 2. The headline wasn't flagged."],
    ["w", "Sep 23 · 09:12", "The headline follows the brief doc v2 from Sep 20. The version you mention is v3, shared after I submitted."],
  ],
  events: [
    ["Specialist replied in the dispute", "Task.quo decides by Sep 28", "Sep 23, 09:12", "err"],
    ["Dispute opened", "Criterion 2 · by you", "Sep 21, 18:02", "err"],
    ["Work submitted", "Report with 12 issues", "Sep 20, 15:00", ""],
    ["Funds locked", "$70.00 from Available", "Sep 15, 10:10", "money"],
  ],
});

addTask({
  id: "pricing",
  title: "Pricing page redesign",
  cat: "Design",
  reward: 150,
  status: "finding",
  funded: "Sep 22",
  days: 4,
  desc: "Redesign our pricing page: three plans, a comparison table and an FAQ. Desktop and mobile.",
  crit: [
    "Three plan cards with monthly and yearly prices.",
    "Comparison table readable at 375 px without horizontal scroll.",
    "Uses components from our design system.",
    "Figma file with desktop and mobile frames.",
  ],
  deliv: ["Figma file with desktop 1440 and mobile 375 frames"],
  cands: [
    { id: "4821", lvl: "Mid", st: "taking", t: "Sep 23, 08:40" },
    { id: "3307", lvl: "Mid", st: "taking", t: "Sep 23, 09:02" },
    { id: "1043", lvl: "Senior", st: "below", score: 50, t: "Sep 22, 18:47", ans: [1, 1, 0, [0]] },
    { id: "5190", lvl: "Mid", st: "below", score: 50, t: "Sep 22, 17:44", ans: [1, 2, 0, [0, 1, 2]] },
  ],
  events: [
    ["2 workers below the pass mark", "50 / 100 each · Task.quo keeps waiting", "Sep 22, 18:47", "warn"],
    ["Qualification started", "Task.quo sent the test to 6 eligible workers", "Sep 22, 16:10", ""],
    ["Funds locked", "$150.00 from Available", "Sep 22, 16:05", "money"],
  ],
});

addTask({
  id: "checkout",
  title: "Checkout layout fixes",
  cat: "Development",
  reward: 120,
  status: "progress",
  worker: "5190",
  funded: "Sep 19",
  assigned: "Sep 20",
  started: "Sep 20",
  due: "Sep 24",
  desc: "Fix checkout layout bugs on mobile: buttons overlap below 400 px and the order summary gets cut off.",
  crit: [
    "No overlapping elements from 320 to 430 px wide.",
    "Order summary fully visible and scrollable on mobile.",
    "No layout regressions on desktop checkout.",
    "Pull request with before and after screenshots.",
  ],
  deliv: ["Pull request with before and after screenshots"],
  chat: [
    ["w", "Sep 23 · 11:40", "Fixed the button overlap. Working on the order summary now."],
    ["w", "Sep 23 · 11:42", "Quick question: should the summary collapse by default on mobile?"],
  ],
  unread: 2,
  files: [["PR", "Draft pull request #412", "github.com/northwind/shop/pull/412"]],
  events: [
    ["Specialist sent 2 messages", "Unread", "Sep 23, 11:42", ""],
    ["Specialist started", "In Progress", "Sep 20, 10:30", ""],
    ["Specialist assigned", "Specialist #5190 · first to reach 75 / 100", "Sep 20, 10:04", ""],
    ["Funds locked", "$120.00 from Available", "Sep 19, 14:22", "money"],
  ],
});

addTask({
  id: "webhook",
  title: "Payment webhook",
  cat: "Development",
  reward: 200,
  iv: true,
  status: "verification",
  worker: "6603",
  funded: "Sep 17",
  assigned: "Sep 18",
  submitted: "Sep 22",
  desc: "Add a signed webhook that tells our backend when a payment settles, with retries on failure.",
  crit: [
    "Webhook payload is signed and verified on receipt.",
    "Failed deliveries retry 5 times with backoff.",
    "Tests cover success, failure and retry.",
    "README explains how to rotate the signing secret.",
  ],
  deliv: ["Pull request", "README section"],
  sub: { at: "Sep 22, 18:10", note: "PR #398 is ready. All tests pass; retry logic is in webhook/retry.ts.", files: [["PR", "Pull request #398", "github.com/northwind/api/pull/398"]] },
  chat: [["w", "Sep 22 · 18:12", "Submitted. Happy to walk the reviewer through the retry logic."]],
  files: [["PR", "Pull request #398", "github.com/northwind/api/pull/398"]],
  events: [
    ["Independent verification started", "1 reviewer is checking against your criteria", "Sep 22, 18:15", ""],
    ["Work submitted", "PR #398", "Sep 22, 18:10", ""],
    ["Specialist assigned", "Specialist #6603", "Sep 18, 09:40", ""],
    ["Funds locked", "$200.00 + 20.00 verification fee", "Sep 17, 11:02", "money"],
  ],
});

addTask({
  id: "onboarding",
  title: "Podcast trailer, episode 12",
  cat: "Video",
  reward: 100,
  status: "revision",
  worker: "2744",
  funded: "Sep 16",
  assigned: "Sep 17",
  submitted: "Sep 21",
  due: "Sep 25",
  desc: "A 45–60 s trailer cut from the full episode: opens mid-conversation, big animated captions, 16:9.",
  crit: [
    "45–60 seconds, 16:9, 1080p.",
    "Captions match the speech word for word.",
    "Hard cuts every 1–3 s, no zooms or transitions.",
    "Delivered as MP4 plus the project file.",
  ],
  req: { crit: 1, note: "Captions at 0:14–0:19 don’t match what the guest says. Please fix that line.", at: "Sep 22, 10:15", by: "client" },
  sub: { at: "Sep 21, 17:30", note: "Trailer MP4 and the Premiere project are attached.", files: [["MP4", "ep12-trailer.mp4", "0:52 · 84 MB"], ["PRJ", "Premiere project", "ep12-trailer.prproj"]] },
  chat: [
    ["y", "Sep 22 · 10:15", "Requested changes on criterion 2, see the note above."],
    ["w", "Sep 22 · 10:40", "Got it, fixing that caption today."],
  ],
  events: [
    ["Changes requested", "Criterion 2 · captions match the speech", "Sep 22, 10:15", "rev"],
    ["Work submitted", "Trailer MP4 + project file", "Sep 21, 17:30", ""],
    ["Specialist assigned", "Specialist #2744", "Sep 17, 12:00", ""],
    ["Funds locked", "$100.00 from Available", "Sep 16, 09:40", "money"],
  ],
});

addTask({
  id: "launch",
  title: "Product demo video (45 s)",
  cat: "Video",
  reward: 60,
  status: "completed",
  worker: "3107",
  funded: "Sep 12",
  paid: "Sep 18",
  paidAmt: 60,
  proof: "8kFe…2mWq",
  how: "accepted",
  desc: "A 45 s screen-recorded demo of the new dashboard, with captions and a music bed.",
  crit: ["45 s ± 5 s, 16:9 and 9:16 versions.", "Brand fonts and colors in captions.", "MP4 exports plus the project file."],
  sub: { at: "Sep 16, 17:20", note: "Both versions and the project file.", files: [["MP4", "demo-16x9.mp4", "0:45 · 61 MB"], ["MP4", "demo-9x16.mp4", "0:45 · 58 MB"]] },
  files: [["MP4", "demo-16x9.mp4", "0:45 · 61 MB"], ["MP4", "demo-9x16.mp4", "0:45 · 58 MB"]],
  events: [
    ["Payout released", "$60.00 to Specialist #3107", "Sep 18, 12:00", "money"],
    ["You accepted the work", "All 3 criteria met", "Sep 18, 11:58", ""],
    ["Work submitted", "2 video versions", "Sep 16, 17:20", ""],
    ["Funds locked", "$60.00 from Available", "Sep 12, 09:30", "money"],
  ],
});

addTask({
  id: "icons",
  title: "Icon set cleanup",
  cat: "Design",
  reward: 45,
  status: "completed",
  worker: "3107",
  funded: "Sep 8",
  paid: "Sep 12",
  paidAmt: 45,
  proof: "Lk9s…4tNb",
  how: "accepted",
  desc: "Clean up 40 icons: consistent 1.7 px stroke, 24 px grid, SVG export.",
  crit: ["All 40 icons on a 24 px grid.", "Stroke 1.7 px, round caps.", "Optimised SVG export."],
  files: [["ZIP", "icons-24.zip", "40 SVG · 48 KB"]],
  events: [
    ["Payout released", "$45.00 to Specialist #3107", "Sep 12, 16:40", "money"],
    ["You accepted the work", "All 3 criteria met", "Sep 12, 16:38", ""],
    ["Funds locked", "$45.00 from Available", "Sep 8, 10:00", "money"],
  ],
});

addTask({
  id: "apidocs",
  title: "API docs review",
  cat: "Development",
  reward: 55,
  status: "cancelled",
  funded: "Sep 11",
  cancelled: "Sep 16",
  how: "before",
  desc: "Review our API docs for missing endpoints and unclear examples.",
  crit: ["Every public endpoint listed.", "Each example runs as written.", "Issues logged per page."],
  events: [
    ["Funds returned", "$55.00 to Available", "Sep 16, 14:05", "money"],
    ["Task cancelled", "Before assignment", "Sep 16, 14:05", ""],
    ["Qualification ended", "0 of 4 workers reached the pass mark", "Sep 16, 09:00", "warn"],
    ["Funds locked", "$55.00 from Available", "Sep 11, 13:20", "money"],
  ],
});

addTask({
  id: "mobilenav",
  title: "Mobile nav audit",
  cat: "Design",
  reward: 40,
  status: "draft",
  desc: "Audit the mobile navigation of our web app and propose a simpler menu with 5 items or fewer.",
  crit: ["Current menu mapped with every item.", "New menu with 5 items or fewer.", "Figma prototype of the new menu."],
  events: [],
});

export const TASK_ORDER = [
  "signup",
  "landingqa",
  "pricing",
  "checkout",
  "webhook",
  "onboarding",
  "launch",
  "icons",
  "apidocs",
  "mobilenav",
];

// ---------- Worker tasks ----------

export const WTASKS: Record<string, WorkerTask> = {
  mcheckout: {
    id: "mcheckout",
    title: "Mobile checkout redesign",
    company: "Brightline",
    cat: "Design",
    level: "Mid",
    pay: 110,
    deadline: "3 days after assignment",
    desc: "Redesign the mobile checkout: address, delivery and payment on one scrollable page.",
    crit: ["One-page flow at 375 px.", "Uses the Brightline design system.", "Figma prototype with the error states."],
    qs: [
      ["link", "Portfolio · Link", "Share 1–2 checkout or form flows you designed. Links must open."],
      ["link", "Mini task · Link", "Redesign the delivery-options block at 375 px. Paste a Figma or image link."],
      ["choice", "Criteria check · Choice", "Which layout keeps the pay button visible without scrolling on a 375 × 667 screen?", ["A · Sticky pay button at the bottom", "B · Pay button after the order summary", "C · Pay button in the header"]],
    ],
  },
  flaky: {
    id: "flaky",
    title: "Fix flaky login tests",
    company: "Fernway",
    cat: "Development",
    level: "Junior and above",
    pay: 70,
    deadline: "2 days after assignment",
    desc: "Find why 3 login tests fail randomly in CI and make them stable.",
    crit: ["3 tests pass 20 runs in a row.", "Root cause written in the PR.", "No new sleeps or retries."],
    qs: [
      ["link", "Portfolio · Link", "Share a PR or report where you fixed flaky tests."],
      ["choice", "Criteria check · Choice", "A test passes locally and fails in CI 1 time in 5. What do you check first?", ["A · Add a longer wait", "B · Shared state between tests and timing assumptions", "C · Re-run CI until it passes"]],
    ],
  },
  retries: {
    id: "retries",
    title: "Webhook retries for payouts",
    company: "Orbital Pay",
    cat: "Development",
    level: "Mid",
    pay: 160,
    deadline: "4 days after assignment",
    desc: "Add retries with backoff to the payout webhook and a dead-letter queue.",
    crit: ["5 retries with exponential backoff.", "Failed events land in a dead-letter queue.", "Tests for retry and give-up paths."],
    qs: [
      ["link", "Portfolio · Link", "Share code where you built retries or queues."],
      ["choice", "Criteria check · Choice", "Which retry schedule avoids hammering a failing server?", ["A · Every 1 s, 5 times", "B · 1 s, 2 s, 4 s, 8 s, 16 s", "C · Retry forever until it works"]],
    ],
  },
};

// ---------- Candidates ----------

export const CANDS: Record<string, {
  score: number;
  rank: number;
  time: string;
  ans: [string, string, string, string][];
  msgs: ["w" | "y", string, string][];
}> = {
  "4821": {
    score: 92,
    rank: 1,
    time: "12:52",
    ans: [
      ["Portfolio · Link", "dribbble.com/w4821/spring-promo", "Link works", "success"],
      ["Mini task · Upload", "hero-mobile-375.png · 1.4 MB", "Criteria 1–2 met", "success"],
      ["Criteria check · Choice", "B · Stacked: headline, offer, image below", "Correct", "success"],
    ],
    msgs: [
      ["w", "12:58", "Hi! Is the 30% offer the only promo on the page, or will there be more?"],
      ["y", "13:02", "Only the 30% offer. Everything else is in the copy document."],
    ],
  },
  "3307": {
    score: 81,
    rank: 2,
    time: "13:05",
    ans: [
      ["Portfolio · Link", "behance.net/w3307/sale-pages", "Link works", "success"],
      ["Mini task · Upload", "hero-375-v2 · Figma link", "Criterion 2 partly", "warning"],
      ["Criteria check · Choice", "B · Stacked: headline, offer, image below", "Correct", "success"],
    ],
    msgs: [],
  },
};

// ---------- Notifications ----------

export const NOTES = [
  { t: "Work submitted", s: "Sign-up regression test · review by Oct 6", go: "signup", mode: "hire" },
  { t: "Specialist replied in a dispute", s: "Landing copy QA · Task.quo decides by Sep 28", go: "landingqa", mode: "hire" },
  { t: "2 workers below the pass mark", s: "Pricing page redesign · still finding a worker", go: "pricing", mode: "hire" },
];
