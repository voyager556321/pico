/**
 * Pico slot-network client helpers.
 * Deploy programs/pico/src/lib.rs, then sync PROGRAM_ID + IDL.
 *
 * Flow: Qualifying → assign_team → Working → InReview chain → Submitted → finalize_and_pay
 * See hackathon-krk/FLOW.md
 */
import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
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

export const MAX_SLOTS = 4;

export function usdc(amount: number): BN {
  return new BN(Math.round(amount * 1_000_000));
}

/** e.g. N=2 reviews → [7000, 2000, 1000, 0] */
export function slotBps(parts: number[]): number[] {
  const out = [0, 0, 0, 0];
  let sum = 0;
  for (let i = 0; i < parts.length && i < MAX_SLOTS; i++) {
    out[i] = parts[i];
    sum += parts[i];
  }
  if (sum !== 10_000) {
    throw new Error(`slot bps must sum to 10000, got ${sum}`);
  }
  return out;
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
  reward: BN,
  deadlineTs: BN,
  taskNonce: BN | number,
  reviewCount: number,
  slotBpsArr: number[],
  clientUsdcAta: PublicKey,
  mint: PublicKey = DEVNET_USDC
) {
  const nonce = typeof taskNonce === "number" ? new BN(taskNonce) : taskNonce;
  const task = taskPda(client, nonce);
  const [vaultAuthority] = vaultAuthorityPda(task);
  const vault = vaultAta(vaultAuthority, mint);
  const bps = slotBps(slotBpsArr);

  return program.methods
    .createTask(
      skillId,
      reward,
      deadlineTs,
      nonce,
      reviewCount,
      bps as [number, number, number, number]
    )
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

/** After off-chain Test 1→2→3: holders[0]=Execution (fastest), then verifiers. */
export async function assignTeam(
  program: PicoProgram,
  operator: Keypair,
  client: PublicKey,
  taskNonce: BN | number,
  holders: PublicKey[],
  timesMs: number[]
) {
  const nonce = typeof taskNonce === "number" ? new BN(taskNonce) : taskNonce;
  const h: PublicKey[] = [];
  const t: number[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    h.push(holders[i] ?? PublicKey.default);
    t.push(timesMs[i] ?? 0);
  }
  return program.methods
    .assignTeam(h as [PublicKey, PublicKey, PublicKey, PublicKey], t)
    .accounts({
      operator: operator.publicKey,
      config: configPda(),
      task: taskPda(client, nonce),
    })
    .signers([operator])
    .rpc();
}

export async function submitExecution(
  program: PicoProgram,
  executor: Keypair,
  client: PublicKey,
  taskNonce: BN | number,
  resultHash: number[],
  explanationHash: number[]
) {
  const nonce = typeof taskNonce === "number" ? new BN(taskNonce) : taskNonce;
  return program.methods
    .submitExecution(resultHash, explanationHash)
    .accounts({
      executor: executor.publicKey,
      task: taskPda(client, nonce),
    })
    .signers([executor])
    .rpc();
}

export async function submitVerification(
  program: PicoProgram,
  verifier: Keypair,
  client: PublicKey,
  taskNonce: BN | number,
  reviewHash: number[]
) {
  const nonce = typeof taskNonce === "number" ? new BN(taskNonce) : taskNonce;
  return program.methods
    .submitVerification(reviewHash)
    .accounts({
      verifier: verifier.publicKey,
      task: taskPda(client, nonce),
    })
    .signers([verifier])
    .rpc();
}

/** remainingAccounts: ATA for each filled slot, in order 0..slot_count-1 */
export async function finalizeAndPay(
  program: PicoProgram,
  signer: Keypair,
  client: PublicKey,
  taskNonce: BN | number,
  treasuryAta: PublicKey,
  slotAtas: PublicKey[],
  mint: PublicKey = DEVNET_USDC
) {
  const nonce = typeof taskNonce === "number" ? new BN(taskNonce) : taskNonce;
  const task = taskPda(client, nonce);
  const [vaultAuthority] = vaultAuthorityPda(task);
  const vault = vaultAta(vaultAuthority, mint);

  return program.methods
    .finalizeAndPay()
    .accounts({
      payerSig: signer.publicKey,
      config: configPda(),
      task,
      vaultAuthority,
      vault,
      treasuryTokenAccount: treasuryAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(
      slotAtas.map((pubkey) => ({
        pubkey,
        isWritable: true,
        isSigner: false,
      }))
    )
    .signers([signer])
    .rpc();
}
