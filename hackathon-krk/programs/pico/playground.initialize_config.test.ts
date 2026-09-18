/**
 * Paste into Solana Playground → tests/anchor.test.ts
 * OR into a Client script tab, then Run.
 * No describe/it — plain script (avoids "describe is not defined").
 */
import { PublicKey, SystemProgram } from "@solana/web3.js";

const mint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const treasuryTokenAccount = new PublicKey(
  "J7vNqKbJTitt4C3ec1EQaddSQer1Tf9V4NwRRUoAmQgq"
);

const authority = pg.wallet.publicKey;
const operator = pg.wallet.publicKey;

const [config] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  pg.program.programId
);

const txHash = await pg.program.methods
  .initializeConfig(operator)
  .accounts({
    authority,
    config,
    mint,
    treasuryTokenAccount,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("initializeConfig tx:", txHash);
console.log("config PDA:", config.toBase58());
console.log("operator / authority:", operator.toBase58());
