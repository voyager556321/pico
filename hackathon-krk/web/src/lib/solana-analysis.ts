import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

export async function fetchTxContext(
  connection: Connection,
  signature: string
): Promise<string> {
  const sig = signature.trim();
  if (sig.length < 32) {
    throw new Error("Enter a Solana transaction signature (or use a real explorer sig).");
  }

  try {
    const tx = await connection.getTransaction(sig, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx) {
      return [
        `Signature: ${sig}`,
        `Status: not found on this RPC/cluster (try a Devnet signature if app is on Devnet).`,
        `Note: user may have pasted a demo string — explain limitations briefly.`,
      ].join("\n");
    }

    const message = tx.transaction.message;
    const accountKeys =
      "getAccountKeys" in message
        ? message.getAccountKeys().staticAccountKeys.map((k) => k.toBase58())
        : (
            message as unknown as { accountKeys: PublicKey[] }
          ).accountKeys.map((k) => k.toBase58());

    const instructions =
      "compiledInstructions" in message
        ? message.compiledInstructions.length
        : (message as unknown as { instructions: unknown[] }).instructions
            ?.length ?? 0;

    return [
      `Signature: ${sig}`,
      `Slot: ${tx.slot}`,
      `Fee payer (likely): ${accountKeys[0] ?? "unknown"}`,
      `Accounts involved: ${accountKeys.length}`,
      `Top accounts: ${accountKeys.slice(0, 8).join(", ")}`,
      `Instructions (compiled count): ${instructions}`,
      `Err: ${tx.meta?.err ? JSON.stringify(tx.meta.err) : "none"}`,
      `Fee lamports: ${tx.meta?.fee ?? "unknown"}`,
      `Log messages (truncated): ${(tx.meta?.logMessages ?? []).slice(0, 12).join(" | ")}`,
    ].join("\n");
  } catch (e) {
    return [
      `Signature: ${sig}`,
      `RPC fetch failed: ${e instanceof Error ? e.message : "unknown"}`,
      `Provide a best-effort explanation and say on-chain fetch failed.`,
    ].join("\n");
  }
}

export async function fetchMintContext(
  connection: Connection,
  mintStr: string
): Promise<string> {
  const raw = mintStr.trim();
  let mint: PublicKey;
  try {
    mint = new PublicKey(raw);
  } catch {
    throw new Error("This isn’t a valid Solana address (token mint).");
  }

  try {
    const info = await getMint(connection, mint);
    return [
      `Mint: ${mint.toBase58()}`,
      `Decimals: ${info.decimals}`,
      `Supply (raw): ${info.supply.toString()}`,
      `Mint authority: ${info.mintAuthority?.toBase58() ?? "null (revoked)"}`,
      `Freeze authority: ${info.freezeAuthority?.toBase58() ?? "null (revoked)"}`,
      `Is initialized: ${info.isInitialized}`,
      `Cluster RPC: current app RPC (likely Devnet)`,
    ].join("\n");
  } catch (e) {
    return [
      `Mint: ${mint.toBase58()}`,
      `Could not fetch SPL mint account: ${e instanceof Error ? e.message : "unknown"}`,
      `It may not be a token mint on this cluster, or RPC failed.`,
    ].join("\n");
  }
}

export function buildExplainPrompt(input: string, onchain: string): string {
  return `You are Pico, an on-chain AI assistant for Solana users.
Explain the transaction in plain English for a non-expert.

Rules:
- Be concise (max ~12 short lines).
- Use the on-chain context below; if data is missing, say so.
- Call out risks if visible (unknown programs, failed tx, approvals).
- End with: "Automated analysis. Not financial advice."
- Do not invent token prices or guarantees.

User input: ${input}

On-chain context:
${onchain}`;
}

export function buildTokenPrompt(input: string, onchain: string): string {
  return `You are Pico, a Solana token risk assistant.
Given mint data, produce a short risk check.

Rules:
- Start with a one-line risk level: Low / Medium / High / Unknown
- Then 4–8 bullet points (authorities, supply quirks, missing data).
- Mint authority present = potential infinite mint risk; freeze authority = freeze risk.
- End with: "Automated analysis. Not a guarantee of safety."
- Be concise. No hype.

User input: ${input}

On-chain context:
${onchain}`;
}
