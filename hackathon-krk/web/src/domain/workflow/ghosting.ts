import { PRODUCT } from "@/platform/product/constants";
import { assertTransition } from "@/platform/product/stateMachine";
import type { WorkflowStore } from "./types";

export type GhostingResult = {
  taskId: string;
  penalizedWorkerId: string;
  releasedReviewerIds: string[];
  replacementWorkerId: string | null;
  state: "EMERGENCY_REQUEUE" | "IN_PROGRESS";
};

/**
 * Worker missed the execution deadline.
 * Reviewers return to FREE / FIFO so they can take other tasks.
 * The next qualifier (4th, then 5th) becomes the worker when one exists.
 * Does not touch the Anchor program — chain seat changes stay a later step.
 */
export async function handleWorkerGhosting(
  store: WorkflowStore,
  taskId: string,
  now: number
): Promise<GhostingResult> {
  const task = await store.getTask(taskId);
  if (!task) throw new Error("Task not found");
  if (task.state !== "IN_PROGRESS") {
    throw new Error(`Cannot ghost from ${task.state}`);
  }
  if (!task.workerId) throw new Error("No active worker");
  if (task.executionDeadline != null && now < task.executionDeadline) {
    throw new Error("Execution deadline has not passed");
  }

  const penalizedWorkerId = task.workerId;
  await store.penalizeRating(penalizedWorkerId, PRODUCT.ghostRatingPenalty);

  const releasedReviewerIds = [...task.reviewerIds];
  for (const reviewerId of releasedReviewerIds) {
    await store.setReviewerFree(reviewerId);
    await store.enqueueReviewer(reviewerId);
  }

  const [replacement, ...rest] = task.replacementWorkerIds;
  assertTransition(task.state, "EMERGENCY_REQUEUE");

  if (!replacement) {
    task.state = "EMERGENCY_REQUEUE";
    task.workerId = null;
    task.reviewerIds = [];
    task.ballots = [];
    task.ghostPenaltyActive = true;
    task.executionDeadline = null;
    task.activeSubmissionId = null;
    task.replacementWorkerIds = rest;
    await store.saveTask(task);
    return {
      taskId,
      penalizedWorkerId,
      releasedReviewerIds,
      replacementWorkerId: null,
      state: "EMERGENCY_REQUEUE",
    };
  }

  assertTransition("EMERGENCY_REQUEUE", "IN_PROGRESS");
  task.state = "IN_PROGRESS";
  task.workerId = replacement;
  task.replacementWorkerIds = rest;
  task.reviewerIds = [];
  task.ballots = [];
  task.ghostPenaltyActive = true;
  task.activeSubmissionId = null;
  task.executionDeadline = now + 24 * 60 * 60 * 1000;
  await store.saveTask(task);

  return {
    taskId,
    penalizedWorkerId,
    releasedReviewerIds,
    replacementWorkerId: replacement,
    state: "IN_PROGRESS",
  };
}
