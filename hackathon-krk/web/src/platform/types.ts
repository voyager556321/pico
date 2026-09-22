import type { TaskStatusName } from "@/lib/constants";

/** Workspace mode toggle (Hiring | Working). */
export type AppMode = "hiring" | "working";

/** Who the current wallet is relative to a task. */
export type ActorRole =
  | "guest"
  | "client"
  | "execution"
  | "verifier"
  | "operator"
  | "candidate";

/** Actions the platform knows about (extend when adding features). */
export type PlatformAction =
  | "qualify"
  | "create_task"
  | "cancel_task"
  | "decline_slot"
  | "submit_execution"
  | "submit_verification"
  | "reject_verification"
  | "finalize_and_pay"
  | "assign_team"
  | "fill_slot"
  | "raise_dispute"
  | "resolve_dispute";

/** Minimal task snapshot for rules (no Anchor types required). */
export type TaskSnapshot = {
  publicKey: string;
  client: string;
  status: TaskStatusName;
  slotCount: number;
  reviewCount: number;
  activeSlot: number;
  hiringSlot: number;
  slotHolders: string[];
  isDemo?: boolean;
};

export type ActorContext = {
  mode: AppMode;
  wallet: string | null;
  /** Config operator pubkey if known */
  operator?: string | null;
  task?: TaskSnapshot | null;
};

/** What the UI is allowed to show / enable for this actor + task. */
export type TaskCapabilities = {
  role: ActorRole;
  mySlot: number; // -1 if none
  canQualify: boolean;
  canCancel: boolean;
  canDecline: boolean;
  canSubmitExecution: boolean;
  canSubmitVerification: boolean;
  canFinalize: boolean;
  canAssignTeam: boolean;
  canFillSlot: boolean;
  canRaiseDispute: boolean;
  /** Client waiting for workers — no qualify CTA */
  showClientWaitingQualify: boolean;
  /** Human-readable blocks from protections (action → reason) */
  blocks: Partial<Record<PlatformAction, string>>;
};
