import {
  loadTaskMeta,
  saveTaskMeta,
  type QualifyProblem,
} from "@/lib/offchain";

export type CodingProblem = QualifyProblem;

type Level = "foundation" | "standard" | "advanced";

const STOP = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "your", "task",
  "before", "after", "when", "then", "than", "only", "must", "have", "does",
  "what", "write", "review", "debug", "test", "tests", "work", "make", "using",
]);

function levelOf(rewardUsd: number): Level {
  if (rewardUsd >= 100) return "advanced";
  if (rewardUsd >= 60) return "standard";
  return "foundation";
}

function levelLine(level: Level): string {
  if (level === "advanced") {
    return "Match the task level: reject the edge case, do not only cover the happy path.";
  }
  if (level === "standard") {
    return "Match the task level: cover the failure described in the brief, not only the happy path.";
  }
  return "Match the task level: a direct implementation of the behavior in the brief.";
}

function focusWords(brief: string): string[] {
  const words = brief
    .toLowerCase()
    .match(/[a-z][a-z0-9_]{2,}/g) ?? [];
  const unique: string[] = [];
  for (const word of words) {
    if (STOP.has(word) || unique.includes(word)) continue;
    unique.push(word);
    if (unique.length === 4) break;
  }
  while (unique.length < 3) unique.push(["input", "result", "guard"][unique.length]);
  return unique;
}

function camel(word: string): string {
  return word.replace(/[^a-z0-9]+/gi, "");
}

function excerpt(brief: string): string {
  return brief.replace(/\s+/g, " ").trim().slice(0, 180);
}

function problem(
  id: string,
  title: string,
  prompt: string,
  stub: string,
  mustInclude: string[]
): CodingProblem {
  return { id, title, prompt, stub, mustInclude };
}

function packFor(brief: string, level: Level): CodingProblem[] {
  const text = brief.toLowerCase();
  const quote = excerpt(brief);
  const [a, b, c] = focusWords(brief);
  const guard = level === "advanced" ? "throw" : level === "standard" ? "if" : "return";

  const hits = (keys: string[]) => keys.reduce((n, key) => n + (text.includes(key) ? 1 : 0), 0);

  if (hits(["pda", "seed", "anchor", "signer", "escrow"]) >= 1) {
    return [
      problem(
        "seeds",
        "Detect colliding PDA seeds",
        `Task: "${quote}". Write seedsCollide so two seed lists count as the same PDA. ${levelLine(level)}`,
        "function seedsCollide(left, right) {\n  \n}\n",
        ["return", "seed"]
      ),
      problem(
        "signer",
        "Enforce the signer constraint",
        `Task: "${quote}". Write requireSigner so a missing signer cannot pass. ${levelLine(level)}`,
        "function requireSigner(account) {\n  \n}\n",
        [guard, "signer"]
      ),
      problem(
        "vault",
        "Guard the escrow vault",
        `Task: "${quote}". Write vaultAllows so funds move only while the rule in the brief still holds. ${levelLine(level)}`,
        "function vaultAllows(status) {\n  \n}\n",
        ["return", "status"]
      ),
    ];
  }

  if (hits(["wallet", "phantom", "connect", "session"]) >= 1) {
    return [
      problem(
        "reconnect",
        "Restore the wallet after navigation",
        `Task: "${quote}". Write restoreSession so a soft navigation does not drop the connection. ${levelLine(level)}`,
        "function restoreSession(storage) {\n  \n}\n",
        ["return", "session"]
      ),
      problem(
        "drop",
        "Detect a dropped connect",
        `Task: "${quote}". Write connectDropped so a lost wallet is visible before the next click. ${levelLine(level)}`,
        "function connectDropped(events) {\n  \n}\n",
        [guard, "connect"]
      ),
      problem(
        "retry",
        "Retry without a second account",
        `Task: "${quote}". Write sameWallet so a retry stays on the original public key. ${levelLine(level)}`,
        "function sameWallet(previous, next) {\n  \n}\n",
        ["return", "wallet"]
      ),
    ];
  }

  if (hits(["ata", "token", "account"]) >= 1) {
    return [
      problem(
        "ata",
        "Create the missing token account",
        `Task: "${quote}". Write ensureAta so the winner can be paid when the account is absent. ${levelLine(level)}`,
        "function ensureAta(owner, mint) {\n  \n}\n",
        ["return", "mint"]
      ),
      problem(
        "winner",
        "Accept only one replacement",
        `Task: "${quote}". Write singleWinner so a seat refill cannot take a second holder. ${levelLine(level)}`,
        "function singleWinner(seat, next) {\n  \n}\n",
        [guard, "seat"]
      ),
      problem(
        "pay",
        "Pay the seated wallet",
        `Task: "${quote}". Write payoutTo so the transfer targets the account you just ensured. ${levelLine(level)}`,
        "function payoutTo(account, amount) {\n  \n}\n",
        ["return", "amount"]
      ),
    ];
  }

  return [
    problem(
      "implement",
      `Implement ${a}`,
      `Task: "${quote}". Write ${camel(a)}Work so it performs the behavior the brief asks for. ${levelLine(level)}`,
      `function ${camel(a)}Work(input) {\n  \n}\n`,
      ["return", a]
    ),
    problem(
      "repair",
      `Repair ${b}`,
      `Task: "${quote}". Write repair${camel(b)} so the failure named in the brief no longer passes through. ${levelLine(level)}`,
      `function repair${camel(b)}(input) {\n  \n}\n`,
      [guard, b]
    ),
    problem(
      "guard",
      `Guard ${c}`,
      `Task: "${quote}". Write guard${camel(c)} so a later change cannot silently break this task. ${levelLine(level)}`,
      `function guard${camel(c)}(input) {\n  \n}\n`,
      ["return", c]
    ),
  ];
}

