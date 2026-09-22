import {
  canEnterTask,
  evaluateConsensus,
  levelForRating,
  practiceRatingDelta,
  rankTournament,
  PRODUCT,
} from "@/platform";
import type { ReviewBallot } from "@/platform/product/consensus";

export type SimOptions = {
  seed: number;
  botCount: number;
  taskCount: number;
  rounds: number;
};

type Bot = {
  id: string;
  rating: number;
  /** Lower is faster. */
  speed: number;
};

type SimTask = {
  id: string;
  title: string;
  kind: "PAID" | "PRACTICE";
  requiredRating: number;
  reviewerCount: number;
  budget: number;
};

export type SimClick = {
  id: string;
  solved: boolean;
  timeMs: number | null;
  assignment: string;
};

export type SimBoardStatus =
  | "Qualifying"
  | "Working"
  | "InReview"
  | "HiringSlot"
  | "Paid"
  | "Practice";

export type SimTaskResult = {
  id: string;
  title: string;
  kind: "PAID" | "PRACTICE";
  requiredRating: number;
  reviewerCount: number;
  budget: number;
  eligible: number;
  clicks: SimClick[];
  notes: string[];
  ghosted: boolean;
  boardStatus: SimBoardStatus;
};

export type SimRound = {
  index: number;
  tasks: SimTaskResult[];
  ratings: { id: string; rating: number; level: number }[];
};

export type SimReport = {
  seed: number;
  rounds: SimRound[];
};

function rng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeBots(count: number): Bot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `bot-${i + 1}`,
    rating: 1000,
    speed: 0.75 + i * 0.08,
  }));
}

const TASK_TITLES = [
  "Code review",
  "Escrow patch",
  "API timeout",
  "Indexer lag",
  "Wallet UX",
  "Test flake",
  "PDA seeds",
  "Rent math",
];

function makeTasks(count: number): SimTask[] {
  return Array.from({ length: count }, (_, i) => {
    const kind = i % 3 === 0 ? "PRACTICE" : "PAID";
    const requiredRating = [0, 0, 1100, 1300][i % 4];
    const reviewerCount = kind === "PRACTICE" ? 0 : [0, 2, 1, 3][i % 4];
    return {
      id: `task-${i + 1}`,
      kind,
      requiredRating,
      reviewerCount,
      budget: 40 + i * 15,
      title: TASK_TITLES[i] ?? `Task ${i + 1}`,
    };
  });
}

function assignmentOf(
  ranked: ReturnType<typeof rankTournament>,
  id: string
): string {
  return ranked.find((row) => row.userId === id)?.assignment ?? "—";
}

