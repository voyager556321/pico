/**
 * FLOW.md encoded as constants — single source for product rules copy & checks.
 * On-chain still enforces escrow; this layer is the product brain for the app.
 */

export const FLOW = {
  timedTests: 3,
  /** team size = N reviews + 1 execution */
  teamSize: (reviewCount: number) => reviewCount + 1,
  slotNames: {
    0: "Execution Slot",
    1: "Primary Verification Slot",
    audit: "Audit Verification Slot",
  } as const,
  /** Clients never take timed qualification tests */
  clientsTakeTests: false,
  /** Hiring workspace mode never surfaces qualify UI */
  hiringModeTakesTests: false,
  ranking: "time_on_test_3_ascending" as const,
  payout: {
    bpsDenom: 10_000,
    note: "platform_fee = reward * fee_bps / 10_000; slot_i = net * slot_bps[i] / 10_000",
  },
} as const;

export const STATUS_PIPELINE = [
  "Qualifying",
  "Working",
  "InReview",
  "Submitted",
  "Paid",
] as const;
