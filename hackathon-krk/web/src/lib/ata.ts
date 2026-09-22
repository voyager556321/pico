import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

/** Build idempotent create-ATA ixs for owners that don't have one yet. */
export async function buildEnsureAtaIxs(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owners: PublicKey[]
): Promise<TransactionInstruction[]> {
  const seen = new Set<string>();
  const ixs: TransactionInstruction[] = [];

  for (const owner of owners) {
    const key = owner.toBase58();
    if (seen.has(key)) continue;
    seen.add(key);

    const ata = getAssociatedTokenAddressSync(mint, owner, true);
    try {
      await getAccount(connection, ata);
    } catch {
      ixs.push(
        createAssociatedTokenAccountIdempotentInstruction(
          payer,
          ata,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }
  }
  return ixs;
}

/** Send ensure-ATA ixs if any are needed. */
export async function ensureAtas(
  connection: Connection,
  sendTransaction: (
    tx: Transaction,
    connection: Connection
  ) => Promise<string>,
  payer: PublicKey,
  mint: PublicKey,
  owners: PublicKey[]
): Promise<void> {
  const ixs = await buildEnsureAtaIxs(connection, payer, mint, owners);
  if (ixs.length === 0) return;
  const tx = new Transaction().add(...ixs);
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
}

export async function getUsdcBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<number | null> {
  try {
    const ata = getAssociatedTokenAddressSync(mint, owner);
    const acc = await getAccount(connection, ata);
    return Number(acc.amount);
  } catch {
    return null;
  }
}