export function simulate(options: SimOptions): SimReport {
  const random = rng(options.seed);
  const bots = makeBots(Math.max(2, Math.min(24, options.botCount)));
  const tasks = makeTasks(Math.max(1, Math.min(8, options.taskCount)));
  const rounds = Math.max(1, Math.min(8, options.rounds));
  const queue: string[] = [];
  const report: SimRound[] = [];

  for (let round = 1; round <= rounds; round++) {
    const taskResults: SimTaskResult[] = [];

    for (const task of tasks) {
      const eligible = bots.filter((bot) =>
        canEnterTask(bot.rating, task.requiredRating)
      );
      const clicked = eligible.filter(() => random() < 0.62);
      const clicks: SimClick[] = clicked.map((bot) => {
        const solved = random() > 0.18;
        const timeMs = solved
          ? Math.round(bot.speed * (28_000 + random() * 55_000))
          : null;
        return {
          id: bot.id,
          solved,
          timeMs,
          assignment: "—",
        };
      });

      const ranked = rankTournament(
        clicks.map((click) => ({
          userId: click.id,
          problemsSolved: click.solved ? PRODUCT.problemsPerQualifier : 1,
          totalTimeMs: click.timeMs,
        })),
        task.kind === "PRACTICE" ? 0 : task.reviewerCount
      );
      for (const click of clicks) {
        click.assignment =
          task.kind === "PRACTICE"
            ? click.solved
              ? "SOLVED"
              : "OUT"
            : assignmentOf(ranked, click.id);
      }

      const notes: string[] = [];
      let ghosted = false;
      let boardStatus: SimBoardStatus = "Qualifying";
      notes.push(
        `Могли зайти ${eligible.length}. Натиснули ${clicks.length}.`
      );

      if (clicks.length === 0) {
        notes.push("Ніхто з допущених не натиснув.");
      } else if (task.kind === "PRACTICE") {
        let gained = 0;
        for (const click of clicks.filter((row) => row.solved && row.timeMs)) {
          const bot = bots.find((item) => item.id === click.id);
          if (!bot) continue;
          const delta = practiceRatingDelta({
            solved: true,
            totalTimeMs: click.timeMs,
          });
          bot.rating += delta;
          gained += 1;
        }
        notes.push(
          gained
            ? `Тренування: рейтинг виріс у ${gained}.`
            : "Ніхто не дорішав тренувальний набір."
        );
        boardStatus = "Practice";
      } else if (!ranked.some((row) => row.assignment === "WORKER")) {
        notes.push("Фінішера немає — воркера не призначено.");
      } else {
        let worker = ranked.find((row) => row.assignment === "WORKER")!;
        const seated = ranked
          .filter((row) => row.assignment === "REVIEWER")
          .map((row) => row.userId);
        for (const row of ranked.filter((item) => item.assignment === "QUEUED")) {
          if (!queue.includes(row.userId)) queue.push(row.userId);
        }
        if (task.reviewerCount === 0) {
          notes.push(
            "Клієнт не брав рев’ю. 2-ге і 3-тє місця чекають чужий submit."
          );
        }

        const workerBot = bots.find((bot) => bot.id === worker.userId);
        const ghosts = Boolean(workerBot && random() < 0.22);
        let replaced = false;
        if (ghosts && workerBot) {
          ghosted = true;
          workerBot.rating = Math.max(0, workerBot.rating - PRODUCT.ghostRatingPenalty);
          const next = ranked.find(
            (row) =>
              row.assignment === "RELEASED" &&
              row.problemsSolved >= PRODUCT.problemsPerQualifier
          );
          notes.push(
            next
              ? `${worker.userId} зник (рейтинг ${workerBot.rating}). Далі ${next.userId}.`
              : `${worker.userId} зник, заміни в полі немає.`
          );
          for (const id of seated) {
            if (!queue.includes(id)) queue.push(id);
          }
          seated.length = 0;
          if (next) {
            worker = next;
            replaced = true;
          }
        }

        if (task.reviewerCount > 0) {
          while (seated.length < task.reviewerCount && queue.length > 0) {
            const id = queue.shift()!;
            if (id !== worker.userId && !seated.includes(id)) {
              seated.push(id);
              notes.push(`Сповіщення ${id}: рев’ю для ${worker.userId}.`);
            }
          }
          const ballots: ReviewBallot[] = seated.map((id) => {
            const reject = random() < 0.28;
            const tagged = random() > 0.15;
            return {
              reviewerId: id,
              verdict: reject ? "REJECTED" : "APPROVED",
              vetoPath: reject && tagged ? "src/lib.rs" : null,
              vetoLine: reject && tagged ? 12 : null,
              dueAt: 10_000,
              submittedAt: 1_000,
              replaced: false,
            };
          });
          const verdict = evaluateConsensus(ballots, 5_000, task.reviewerCount);
          notes.push(
            `Воркер ${worker.userId}. Рев’юери [${seated.join(", ") || "—"}] → ${verdict.status}.`
          );
          if (verdict.status === "APPROVED") {
            notes.push(`Виплата воркеру ${task.budget} USDC.`);
            boardStatus = "Paid";
          } else if (ghosted && seated.length === 0) {
            boardStatus = "HiringSlot";
          } else {
            boardStatus = "InReview";
          }
        } else if (ghosted && !replaced) {
          boardStatus = "HiringSlot";
        } else {
          boardStatus = "Paid";
          notes.push(
            `Воркер ${worker.userId} закриває задачу без рев’ю. ${task.budget} USDC.`
          );
        }
      }

      clicks.sort((a, b) => {
        if (a.timeMs == null) return 1;
        if (b.timeMs == null) return -1;
        return a.timeMs - b.timeMs;
      });

      taskResults.push({
        id: task.id,
        title: task.title,
        kind: task.kind,
        requiredRating: task.requiredRating,
        reviewerCount: task.reviewerCount,
        budget: task.budget,
        eligible: eligible.length,
        clicks,
        notes,
        ghosted,
        boardStatus,
      });
    }

    report.push({
      index: round,
      tasks: taskResults,
      ratings: bots
        .map((bot) => ({
          id: bot.id,
          rating: bot.rating,
          level: levelForRating(bot.rating),
        }))
        .sort((a, b) => b.rating - a.rating),
    });
  }

  return { seed: options.seed, rounds: report };
}
