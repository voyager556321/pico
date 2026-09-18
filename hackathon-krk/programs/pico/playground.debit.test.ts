/**
 * Paste into Playground client → Run
 * Simulates one AI tool call: Explain Tx = $0.01 (tool_id = 1)
 * Operator = Playground wallet (same as config.operator)
 */
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

const mint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const treasuryTokenAccount = new PublicKey(
  "J7vNqKbJTitt4C3ec1EQaddSQer1Tf9V4NwRRUoAmQgq"
);
const owner = new PublicKey("2D3thoP9nNRShnHimTsyRMhRArPC1PD2ovv1AEv2jds3");

const operator = pg.wallet.publicKey;

// $0.01 USDC = 10_000
const amount = new BN(10_000);
const toolId = 1; // Explain Tx

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

const txHash = await pg.program.methods
  .debit(amount, toolId)
  .accounts({
    operator,
    config,
    budget,
    vaultAuthority,
    vault,
    treasuryTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();

console.log("debit tx:", txHash);
console.log("tool: Explain Tx ($0.01)");
console.log("budget:", budget.toBase58());
console.log(
  "explorer:",
  `https://explorer.solana.com/tx/${txHash}?cluster=devnet`
);
