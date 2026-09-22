/**
 * When a worker submits:
 * - client asked for reviewers → those seated people are notified for THIS task
 * - client asked for none → this submit notifies nobody here.
 *   Places 2 and 3 already sit on the standby queue and are notified
 *   only when some other worker submits and the queue seats them.
 */
export function notifyOnWorkerSubmit(input: {
  reviewerCount: number;
  seatedReviewerIds: string[];
}): { reviewThisTask: boolean; notifyUserIds: string[] } {
  if (input.reviewerCount <= 0) {
    return { reviewThisTask: false, notifyUserIds: [] };
  }
  return {
    reviewThisTask: true,
    notifyUserIds: input.seatedReviewerIds.slice(0, input.reviewerCount),
  };
}
