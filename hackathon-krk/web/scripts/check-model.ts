/**
 * Walk the product model in the terminal.
 *   yarn model
 */
import { runModelScenarios } from "../src/domain/workflow/scenarios";

async function main() {
  const blocks = await runModelScenarios();
  for (const block of blocks) {
    console.log(`\n— ${block.title}`);
    console.log(block.note);
    for (const row of block.rows ?? []) {
      console.log(
        `  #${row.place} ${row.userId.padEnd(4)} ${row.assignment.padEnd(10)} ${row.timeMs ?? "—"} ms`
      );
    }
    for (const item of block.lines) console.log(`  ${item}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
