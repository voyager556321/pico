/**
 * Product rules for the competitive workflow.
 * The Anchor program still pays by slot_bps — these numbers are the target
 * ledger. Contract alignment is a later change.
 */
export const PRODUCT = {
  problemsPerQualifier: 3,
  /**
   * Field size is whoever clicked Enter before qualification closed.
   * 1st place is the worker.
   * The next `reviewerCount` places review THIS task — the client picks that count.
   * Reviewer count 0: places 2 and 3 are not seated here. They wait on the queue
   * and get a notification when some other worker submits.
   */
  standbyPlacesWhenClientSkipsReview: [2, 3] as const,
  reviewTimeoutMs: 2 * 60 * 60 * 1000,
  reviewerBps: 500,
  bountyBps: 200,
  ghostRatingPenalty: 150,
  /** Worker is promised 100% of the posted budget. Practice tasks pay rating, not USDC. */
  workerShareBps: 10_000,
  /** Rating bands. A paid task's requiredRating picks who may enter. */
  levels: [
    { level: 1, minRating: 0 },
    { level: 2, minRating: 1100 },
    { level: 3, minRating: 1300 },
    { level: 4, minRating: 1600 },
  ] as const,
  practice: {
    /** Flat gain for a fully solved practice set. */
    solveBonus: 25,
    /** Extra gain when total time is under this many ms. */
    fastUnderMs: 90_000,
    fastBonus: 15,
  },
} as const;

export const PRODUCT_STATES = [
  "QUALIFICATION",
  "IN_PROGRESS",
  "EMERGENCY_REQUEUE",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type ProductTaskState = (typeof PRODUCT_STATES)[number];

/** Strict majority of the panel the client asked for. Zero reviewers → no vote. */
export function majorityOf(reviewerCount: number): number {
  if (reviewerCount <= 0) return 0;
  return Math.floor(reviewerCount / 2) + 1;
}

/**
 * Temporary bridge. Existing program statuses stay until the rewrite.
 * EMERGENCY_REQUEUE ≈ HiringSlot (empty execution seat).
 */
export const CHAIN_STATUS_FOR_PRODUCT: Record<
  ProductTaskState,
  | "Qualifying"
  | "Working"
  | "InReview"
  | "HiringSlot"
  | "Submitted"
  | "Paid"
  | "Disputed"
  | "Cancelled"
> = {
  QUALIFICATION: "Qualifying",
  IN_PROGRESS: "Working",
  EMERGENCY_REQUEUE: "HiringSlot",
  UNDER_REVIEW: "InReview",
  APPROVED: "Submitted",
  REJECTED: "Disputed",
  CANCELLED: "Cancelled",
};
