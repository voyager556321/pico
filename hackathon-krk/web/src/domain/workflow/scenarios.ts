import type { ReviewBallot } from "@/platform/product/consensus";
import {
  canEnterTask,
  evaluateConsensus,
  levelForRating,
  notifyOnWorkerSubmit,
  practiceRatingDelta,
  rankTournament,
} from "@/platform";
import { handleWorkerGhosting } from "./ghosting";
import { processReviewConsensus } from "./consensus";
import { memoryWorkflowStore, resetMemoryWorkflowStore } from "./memoryStore";

const FIELD = [
  { userId: "ada", problemsSolved: 3, totalTimeMs: 40_000 },
  { userId: "bea", problemsSolved: 3, totalTimeMs: 51_000 },
  { userId: "cam", problemsSolved: 3, totalTimeMs: 62_000 },
  { userId: "dee", problemsSolved: 3, totalTimeMs: 70_000 },
  { userId: "eli", problemsSolved: 2, totalTimeMs: 10_000 },
  { userId: "fay", problemsSolved: 0, totalTimeMs: null as number | null },
];

function ballot(
  reviewerId: string,
  verdict: ReviewBallot["verdict"],
  veto?: { path: string; line: number }
): ReviewBallot {
  return {
    reviewerId,
    verdict,
    vetoPath: veto?.path ?? null,
    vetoLine: veto?.line ?? null,
    dueAt: 10_000,
    submittedAt: verdict ? 1_000 : null,
    replaced: false,
  };
}

export type ScenarioRow = {
  place: number;
  userId: string;
  assignment: string;
  timeMs: number | null;
};

export type ScenarioBlock = {
  id: string;
  title: string;
  note: string;
  rows?: ScenarioRow[];
  lines: string[];
};

export async function runModelScenarios(): Promise<ScenarioBlock[]> {
  const withReview = rankTournament(FIELD, 2);
  const skipped = rankTournament(FIELD, 0);
  const onThisTask = notifyOnWorkerSubmit({
    reviewerCount: 2,
    seatedReviewerIds: ["bea", "cam"],
  });
  const skippedTask = notifyOnWorkerSubmit({
    reviewerCount: 0,
    seatedReviewerIds: [],
  });
  const twoOfThree = evaluateConsensus(
    [
      ballot("bea", "APPROVED"),
      ballot("cam", "APPROVED"),
      ballot("dee", "REJECTED", { path: "src/pay.ts", line: 40 }),
    ],
    5_000,
    3
  );
  const vetoIgnored = evaluateConsensus(
    [
      ballot("bea", "APPROVED"),
      ballot("cam", "REJECTED"),
      ballot("dee", "APPROVED"),
    ],
    5_000,
    3
  );
  const delta = practiceRatingDelta({ solved: true, totalTimeMs: 50_000 });
  const rating = 1000 + delta;

  resetMemoryWorkflowStore();
  const store = memoryWorkflowStore();
  const now = 1_000_000;
  await store.saveTask({
    id: "task-1",
    state: "IN_PROGRESS",
    workerBudget: BigInt(50_000_000),
    reviewFunding: "CLIENT",
    reviewerBps: 500,
    bountyBps: 200,
    workerId: "ada",
    reviewerCount: 2,
    replacementWorkerIds: ["dee"],
    reviewerIds: ["bea", "cam"],
    ghostPenaltyActive: false,
    executionDeadline: now - 1,
    activeSubmissionId: null,
    ballots: [],
  });
  const ghost = await handleWorkerGhosting(store, "task-1", now);
  const after = await store.getTask("task-1");
  if (!after) throw new Error("task missing");
  after.state = "UNDER_REVIEW";
  after.workerId = "dee";
  after.reviewerIds = ["bea", "cam"];
  after.ballots = [ballot("bea", "APPROVED"), ballot("cam", "APPROVED")];
  await store.saveTask(after);
  const paid = await processReviewConsensus(store, "task-1", 5_000);

  const toRows = (
    ranked: ReturnType<typeof rankTournament>
  ): ScenarioRow[] =>
    ranked.map((row) => ({
      place: row.place,
      userId: row.userId,
      assignment: row.assignment,
      timeMs: row.totalTimeMs,
    }));

  return [
    {
      id: "field",
      title: "Хто натиснув Enter",
      note: "6 людей зайшли. Клієнт обрав 2 рев’юерів.",
      rows: toRows(withReview),
      lines: ["1-ше місце — воркер. Наступні два — рев’ю цієї задачі."],
    },
    {
      id: "skip",
      title: "Клієнт не обрав рев’ю",
      note: "Те саме поле, reviewerCount = 0.",
      rows: toRows(skipped),
      lines: [
        "2-ге і 3-тє місця в черзі на чужу задачу.",
        skippedTask.notifyUserIds.length === 0
          ? "Submit цієї задачі нікого не сповіщає."
          : "Сповіщення не мало б бути.",
      ],
    },
    {
      id: "notify",
      title: "Сповіщення",
      note: "Коли воркер здає роботу.",
      lines: [
        `Обрано 2 → сповістити ${onThisTask.notifyUserIds.join(", ")}.`,
        "Обрано 0 → сповіщення прийде лише з іншої задачі.",
      ],
    },
    {
      id: "consensus",
      title: "Консенсус",
      note: "Панель з 3. Більшість — 2.",
      lines: [
        `2 approve і 1 reject з рядком → ${twoOfThree.status}.`,
        `Reject без рядка не рахується → ${vetoIgnored.status}.`,
      ],
    },
    {
      id: "rating",
      title: "Тренування і рівень",
      note: "Швидко розв’язана practice-задача.",
      lines: [
        `+${delta} до рейтингу → ${rating}, рівень ${levelForRating(rating)}.`,
        canEnterTask(rating, 1300)
          ? "Рівень 3 вже відкритий."
          : "Задача рівня 3 (1300) ще закрита.",
      ],
    },
    {
      id: "ghost",
      title: "Воркер зник",
      note: "Дедлайн минув. Наступний фінішер заходить на задачу.",
      lines: [
        `Штраф: ${ghost.penalizedWorkerId}. Відпущені: ${ghost.releasedReviewerIds.join(", ")}.`,
        `Далі працює ${ghost.replacementWorkerId}. Стан ${ghost.state}.`,
        `Після двох approve → ${paid.status}.`,
        ...(paid.payouts ?? []).map(
          (payout) =>
            `${payout.kind} · ${payout.userId} · ${(Number(payout.amount) / 1e6).toFixed(2)} USDC`
        ),
      ],
    },
  ];
}
