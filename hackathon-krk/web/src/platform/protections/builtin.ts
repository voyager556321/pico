import { FLOW } from "../flow";
import type { Protection } from "./types";

/** Clients never take timed tests (FLOW). */
export const clientsSkipQualify: Protection = {
  id: "clients_skip_qualify",
  label: "Clients skip qualification tests",
  guard: (ctx) => {
    if (ctx.action !== "qualify") return null;
    if (ctx.role === "client") return "Clients don’t take timed tests";
    if (!FLOW.hiringModeTakesTests && ctx.mode === "hiring") {
      return "Hiring mode has no qualification tests";
    }
    return null;
  },
};

/** Demo tasks: no on-chain txs (local stubs only). */
export const demoBlocksChain: Protection = {
  id: "demo_blocks_chain",
  label: "Demo tasks block chain writes",
  guard: (ctx) => {
    if (!ctx.task?.isDemo) return null;
    const chainOnly: typeof ctx.action[] = [
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
    if (chainOnly.includes(ctx.action)) {
      return "Demo task — use Demo stubs, not chain";
    }
    return null;
  },
};

/** Status + seat gates from FLOW / on-chain SM. */
export const statusSeatGates: Protection = {
  id: "status_seat_gates",
  label: "Status and seat eligibility",
  guard: (ctx) => {
    const t = ctx.task;
    if (!t) return null;
    const slot = t.slotHolders.findIndex((h) => h === ctx.wallet);

    switch (ctx.action) {
      case "qualify":
        if (t.status !== "Qualifying") return "Task is not Qualifying";
        return null;
      case "cancel_task":
        if (ctx.role !== "client") return "Only client can cancel";
        if (t.status !== "Qualifying") return "Cancel only while Qualifying";
        return null;
      case "submit_execution":
        if (t.status !== "Working") return "Not in Working";
        if (slot !== 0) return "Only Execution Slot can submit";
        return null;
      case "submit_verification":
      case "reject_verification":
        if (t.status !== "InReview") return "Not in review";
        if (slot !== t.activeSlot) return "Not your active verification slot";
        return null;
      case "decline_slot":
        if (
          t.status !== "Working" &&
          t.status !== "InReview" &&
          t.status !== "HiringSlot"
        ) {
          return "Cannot decline in this status";
        }
        if (t.status === "Working" && slot !== 0) {
          return "Only Execution can decline while Working";
        }
        if (t.status === "InReview" && slot !== t.activeSlot) {
          return "Only active verifier can decline";
        }
        if (slot < 0) return "Not a slot holder";
        return null;
      case "finalize_and_pay":
        if (t.status !== "Submitted") return "Not Submitted yet";
        return null;
      case "assign_team":
        if (t.status !== "Qualifying") return "Assign only while Qualifying";
        if (!ctx.isOperator) return "Operator only";
        return null;
      case "fill_slot":
        if (t.status !== "HiringSlot") return "Not hiring a seat";
        if (!ctx.isOperator) return "Operator only";
        return null;
      case "raise_dispute":
        if (
          !["Working", "InReview", "Submitted", "HiringSlot"].includes(t.status)
        ) {
          return "Cannot dispute in this status";
        }
        if (ctx.role !== "client" && slot < 0) return "Unauthorized";
        return null;
      default:
        return null;
    }
  },
};

/**
 * Placeholder for future protections (KYC, stake, rate limits, anti-cheat…).
 * Keep registered but inactive — replace `guard` body when ready.
 */
export const futureProtectionStub: Protection = {
  id: "future_protection_stub",
  label: "Reserved — add stake / KYC / anti-cheat here",
  guard: () => null,
};
