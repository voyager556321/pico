import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { TaskAccount } from "@/lib/accounts";
import { sha256Bytes, loadTaskMeta, saveTaskMeta } from "@/lib/program";
import {
  assertAction,
  toTaskSnapshot,
  type AppMode,
  type ActorRole,
  type PlatformAction,
} from "@/platform";
import { isDemoTask } from "@/lib/demo";

export async function submitVerification(opts: {
  program: Program;
  wallet: PublicKey;
  task: TaskAccount;
  taskId: string;
  notes: string;
  approve: boolean;
  mode: AppMode;
  role: ActorRole;
}) {
  const action: PlatformAction = opts.approve
    ? "submit_verification"
    : "reject_verification";
  assertAction({
    action,
    mode: opts.mode,
    role: opts.role,
    wallet: opts.wallet.toBase58(),
    task: toTaskSnapshot(opts.task, {
      isDemo: isDemoTask(opts.task.publicKey),
    }),
  });
  const reviewHash = await sha256Bytes(opts.notes.trim());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = opts.program.methods as any;
  if (opts.approve) {
    await methods
      .submitVerification(reviewHash)
      .accounts({ verifier: opts.wallet, task: opts.task.publicKey })
      .rpc();
  } else {
    await methods
      .rejectVerification(reviewHash)
      .accounts({ verifier: opts.wallet, task: opts.task.publicKey })
      .rpc();
  }
  const meta = loadTaskMeta(opts.taskId);
  const active = opts.task.activeSlot;
  saveTaskMeta(opts.taskId, {
    brief: meta?.brief ?? "",
    result: meta?.result,
    explanation: meta?.explanation,
    reviews: { ...(meta?.reviews ?? {}), [String(active)]: opts.notes.trim() },
  });
}