/** Code the stub types in, so a spectator can watch a solution appear. */
export function sampleSolution(problem: CodingProblem): string {
  const name = problem.stub.match(/function\s+(\w+)/)?.[1] ?? "solve";
  const params = problem.stub.match(/function\s+\w+\(([^)]*)\)/)?.[1] ?? "input";
  const note = problem.mustInclude.join(" ");
  const lines = [`  const note = ${JSON.stringify(note)};`];
  if (problem.mustInclude.includes("throw")) {
    lines.push("  if (!input) throw new Error(note);");
  } else if (problem.mustInclude.includes("if")) {
    lines.push("  if (!input) return false;");
  }
  lines.push("  return note;");
  return `function ${name}(${params}) {\n${lines.join("\n")}\n}\n`;
}

/** What Execution must deliver after the three problems. */
export function executorBriefFor(brief: string): string {
  const lines = brief
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines[0] ?? "The posted task";
  const detail = lines.slice(1).join(" ") || title;
  return [
    "You are Execution.",
    "",
    `Deliver: ${title}`,
    "",
    detail,
    "",
    "Write the result and a short explanation of what changed. Reviewers are notified only after you submit. They do not write this delivery.",
  ].join("\n");
}

export function problemsForBrief(brief: string, rewardUsd: number): CodingProblem[] {
  const text = brief.trim() || "Implement the requested behavior.";
  return packFor(text, levelOf(rewardUsd));
}

export function ensureQualifyProblems(
  taskKey: string,
  brief: string,
  rewardUsd: number
): CodingProblem[] {
  const meta = loadTaskMeta(taskKey);
  if (meta?.qualifyProblems?.length === 3) return meta.qualifyProblems;
  const qualifyProblems = problemsForBrief(brief, rewardUsd);
  saveTaskMeta(taskKey, {
    brief: meta?.brief || brief,
    result: meta?.result,
    explanation: meta?.explanation,
    reviews: meta?.reviews,
    qualifyProblems,
    executorBrief: meta?.executorBrief || executorBriefFor(meta?.brief || brief),
  });
  return qualifyProblems;
}

function mix(seed: number) {
  return (Math.imul(seed >>> 0 || 1, 1664525) + 1013904223) >>> 0;
}

function hash(text: string): number {
  let state = 2166136261;
  for (let i = 0; i < text.length; i++) {
    state ^= text.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  return state >>> 0 || 1;
}

/** Same problems, order unique to this participant. */
export function orderForParticipant(
  problems: CodingProblem[],
  participant: string
): CodingProblem[] {
  const copy = [...problems];
  let state = hash(`${participant}|${problems.map((item) => item.id).join(",")}`);
  for (let i = copy.length - 1; i > 0; i--) {
    state = mix(state);
    const j = state % (i + 1);
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

export function acceptSolution(problem: CodingProblem, code: string): boolean {
  const body = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .toLowerCase();
  const stub = problem.stub.toLowerCase().replace(/\s+/g, "");
  if (body.replace(/\s+/g, "") === stub.replace(/\s+/g, "")) return false;
  return problem.mustInclude.every((token) => body.includes(token.toLowerCase()));
}
