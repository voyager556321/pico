import type { ProductTaskState } from "@/platform/product/constants";
import type { ReviewBallot } from "@/platform/product/consensus";

export type ReviewFunding = "CLIENT" | "POOL";

export type WorkflowTask = {
  id: string;
  state: ProductTaskState;
  workerBudget: bigint;
  reviewFunding: ReviewFunding;
  reviewerBps: number;
  bountyBps: number;
  workerId: string | null;
  /** How many reviewers the client chose. 0 = podium 2–3 wait for another task. */
  reviewerCount: number;
  /** Next replacement candidates, best first (4th place, then queue). */
  replacementWorkerIds: string[];
  /** Reviewers seated on this task. Empty while they are FREE. */
  reviewerIds: string[];
  ghostPenaltyActive: boolean;
  executionDeadline: number | null;
  activeSubmissionId: string | null;
  ballots: ReviewBallot[];
};

export type PayoutLine = {
  userId: string;
  kind: "WORKER_BUDGET" | "REVIEWER_FEE" | "REVIEWER_BOUNTY";
  amount: bigint;
};

export type WorkflowStore = {
  getTask(taskId: string): Promise<WorkflowTask | null>;
  saveTask(task: WorkflowTask): Promise<void>;
  penalizeRating(userId: string, delta: number): Promise<void>;
  setReviewerFree(userId: string): Promise<void>;
  setReviewerAssigned(userId: string): Promise<void>;
  enqueueReviewer(userId: string): Promise<void>;
  dequeueReviewer(): Promise<string | null>;
  recordPayouts(taskId: string, lines: PayoutLine[]): Promise<void>;
};
