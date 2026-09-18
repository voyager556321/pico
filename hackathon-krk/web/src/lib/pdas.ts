import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PROGRAM_ID, USDC_MINT } from "./constants";

export function configPda(programId = PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
}

export function budgetPda(
  owner: PublicKey,
  mint: PublicKey = USDC_MINT,
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

export function vaultAta(vaultAuthority: PublicKey, mint: PublicKey = USDC_MINT) {
  return getAssociatedTokenAddressSync(mint, vaultAuthority, true);
}
