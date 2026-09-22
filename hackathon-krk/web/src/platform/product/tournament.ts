import { PRODUCT } from "./constants";

export type QualifierResult = {
  userId: string;
  /** Lower is better. Null = did not finish all 3 problems. */
  totalTimeMs: number | null;
  problemsSolved: number;
};

export type RankedQualifier = QualifierResult & {
  place: number;
  assignment: "WORKER" | "REVIEWER" | "QUEUED" | "RELEASED" | "INCOMPLETE";
};

/**
 * Rank whoever clicked Enter. Field size is not fixed.
 * `reviewerCount` is how many reviewers the client chose for this task.
 * 0 means places 2 and 3 go to the standby queue for someone else's submit.
 */
export function rankTournament(
  entries: QualifierResult[],
  reviewerCount: number
): RankedQualifier[] {
  const finished = entries
    .filter(
      (e) =>
        e.problemsSolved >= PRODUCT.problemsPerQualifier &&
        e.totalTimeMs != null &&
        e.totalTimeMs > 0
    )
    .sort((a, b) => a.totalTimeMs! - b.totalTimeMs!);

  const unfinished = entries.filter((e) => !finished.includes(e));

  const ranked: RankedQualifier[] = finished.map((e, i) => {
    const place = i + 1;
    const standby = PRODUCT.standbyPlacesWhenClientSkipsReview;
    let assignment: RankedQualifier["assignment"] = "RELEASED";
    if (place === 1) assignment = "WORKER";
    else if (reviewerCount > 0 && place <= 1 + reviewerCount) {
      assignment = "REVIEWER";
    } else if (
      reviewerCount <= 0 &&
      (standby as readonly number[]).includes(place)
    ) {
      assignment = "QUEUED";
    }
    return { ...e, place, assignment };
  });

  for (const e of unfinished) {
    ranked.push({
      ...e,
      place: ranked.length + 1,
      assignment: "INCOMPLETE",
    });
  }

  return ranked;
}

/** A worker exists. Reviewer seats may still be filled from the queue. */
export function podiumReady(entries: QualifierResult[]): boolean {
  return rankTournament(entries, 0).some((e) => e.assignment === "WORKER");
}
