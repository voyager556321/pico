import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { PROGRAM_ID, USDC_MINT } from "./constants";

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
  taskNonce: number | BN,
  programId = PROGRAM_ID
): PublicKey {
  const nonceBuf =
    typeof taskNonce === "number"
      ? (() => {
          const b = Buffer.alloc(8);
          b.writeBigUInt64LE(BigInt(taskNonce), 0);
          return b;
        })()
      : taskNonce.toArrayLike(Buffer, "le", 8);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("task"), client.toBuffer(), nonceBuf],
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

export function vaultAta(vaultAuthority: PublicKey, mint: PublicKey = USDC_MINT) {
  return getAssociatedTokenAddressSync(mint, vaultAuthority, true);
}
