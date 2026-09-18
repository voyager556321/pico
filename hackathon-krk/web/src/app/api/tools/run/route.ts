import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import bs58 from "bs58";
import idl from "@/idl/pico.json";
import {
  PROGRAM_ID,
  RPC_ENDPOINT,
  TOOLS,
  TREASURY_ATA,
  USDC_MINT,
  baseUnitsToUsdc,
  usdcToBaseUnits,
} from "@/lib/constants";
import { budgetPda, configPda, vaultAta, vaultAuthorityPda } from "@/lib/pdas";
import { analyzeWithGemini } from "@/lib/gemini";
import {
  buildExplainPrompt,
  buildTokenPrompt,
  fetchMintContext,
  fetchTxContext,
} from "@/lib/solana-analysis";

export const runtime = "nodejs";

function getOperator(): Keypair {
  const raw = process.env.OPERATOR_SECRET_KEY;
  if (!raw?.trim()) {
    throw new Error(
      "Missing OPERATOR_SECRET_KEY in .env.local (Playground wallet secret = config.operator)"
    );
  }

  let secret = raw.trim();
  if (
    (secret.startsWith('"') && secret.endsWith('"')) ||
    (secret.startsWith("'") && secret.endsWith("'"))
  ) {
    secret = secret.slice(1, -1).trim();
  }

  let bytes: Uint8Array;
  if (secret.startsWith("[")) {
    bytes = Uint8Array.from(JSON.parse(secret) as number[]);
  } else {
    bytes = bs58.decode(secret);
  }

  let keypair: Keypair;
  if (bytes.length === 64) {
    keypair = Keypair.fromSecretKey(bytes);
  } else if (bytes.length === 32) {
    keypair = Keypair.fromSeed(bytes);
  } else {
    throw new Error(
      `bad secret key size (${bytes.length}). Need 64-byte secret OR 32-byte seed from Playground export — not a public address.`
    );
  }

  const expected = process.env.OPERATOR_PUBLIC_KEY?.trim();
  if (expected && keypair.publicKey.toBase58() !== expected) {
    throw new Error(
      `OPERATOR_SECRET_KEY pubkey is ${keypair.publicKey.toBase58()}, expected ${expected}`
    );
  }

  return keypair;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tool = body.tool as "explainTx" | "tokenCheck";
    const input = String(body.input ?? "");
    const ownerStr = String(body.owner ?? "");

    if (tool !== "explainTx" && tool !== "tokenCheck") {
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
    }
    if (!ownerStr) {
      return NextResponse.json({ error: "Missing owner" }, { status: 400 });
    }
    if (!input.trim()) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const owner = new PublicKey(ownerStr);
    const meta = TOOLS[tool];
    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    // 1) Fetch on-chain context + Gemini FIRST (no charge on analysis failure)
    const onchain =
      tool === "explainTx"
        ? await fetchTxContext(connection, input)
        : await fetchMintContext(connection, input);

    const prompt =
      tool === "explainTx"
        ? buildExplainPrompt(input, onchain)
        : buildTokenPrompt(input, onchain);

    const analysis = await analyzeWithGemini(prompt);

    // 2) Debit only after successful analysis
    const operator = getOperator();
    const wallet = {
      publicKey: operator.publicKey,
      payer: operator,
      async signTransaction<
        T extends
          | import("@solana/web3.js").Transaction
          | import("@solana/web3.js").VersionedTransaction,
      >(tx: T): Promise<T> {
        if ("partialSign" in tx) {
          (tx as import("@solana/web3.js").Transaction).partialSign(operator);
        }
        return tx;
      },
      async signAllTransactions<
        T extends
          | import("@solana/web3.js").Transaction
          | import("@solana/web3.js").VersionedTransaction,
      >(txs: T[]): Promise<T[]> {
        for (const tx of txs) {
          if ("partialSign" in tx) {
            (tx as import("@solana/web3.js").Transaction).partialSign(operator);
          }
        }
        return txs;
      },
    };
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl as Idl, PROGRAM_ID, provider);

    const budget = budgetPda(owner);
    const [vaultAuthority] = vaultAuthorityPda(budget);
    const vault = vaultAta(vaultAuthority);
    const amount = new BN(usdcToBaseUnits(meta.priceUsd));

    const vaultAcc = await getAccount(connection, vault);
    if (Number(vaultAcc.amount) < usdcToBaseUnits(meta.priceUsd)) {
      return NextResponse.json(
        { error: "Insufficient budget in vault" },
        { status: 402 }
      );
    }

    const debitTx = await program.methods
      .debit(amount, meta.id)
      .accounts({
        operator: operator.publicKey,
        config: configPda(),
        budget,
        vaultAuthority,
        vault,
        treasuryTokenAccount: TREASURY_ATA,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const vaultAfter = await getAccount(connection, vault);
    const remainingUsd = baseUnitsToUsdc(vaultAfter.amount);

    const result = [
      analysis,
      "",
      `—`,
      `Metered on-chain via Pico debit ($${meta.priceUsd.toFixed(2)}).`,
      `Proof: https://explorer.solana.com/tx/${debitTx}?cluster=devnet`,
    ].join("\n");

    return NextResponse.json({
      result,
      debitTx,
      remainingUsd,
      priceUsd: meta.priceUsd,
      tool: meta.name,
      mint: USDC_MINT.toBase58(),
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
