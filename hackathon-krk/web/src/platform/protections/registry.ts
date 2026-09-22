import {
  clientsSkipQualify,
  demoBlocksChain,
  futureProtectionStub,
  statusSeatGates,
} from "./builtin";
import type { Protection, ProtectionContext } from "./types";
import type { PlatformAction } from "../types";

/**
 * Ordered list of protections. Append new guards here —
 * they automatically feed capabilities + assertAction.
 */
const REGISTRY: Protection[] = [
  clientsSkipQualify,
  demoBlocksChain,
  statusSeatGates,
  futureProtectionStub,
];

export function listProtections(): Protection[] {
  return [...REGISTRY];
}

export function registerProtection(p: Protection) {
  if (REGISTRY.some((x) => x.id === p.id)) {
    throw new Error(`Protection already registered: ${p.id}`);
  }
  REGISTRY.push(p);
}

/** First blocking reason, or null if all pass. */
export function checkAction(ctx: ProtectionContext): string | null {
  for (const p of REGISTRY) {
    const reason = p.guard(ctx);
    if (reason) return reason;
  }
  return null;
}

export function assertAction(ctx: ProtectionContext): void {
  const reason = checkAction(ctx);
  if (reason) throw new Error(reason);
}

export function blockMap(
  base: Omit<ProtectionContext, "action">,
  actions: PlatformAction[]
): Partial<Record<PlatformAction, string>> {
  const out: Partial<Record<PlatformAction, string>> = {};
  for (const action of actions) {
    const reason = checkAction({ ...base, action });
    if (reason) out[action] = reason;
  }
  return out;
}
