/**
 * Paste into Solana Playground client/test → Run
 * Deposits $1 USDC into a new Pico budget vault.
 */
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

const mint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const owner = pg.wallet.publicKey;

// $1 USDC = 1_000_000 (6 decimals)
const amount = new BN(1_000_000);

const [config] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  pg.program.programId
);

const [budget] = PublicKey.findProgramAddressSync(
  [Buffer.from("budget"), owner.toBuffer(), mint.toBuffer()],
  pg.program.programId
);

const [vaultAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault_authority"), budget.toBuffer()],
  pg.program.programId
);

const vault = getAssociatedTokenAddressSync(mint, vaultAuthority, true);
const ownerTokenAccount = getAssociatedTokenAddressSync(mint, owner);

const txHash = await pg.program.methods
  .initializeBudget(amount)
  .accounts({
    owner,
    config,
    mint,
    budget,
    vaultAuthority,
    vault,
    ownerTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("initializeBudget tx:", txHash);
console.log("budget PDA:", budget.toBase58());
console.log("vault ATA:", vault.toBase58());
console.log("deposited: $1 USDC");
