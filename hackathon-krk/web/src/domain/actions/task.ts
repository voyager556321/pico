import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TREASURY_ATA, USDC_MINT } from "@/lib/constants";
import { configPda, vaultAuthorityPda } from "@/lib/pdas";
import type { TaskAccount } from "@/lib/accounts";
import {
  assertAction,
  toTaskSnapshot,
  type AppMode,
  type ActorRole,
  type PlatformAction,
} from "@/platform";
import { isDemoTask } from "@/lib/demo";

export type TaskActionCtx = {
  program: Program;
  wallet: PublicKey;
  task: TaskAccount;
  mode: AppMode;
  role: ActorRole;
  isOperator?: boolean;
};

function enforce(action: PlatformAction, ctx: TaskActionCtx) {
  assertAction({
    action,
    mode: ctx.mode,
    role: ctx.role,
    wallet: ctx.wallet.toBase58(),
    task: toTaskSnapshot(ctx.task, {
      isDemo: isDemoTask(ctx.task.publicKey),
    }),
    isOperator: ctx.isOperator,
  });
}

export async function declineSlot(ctx: TaskActionCtx) {
  enforce("decline_slot", ctx);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ctx.program.methods as any)
    .declineSlot()
    .accounts({ holder: ctx.wallet, task: ctx.task.publicKey })
    .rpc();
}

export async function cancelTask(ctx: TaskActionCtx) {
  enforce("cancel_task", ctx);
  const [vaultAuthority] = vaultAuthorityPda(ctx.task.publicKey);
  const clientAta = getAssociatedTokenAddressSync(USDC_MINT, ctx.wallet);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ctx.program.methods as any)
    .cancelTask()
    .accounts({
      client: ctx.wallet,
      task: ctx.task.publicKey,
      vaultAuthority,
      vault: ctx.task.vault,
      clientTokenAccount: clientAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function finalizeAndPay(ctx: TaskActionCtx) {
  enforce("finalize_and_pay", ctx);
  const [vaultAuthority] = vaultAuthorityPda(ctx.task.publicKey);
  const slotAtas = [];
  for (let i = 0; i < ctx.task.slotCount; i++) {
    slotAtas.push({
      pubkey: getAssociatedTokenAddressSync(USDC_MINT, ctx.task.slotHolders[i]),
      isWritable: true,
      isSigner: false,
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ctx.program.methods as any)
    .finalizeAndPay()
    .accounts({
      payerSig: ctx.wallet,
      config: configPda(),
      task: ctx.task.publicKey,
      vaultAuthority,
      vault: ctx.task.vault,
      treasuryTokenAccount: TREASURY_ATA,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(slotAtas)
    .rpc();
}
