import { PRODUCT } from "@/platform/product/constants";
import {
  evaluateConsensus,
  type ReviewBallot,
} from "@/platform/product/consensus";
import { assertTransition } from "@/platform/product/stateMachine";
import type { PayoutLine, WorkflowStore } from "./types";

export type ConsensusOutcome = {
  taskId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVIEWER_REPLACED";
  reason?: string;
  replacedReviewerIds?: string[];
  payouts?: PayoutLine[];
};

function bpsOf(amount: bigint, bps: number): bigint {
  return (amount * BigInt(bps)) / BigInt(10_000);
}

function reviewerPayouts(
  reviewerIds: string[],
  budget: bigint,
  reviewerBps: number,
  bountyBps: number,
  withBounty: boolean
): PayoutLine[] {
  const lines: PayoutLine[] = [];
  for (const userId of reviewerIds) {
    lines.push({
      userId,
      kind: "REVIEWER_FEE",
      amount: bpsOf(budget, reviewerBps),
    });
    if (withBounty) {
      lines.push({
        userId,
        kind: "REVIEWER_BOUNTY",
        amount: bpsOf(budget, bountyBps),
      });
    }
  }
  return lines;
}

async function replaceGhostReviewers(
  store: WorkflowStore,
  taskId: string,
  ballots: ReviewBallot[],
  ghostIds: string[],
  now: number
): Promise<ReviewBallot[]> {
  const next = ballots.map((b) =>
    ghostIds.includes(b.reviewerId) ? { ...b, replaced: true } : b
  );
  for (const reviewerId of ghostIds) {
    await store.penalizeRating(reviewerId, PRODUCT.ghostRatingPenalty);
    await store.setReviewerFree(reviewerId);
    const incoming = await store.dequeueReviewer();
    if (!incoming) continue;
    await store.setReviewerAssigned(incoming);
    next.push({
      reviewerId: incoming,
      verdict: null,
      dueAt: now + PRODUCT.reviewTimeoutMs,
      submittedAt: null,
      replaced: false,
    });
  }
  return next;
}

/**
 * Aggregate the live panel.
 * Approval needs 2 of 3 countable votes.
 * A rejection without a tagged line is discarded.
 * A reviewer past `dueAt` is swapped from the FIFO queue; no payout yet.
 */
export async function processReviewConsensus(
  store: WorkflowStore,
  taskId: string,
  now: number
): Promise<ConsensusOutcome> {
  const task = await store.getTask(taskId);
  if (!task) throw new Error("Task not found");
  if (task.state !== "UNDER_REVIEW") {
    throw new Error(`Consensus requires UNDER_REVIEW, got ${task.state}`);
  }

  if (task.reviewerCount <= 0) {
    return {
      taskId,
      status: "PENDING",
      reason: "Client did not ask for review on this task",
    };
  }

  const verdict = evaluateConsensus(task.ballots, now, task.reviewerCount);

  if (verdict.status === "REVIEWER_TIMEOUT") {
    task.ballots = await replaceGhostReviewers(
      store,
      taskId,
      task.ballots,
      verdict.ghostReviewerIds,
      now
    );
    task.reviewerIds = task.ballots
      .filter((b) => !b.replaced)
      .map((b) => b.reviewerId);
    assertTransition(task.state, "UNDER_REVIEW");
    await store.saveTask(task);
    return {
      taskId,
      status: "REVIEWER_REPLACED",
      replacedReviewerIds: verdict.ghostReviewerIds,
    };
  }

  if (verdict.status === "PENDING") {
    return { taskId, status: "PENDING", reason: verdict.reason };
  }

  const seated = task.ballots.filter((b) => !b.replaced).map((b) => b.reviewerId);

  if (verdict.status === "APPROVED") {
    assertTransition(task.state, "APPROVED");
    task.state = "APPROVED";
    const payouts: PayoutLine[] = [
      {
        userId: task.workerId ?? "",
        kind: "WORKER_BUDGET" as const,
        amount: task.workerBudget,
      },
      ...reviewerPayouts(
        seated,
        task.workerBudget,
        task.reviewerBps,
        task.bountyBps,
        task.ghostPenaltyActive
      ),
    ].filter((line) => line.userId && line.amount > BigInt(0));
    await store.recordPayouts(taskId, payouts);
    for (const reviewerId of seated) await store.setReviewerFree(reviewerId);
    await store.saveTask(task);
    return { taskId, status: "APPROVED", payouts };
  }

  assertTransition(task.state, "REJECTED");
  task.state = "REJECTED";
  for (const reviewerId of seated) await store.setReviewerFree(reviewerId);
  await store.saveTask(task);
  return {
    taskId,
    status: "REJECTED",
    reason: `${verdict.rejects} rejections vs ${verdict.approvals} approvals`,
  };
}
