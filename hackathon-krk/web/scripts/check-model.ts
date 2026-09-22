/**
 * One simulation pass in the terminal.
 *   yarn model
 */
import { simulate } from "../src/domain/workflow/simulate";

const report = simulate({
  seed: Number(process.argv[2] ?? 7),
  botCount: 8,
  taskCount: 4,
  rounds: 3,
});

for (const round of report.rounds) {
  console.log(`\n=== Раунд ${round.index} ===`);
  for (const task of round.tasks) {
    console.log(
      `\n${task.id} ${task.kind} rating>=${task.requiredRating} reviewers=${task.reviewerCount}`
    );
    console.log(`  кліки ${task.clicks.length}/${task.eligible}`);
    for (const click of task.clicks) {
      console.log(
        `  ${click.id.padEnd(8)} ${click.assignment.padEnd(10)} ${click.timeMs ?? "—"}`
      );
    }
    for (const note of task.notes) console.log(`  ${note}`);
  }
}
