import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { MAX_SLOTS } from "@/lib/constants";
import { configPda } from "@/lib/pdas";
import type { TaskAccount } from "@/lib/accounts";
import { ZERO, loadQualifyBoard, podiumFromBoard } from "@/lib/program";
import {
  assertAction,
  toTaskSnapshot,
  type AppMode,
  type ActorRole,
} from "@/platform";
import { isDemoTask } from "@/lib/demo";

export async function assignTeamFromBoard(opts: {
  program: Program;
  wallet: PublicKey;
  task: TaskAccount;
  mode: AppMode;
  role: ActorRole;
  isOperator?: boolean;
}) {
  assertAction({
    action: "assign_team",
    mode: opts.mode,
    role: opts.role,
    wallet: opts.wallet.toBase58(),
    task: toTaskSnapshot(opts.task, {
      isDemo: isDemoTask(opts.task.publicKey),
    }),
    isOperator: opts.isOperator,
  });
  const board = loadQualifyBoard(opts.task.publicKey.toBase58());
  const podium = podiumFromBoard(board, opts.task.slotCount);
  if (!podium) {
    throw new Error(
      `Need ≥ ${opts.task.slotCount} finishers on local qualify board`
    );
  }
  const holders: PublicKey[] = [];
  const times: number[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    if (i < opts.task.slotCount) {
      holders.push(new PublicKey(podium.holders[i]));
      const raw = podium.timesMs[i];
      times.push(
        i === 0 ? Math.max(1, raw) : Math.max(raw, times[i - 1] + 1)
      );
    } else {
      holders.push(ZERO);
      times.push(0);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (opts.program.methods as any)
    .assignTeam(holders, times)
    .accounts({
      operator: opts.wallet,
      config: configPda(),
      task: opts.task.publicKey,
    })
    .rpc();
}

export async function fillHiringSlot(opts: {
  program: Program;
  wallet: PublicKey;
  task: TaskAccount;
  newHolder: string;
  timeMs: number;
  mode: AppMode;
  role: ActorRole;
  isOperator?: boolean;
}) {
  assertAction({
    action: "fill_slot",
    mode: opts.mode,
    role: opts.role,
    wallet: opts.wallet.toBase58(),
    task: toTaskSnapshot(opts.task, {
      isDemo: isDemoTask(opts.task.publicKey),
    }),
    isOperator: opts.isOperator,
  });
  const newHolder = new PublicKey(opts.newHolder.trim());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (opts.program.methods as any)
    .fillSlot(opts.task.hiringSlot, opts.timeMs || 1)
    .accounts({
      operator: opts.wallet,
      config: configPda(),
      task: opts.task.publicKey,
      newHolder,
    })
    .rpc();
}
