import { FLOW } from "./flow";
import { mySlotIndex, resolveRole } from "./roles";
import { blockMap } from "./protections/registry";
import type {
  ActorContext,
  PlatformAction,
  TaskCapabilities,
} from "./types";

const ALL_ACTIONS: PlatformAction[] = [
  "qualify",
  "create_task",
  "cancel_task",
  "decline_slot",
  "submit_execution",
  "submit_verification",
  "reject_verification",
  "finalize_and_pay",
  "assign_team",
  "fill_slot",
  "raise_dispute",
  "resolve_dispute",
];

/**
 * Single entry for UI: what may be shown for this wallet + mode + task.
 * Protections are applied here — designer only reads booleans / messages.
 */
export function getTaskCapabilities(ctx: ActorContext): TaskCapabilities {
  const role = resolveRole(ctx);
  const task = ctx.task ?? null;
  const mySlot = mySlotIndex(task, ctx.wallet);
  const isOperator = Boolean(
    ctx.operator && ctx.wallet && ctx.operator === ctx.wallet
  );

  const blocks = blockMap(
    {
      mode: ctx.mode,
      role,
      wallet: ctx.wallet,
      task,
      isOperator,
    },
    ALL_ACTIONS
  );

  const open = (a: PlatformAction) => !blocks[a];

  const isClient = role === "client";
  const showClientWaitingQualify = Boolean(
    task?.status === "Qualifying" &&
      (isClient || (!FLOW.hiringModeTakesTests && ctx.mode === "hiring"))
  );

  return {
    role,
    mySlot,
    canQualify: open("qualify"),
    canCancel: open("cancel_task"),
    canDecline: open("decline_slot"),
    canSubmitExecution: open("submit_execution"),
    canSubmitVerification: open("submit_verification"),
    canFinalize: open("finalize_and_pay"),
    canAssignTeam: open("assign_team"),
    canFillSlot: open("fill_slot"),
    canRaiseDispute: open("raise_dispute"),
    showClientWaitingQualify,
    blocks,
  };
}
