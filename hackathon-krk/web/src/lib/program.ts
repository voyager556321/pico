import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "@/idl/pico.json";
import { PROGRAM_ID } from "./constants";

export type PicoIdl = Idl;

export function getPicoProgram(
  connection: Connection,
  wallet: anchor.Wallet
): Program {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program(idl as Idl, PROGRAM_ID, provider);
}

export async function fetchBudgetAccount(
  program: Program,
  owner: PublicKey
): Promise<{
  owner: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  totalDeposited: anchor.BN;
  totalSpent: anchor.BN;
  spendCount: anchor.BN;
} | null> {
  const { budgetPda } = await import("./pdas");
  const { USDC_MINT } = await import("./constants");
  const address = budgetPda(owner, USDC_MINT);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (program.account as any).budget.fetch(address);
    return account;
  } catch {
    return null;
  }
}
