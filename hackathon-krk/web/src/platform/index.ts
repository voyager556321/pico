export { FLOW, STATUS_PIPELINE } from "./flow";
export { resolveRole, mySlotIndex } from "./roles";
export { getTaskCapabilities } from "./capabilities";
export {
  listProtections,
  registerProtection,
  checkAction,
  assertAction,
} from "./protections/registry";
export type {
  AppMode,
  ActorRole,
  ActorContext,
  PlatformAction,
  TaskSnapshot,
  TaskCapabilities,
} from "./types";
export type { Protection, ProtectionContext } from "./protections/types";

import type { TaskAccount } from "@/lib/accounts";
import type { TaskSnapshot } from "./types";

/** Map on-chain / demo task into platform snapshot. */
export function toTaskSnapshot(
  task: TaskAccount,
  opts?: { isDemo?: boolean }
): TaskSnapshot {
  return {
    publicKey: task.publicKey.toBase58(),
    client: task.client.toBase58(),
    status: task.status,
    slotCount: task.slotCount,
    reviewCount: task.reviewCount,
    activeSlot: task.activeSlot,
    hiringSlot: task.hiringSlot,
    slotHolders: task.slotHolders.map((h) => h.toBase58()),
    isDemo: opts?.isDemo,
  };
}
