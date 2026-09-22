import type { ProductTaskState } from "./constants";

const EDGES: Record<ProductTaskState, ProductTaskState[]> = {
  QUALIFICATION: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["UNDER_REVIEW", "EMERGENCY_REQUEUE", "CANCELLED"],
  EMERGENCY_REQUEUE: ["IN_PROGRESS", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "UNDER_REVIEW"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransition(
  from: ProductTaskState,
  to: ProductTaskState
): boolean {
  return EDGES[from].includes(to);
}

export function assertTransition(
  from: ProductTaskState,
  to: ProductTaskState
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal task transition ${from} → ${to}`);
  }
}
