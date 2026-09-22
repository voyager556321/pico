import type { ActorContext, ActorRole, TaskSnapshot } from "./types";

export function mySlotIndex(
  task: TaskSnapshot | null | undefined,
  wallet: string | null
): number {
  if (!task || !wallet) return -1;
  for (let i = 0; i < task.slotCount; i++) {
    if (task.slotHolders[i] === wallet) return i;
  }
  return -1;
}

export function resolveRole(ctx: ActorContext): ActorRole {
  const { wallet, task, mode, operator } = ctx;
  if (!wallet) return "guest";

  if (operator && wallet === operator) {
    // Operator may also be client/slot — prefer operator for admin actions,
    // but role for task UI still reflects seat when viewing a task.
  }

  if (!task) {
    return mode === "hiring" ? "client" : "candidate";
  }

  if (wallet === task.client) return "client";

  const slot = mySlotIndex(task, wallet);
  if (slot === 0) return "execution";
  if (slot > 0) return "verifier";

  if (task.status === "Qualifying") return "candidate";
  return "guest";
}
