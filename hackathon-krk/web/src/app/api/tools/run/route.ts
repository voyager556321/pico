import { NextResponse } from "next/server";

/** Legacy AI tool metering — retired when Pico moved to task escrow. */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "AI tool debit API retired. Use /app task escrow (create_task → claim → verify).",
    },
    { status: 410 }
  );
}
