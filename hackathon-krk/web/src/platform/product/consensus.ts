import { majorityOf } from "./constants";

export type ReviewBallot = {
  reviewerId: string;
  verdict: "APPROVED" | "REJECTED" | null;
  /** File path + 1-based line. Required for REJECTED. */
  vetoPath?: string | null;
  vetoLine?: number | null;
  dueAt: number;
  submittedAt: number | null;
  replaced: boolean;
};

export type ConsensusResult =
  | { status: "PENDING"; reason: string }
  | { status: "REVIEWER_TIMEOUT"; ghostReviewerIds: string[] }
  | { status: "APPROVED"; approvals: number; rejects: number }
  | { status: "REJECTED"; approvals: number; rejects: number };

export function vetoIsValid(ballot: ReviewBallot): boolean {
  if (ballot.verdict !== "REJECTED") return true;
  return Boolean(ballot.vetoPath && ballot.vetoPath.trim()) &&
    typeof ballot.vetoLine === "number" &&
    ballot.vetoLine > 0;
}

/** Ballots that count toward 2/3. Invalid vetoes are ignored. */
export function countableBallots(ballots: ReviewBallot[], now: number): ReviewBallot[] {
  return ballots.filter((b) => {
    if (b.replaced || !b.verdict || b.submittedAt == null) return false;
    if (b.submittedAt > b.dueAt) return false;
    if (!vetoIsValid(b)) return false;
    if (now < b.submittedAt) return false;
    return true;
  });
}

export function timedOutReviewers(ballots: ReviewBallot[], now: number): string[] {
  return ballots
    .filter(
      (b) =>
        !b.replaced &&
        b.submittedAt == null &&
        now >= b.dueAt
    )
    .map((b) => b.reviewerId);
}

/**
 * Majority of the panel the client chose.
 * A rejection without a tagged line does not count.
 * A reviewer past due is replaced before a decision.
 * reviewerCount 0 never reaches this function — that task has no review.
 */
export function evaluateConsensus(
  ballots: ReviewBallot[],
  now: number,
  reviewerCount: number
): ConsensusResult {
  const need = majorityOf(reviewerCount);
  const ghosts = timedOutReviewers(ballots, now);
  if (ghosts.length > 0) {
    return { status: "REVIEWER_TIMEOUT", ghostReviewerIds: ghosts };
  }

  const active = ballots.filter((b) => !b.replaced);
  if (active.length < reviewerCount) {
    return { status: "PENDING", reason: "Panel is short a reviewer" };
  }

  const counted = countableBallots(active, now);
  if (counted.length < need) {
    return { status: "PENDING", reason: "Waiting for a countable majority" };
  }

  const approvals = counted.filter((b) => b.verdict === "APPROVED").length;
  const rejects = counted.filter((b) => b.verdict === "REJECTED").length;

  if (approvals >= need) {
    return { status: "APPROVED", approvals, rejects };
  }
  if (rejects >= need) {
    return { status: "REJECTED", approvals, rejects };
  }
  return { status: "PENDING", reason: "No majority yet" };
}
