import type { AppMode, ActorRole, PlatformAction, TaskSnapshot } from "../types";

export type ProtectionContext = {
  action: PlatformAction;
  mode: AppMode;
  role: ActorRole;
  wallet: string | null;
  task?: TaskSnapshot | null;
  isOperator?: boolean;
};

export type Protection = {
  id: string;
  label: string;
  /**
   * Return a short reason to block, or null to allow.
   * Add new files under protections/ and register them — designers never touch these.
   */
  guard: (ctx: ProtectionContext) => string | null;
};
