import { PRODUCT } from "./constants";

export type TaskKind = "PAID" | "PRACTICE";

export function levelForRating(rating: number): number {
  let level: number = PRODUCT.levels[0].level;
  for (const band of PRODUCT.levels) {
    if (rating >= band.minRating) level = band.level;
  }
  return level;
}

/** Paid and practice tasks both gate the Enter button on rating. */
export function canEnterTask(rating: number, requiredRating: number): boolean {
  return rating >= requiredRating;
}

/**
 * Practice reward. Only a fully solved set moves the rating.
 * Faster than PRODUCT.practice.fastUnderMs adds a speed bonus.
 * Paid tasks do not use this — they pay the posted budget.
 */
export function practiceRatingDelta(input: {
  solved: boolean;
  totalTimeMs: number | null;
}): number {
  if (!input.solved) return 0;
  let delta = PRODUCT.practice.solveBonus;
  if (
    input.totalTimeMs != null &&
    input.totalTimeMs > 0 &&
    input.totalTimeMs <= PRODUCT.practice.fastUnderMs
  ) {
    delta += PRODUCT.practice.fastBonus;
  }
  return delta;
}
