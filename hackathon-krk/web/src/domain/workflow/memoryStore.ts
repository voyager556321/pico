import type { PayoutLine, WorkflowStore, WorkflowTask } from "./types";

const tasks = new Map<string, WorkflowTask>();
const ratings = new Map<string, number>();
const queue: string[] = [];
const payouts: { taskId: string; lines: PayoutLine[] }[] = [];

export function memoryWorkflowStore(): WorkflowStore {
  return {
    async getTask(taskId) {
      const row = tasks.get(taskId);
      return row ? structuredClone(row) : null;
    },
    async saveTask(task) {
      tasks.set(task.id, structuredClone(task));
    },
    async penalizeRating(userId, delta) {
      ratings.set(userId, (ratings.get(userId) ?? 1000) - delta);
    },
    async setReviewerFree() {
      /* availability lives with the queue in this adapter */
    },
    async setReviewerAssigned(userId) {
      const i = queue.indexOf(userId);
      if (i >= 0) queue.splice(i, 1);
    },
    async enqueueReviewer(userId) {
      if (!queue.includes(userId)) queue.push(userId);
    },
    async dequeueReviewer() {
      return queue.shift() ?? null;
    },
    async recordPayouts(taskId, lines) {
      payouts.push({ taskId, lines });
    },
  };
}

export function resetMemoryWorkflowStore() {
  tasks.clear();
  ratings.clear();
  queue.length = 0;
  payouts.length = 0;
}
