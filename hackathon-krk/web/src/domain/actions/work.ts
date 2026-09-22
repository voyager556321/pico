import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { TaskAccount } from "@/lib/accounts";
import { sha256Bytes, loadTaskMeta, saveTaskMeta } from "@/lib/program";
import {
  assertAction,
  toTaskSnapshot,
  type AppMode,
  type ActorRole,
} from "@/platform";
import { isDemoTask } from "@/lib/demo";

export async function submitExecution(opts: {
  program: Program;
  wallet: PublicKey;
  task: TaskAccount;
  taskId: string;
  result: string;
  explanation: string;
  mode: AppMode;
  role: ActorRole;
}) {
  assertAction({
    action: "submit_execution",
    mode: opts.mode,
    role: opts.role,
    wallet: opts.wallet.toBase58(),
    task: toTaskSnapshot(opts.task, {
      isDemo: isDemoTask(opts.task.publicKey),
    }),
  });
  const resultHash = await sha256Bytes(opts.result.trim());
  const explanationHash = await sha256Bytes(opts.explanation.trim());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (opts.program.methods as any)
    .submitExecution(resultHash, explanationHash)
    .accounts({ executor: opts.wallet, task: opts.task.publicKey })
    .rpc();
  const meta = loadTaskMeta(opts.taskId);
  saveTaskMeta(opts.taskId, {
    brief: meta?.brief ?? "",
    result: opts.result.trim(),
    explanation: opts.explanation.trim(),
    reviews: meta?.reviews,
    qualifyProblems: meta?.qualifyProblems,
  });
}
