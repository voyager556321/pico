import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j"
);

/** Circle USDC on Solana Devnet */
export const USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const TREASURY_ATA = new PublicKey(
  "J7vNqKbJTitt4C3ec1EQaddSQer1Tf9V4NwRRUoAmQgq"
);

export const CONFIG_PDA = new PublicKey(
  "F7hAMpPWgh8k2JFHsmpvamaJfi9KwnsPf2QQ5dZPBAyV"
);

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";

export const USDC_DECIMALS = 6;

export const TOOLS = {
  explainTx: {
    id: 1 as const,
    name: "Explain Tx",
    description: "Plain-English explanation of a Solana transaction.",
    priceUsd: 0.01,
  },
  tokenCheck: {
    id: 2 as const,
    name: "Token Check",
    description: "Quick risk flags for a mint / token address.",
    priceUsd: 0.05,
  },
} as const;

export function usdcToBaseUnits(amountUsd: number): number {
  return Math.round(amountUsd * 10 ** USDC_DECIMALS);
}

export function baseUnitsToUsdc(amount: number | bigint): number {
  return Number(amount) / 10 ** USDC_DECIMALS;
}
