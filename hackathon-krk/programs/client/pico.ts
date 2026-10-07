/**
 * Pico escrow client. One worker, optional reviewer.
 * Deploy programs/pico/src/lib.rs, then sync PROGRAM_ID + IDL.
 *
 * The Next app under web/ still speaks the old slot layout.
 * Do not point it at this program until that client is rewritten.
 */
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export const PROGRAM_ID = new PublicKey(
  "6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j"
);

export const DEVNET_USDC = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

/** Reviewer fee used by the current UI: 10% of the worker reward, on top. */
export const REVIEWER_FEE_BPS = 1000;

export function usdc(amount: number): BN {
  return new BN(Math.round(amount * 1_000_000));
}

export function configPda(programId = PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
}

export function credentialPda(
  worker: PublicKey,
  skillId: number,
  programId = PROGRAM_ID
): PublicKey {
  const skill = Buffer.alloc(2);
  skill.writeUInt16LE(skillId, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), worker.toBuffer(), skill],
    programId
  )[0];
}

export function taskPda(
  client: PublicKey,
  taskNonce: BN | number,
  programId = PROGRAM_ID
): PublicKey {
  const nonce =
    typeof taskNonce === "number"
      ? (() => {
          const b = Buffer.alloc(8);
          b.writeBigUInt64LE(BigInt(taskNonce), 0);
          return b;
        })()
      : taskNonce.toArrayLike(Buffer, "le", 8);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("task"), client.toBuffer(), nonce],
    programId
  )[0];
}

export function vaultAuthorityPda(
  task: PublicKey,
  programId = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), task.toBuffer()],
    programId
  );
}

export function vaultAta(
  vaultAuthority: PublicKey,
  mint: PublicKey = DEVNET_USDC
) {
  return getAssociatedTokenAddressSync(mint, vaultAuthority, true);
}

type PicoProgram = Program;

function nonceOf(taskNonce: BN | number): BN {
  return typeof taskNonce === "number" ? new BN(taskNonce) : taskNonce;
}

function taskAccounts(client: PublicKey, taskNonce: BN | number, mint = DEVNET_USDC) {
  const task = taskPda(client, taskNonce);
  const [vaultAuthority] = vaultAuthorityPda(task);
  return { task, vaultAuthority, vault: vaultAta(vaultAuthority, mint) };
}

export async function initializeConfig(
  program: PicoProgram,
  authority: PublicKey,
  operator: PublicKey,
  treasuryAta: PublicKey,
  feeBps: number,
  mint: PublicKey = DEVNET_USDC
) {
  return program.methods
    .initializeConfig(operator, feeBps)
    .accounts({
      authority,
      config: configPda(),
      mint,
      treasuryTokenAccount: treasuryAta,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function createTask(
  program: PicoProgram,
  client: PublicKey,
  skillId: number,
  minLevel: number,
  reward: BN,
  taskNonce: BN | number,
  withReviewer: boolean,
  findingDeadline: BN,
  clientUsdcAta: PublicKey,
  mint: PublicKey = DEVNET_USDC
) {
  const nonce = nonceOf(taskNonce);
  const { task, vaultAuthority, vault } = taskAccounts(client, nonce, mint);
  return program.methods
    .createTask(skillId, minLevel, reward, nonce, withReviewer, findingDeadline)
    .accounts({
      client,
      config: configPda(),
      mint,
      task,
      vaultAuthority,
      vault,
      clientTokenAccount: clientUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function claimTask(
  program: PicoProgram,
  worker: PublicKey,
  client: PublicKey,
  taskNonce: BN | number,
  skillId: number,
  workDeadline: BN
) {
  return program.methods
    .claimTask(workDeadline)
    .accounts({
      worker,
      task: taskPda(client, taskNonce),
      credential: credentialPda(worker, skillId),
    })
    .rpc();
}

export async function submitWork(
  program: PicoProgram,
  worker: PublicKey,
  client: PublicKey,
  taskNonce: BN | number,
  workHash: number[]
) {
  return program.methods
    .submitWork(workHash)
    .accounts({
      worker,
      task: taskPda(client, taskNonce),
    })
    .rpc();
}

export async function acceptWork(
  program: PicoProgram,
  client: PublicKey,
  worker: PublicKey,
  taskNonce: BN | number,
  clientUsdcAta: PublicKey,
  workerUsdcAta: PublicKey,
  mint: PublicKey = DEVNET_USDC
) {
  const { task, vaultAuthority, vault } = taskAccounts(client, taskNonce, mint);
  return program.methods
    .acceptWork()
    .accounts({
      client,
      task,
      vaultAuthority,
      vault,
      workerTokenAccount: workerUsdcAta,
      clientTokenAccount: clientUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function passReview(
  program: PicoProgram,
  reviewer: PublicKey,
  client: PublicKey,
  worker: PublicKey,
  taskNonce: BN | number,
  clientUsdcAta: PublicKey,
  workerUsdcAta: PublicKey,
  reviewerUsdcAta: PublicKey,
  mint: PublicKey = DEVNET_USDC
) {
  const { task, vaultAuthority, vault } = taskAccounts(client, taskNonce, mint);
  return program.methods
    .passReview()
    .accounts({
      reviewer,
      task,
      vaultAuthority,
      vault,
      workerTokenAccount: workerUsdcAta,
      reviewerTokenAccount: reviewerUsdcAta,
      clientTokenAccount: clientUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function declineChange(
  program: PicoProgram,
  worker: PublicKey,
  client: PublicKey,
  taskNonce: BN | number,
  clientUsdcAta: PublicKey,
  workerUsdcAta: PublicKey,
  mint: PublicKey = DEVNET_USDC
) {
  const { task, vaultAuthority, vault } = taskAccounts(client, taskNonce, mint);
  return program.methods
    .declineChange()
    .accounts({
      worker,
      task,
      vaultAuthority,
      vault,
      workerTokenAccount: workerUsdcAta,
      clientTokenAccount: clientUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}
