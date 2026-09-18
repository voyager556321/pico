/**
 * Pico client helpers — use AFTER deploying from Solana Playground
 * and saving the IDL next to this file (or under web/src/idl/pico.json).
 *
 * npm: @coral-xyz/anchor @solana/web3.js @solana/spl-token
 */
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

/** Replace after Playground deploy */
export const PROGRAM_ID = new PublicKey(
  "6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j"
);

/** Circle USDC on Solana Devnet */
export const DEVNET_USDC = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const TOOL_EXPLAIN_TX = 1;
export const TOOL_TOKEN_CHECK = 2;

/** $1 → 1_000_000 base units (6 decimals) */
export function usdc(amount: number): BN {
  return new BN(Math.round(amount * 1_000_000));
}

export function configPda(programId = PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
}

export function budgetPda(
  owner: PublicKey,
  mint: PublicKey = DEVNET_USDC,
  programId = PROGRAM_ID
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("budget"), owner.toBuffer(), mint.toBuffer()],
    programId
  )[0];
}

export function vaultAuthorityPda(
  budget: PublicKey,
  programId = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), budget.toBuffer()],
    programId
  );
}

export function vaultAta(vaultAuthority: PublicKey, mint: PublicKey = DEVNET_USDC) {
  return getAssociatedTokenAddressSync(mint, vaultAuthority, true);
}

type PicoProgram = Program; // replace with Program<Pico> after `anchor idl` types

export async function initializeBudget(
  program: PicoProgram,
  owner: PublicKey,
  ownerUsdcAta: PublicKey,
  amountUsd: number
) {
  const mint = DEVNET_USDC;
  const budget = budgetPda(owner, mint);
  const [vaultAuthority] = vaultAuthorityPda(budget);
  const vault = vaultAta(vaultAuthority, mint);

  return program.methods
    .initializeBudget(usdc(amountUsd))
    .accounts({
      owner,
      config: configPda(),
      mint,
      budget,
      vaultAuthority,
      vault,
      ownerTokenAccount: ownerUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function deposit(
  program: PicoProgram,
  owner: PublicKey,
  ownerUsdcAta: PublicKey,
  amountUsd: number
) {
  const budget = budgetPda(owner);
  const [vaultAuthority] = vaultAuthorityPda(budget);
  const vault = vaultAta(vaultAuthority);

  return program.methods
    .deposit(usdc(amountUsd))
    .accounts({
      owner,
      budget,
      vault,
      ownerTokenAccount: ownerUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/** Backend-only: operator Keypair must match config.operator */
export async function debit(
  program: PicoProgram,
  operator: Keypair,
  userOwner: PublicKey,
  treasuryAta: PublicKey,
  amountUsd: number,
  toolId: number
) {
  const budget = budgetPda(userOwner);
  const [vaultAuthority] = vaultAuthorityPda(budget);
  const vault = vaultAta(vaultAuthority);

  return program.methods
    .debit(usdc(amountUsd), toolId)
    .accounts({
      operator: operator.publicKey,
      config: configPda(),
      budget,
      vaultAuthority,
      vault,
      treasuryTokenAccount: treasuryAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([operator])
    .rpc();
}

export async function withdrawRemaining(
  program: PicoProgram,
  owner: PublicKey,
  ownerUsdcAta: PublicKey
) {
  const budget = budgetPda(owner);
  const [vaultAuthority] = vaultAuthorityPda(budget);
  const vault = vaultAta(vaultAuthority);

  return program.methods
    .withdrawRemaining()
    .accounts({
      owner,
      budget,
      vaultAuthority,
      vault,
      ownerTokenAccount: ownerUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/** Example: wire AnchorProvider from a browser wallet adapter */
export function getProgram(connection: Connection, wallet: anchor.Wallet, idl: anchor.Idl) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl, provider);
}
