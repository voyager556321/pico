import { createPublicKey, verify } from "node:crypto";
import bs58 from "bs58";

/**
 * Wallet-ownership proof. The client signs the UTF-8 message `pico:<wallet>:<unix-ms>`
 * with Phantom signMessage and sends:
 *   x-pico-wallet: <base58 wallet>
 *   x-pico-ts:     <unix-ms used in the message>
 *   x-pico-sig:    <base64 ed25519 signature>
 * Verified with Node's built-in ed25519 (no extra dependency).
 */
export const AUTH_MAX_AGE_MS = 5 * 60 * 1000;
const CLOCK_SKEW_MS = 60 * 1000;
// DER SubjectPublicKeyInfo prefix for a raw 32-byte ed25519 key.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function authMessage(wallet: string, ts: number | string) {
  return `pico:${wallet}:${ts}`;
}

export type AuthResult = { ok: true; wallet: string } | { ok: false; error: string };

export function verifyWalletSignature(wallet: string, ts: string, sigB64: string, now = Date.now()): AuthResult {
  if (!wallet || !ts || !sigB64) return { ok: false, error: "signature required" };
  if (!/^\d{10,16}$/.test(ts)) return { ok: false, error: "bad timestamp" };
  const age = now - Number(ts);
  if (age > AUTH_MAX_AGE_MS) return { ok: false, error: "signature expired" };
  if (age < -CLOCK_SKEW_MS) return { ok: false, error: "timestamp in the future" };
  let pk: Uint8Array;
  try {
    pk = bs58.decode(wallet);
  } catch {
    return { ok: false, error: "bad wallet" };
  }
  if (pk.length !== 32) return { ok: false, error: "bad wallet" };
  const sig = Buffer.from(sigB64, "base64");
  if (sig.length !== 64) return { ok: false, error: "bad signature" };
  try {
    const key = createPublicKey({ key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(pk)]), format: "der", type: "spki" });
    const good = verify(null, Buffer.from(authMessage(wallet, ts), "utf8"), key, sig);
    return good ? { ok: true, wallet } : { ok: false, error: "bad signature" };
  } catch {
    return { ok: false, error: "bad signature" };
  }
}

/** Reads the x-pico-* headers and returns the proven signer wallet. */
export function requireWallet(req: Request): AuthResult {
  const h = req.headers;
  return verifyWalletSignature(h.get("x-pico-wallet") || "", h.get("x-pico-ts") || "", h.get("x-pico-sig") || "");
}

type TaskWallets = { client_wallet?: string | null; worker_wallet?: string | null };

/**
 * Who may write a task row, given the proven signer:
 * - new task: the signer is the client (client_wallet must be empty or equal the signer);
 *   a worker_wallet on create must be the signer too.
 * - existing task: the signer must be its client, its worker, or be claiming it
 *   (setting worker_wallet to itself). client_wallet can never be reassigned, and
 *   nobody can set worker_wallet to a wallet other than their own.
 * Returns null when allowed, otherwise the 403 reason.
 */
export function taskWriteDenied(prev: TaskWallets | null, patch: TaskWallets, signer: string): string | null {
  const pClient = patch.client_wallet || null;
  const pWorker = patch.worker_wallet || null;
  if (!prev) {
    if (pClient && pClient !== signer) return "client_wallet must be the signer";
    if (pWorker && pWorker !== signer) return "worker_wallet must be the signer";
    return null;
  }
  const client = prev.client_wallet || null;
  const worker = prev.worker_wallet || null;
  if (pClient && pClient !== client && (client || pClient !== signer)) return "client_wallet cannot be changed";
  if (pWorker && pWorker !== worker && pWorker !== signer) return "worker_wallet must be the signer";
  const claiming = !!pWorker && pWorker === signer;
  if (signer === client || signer === worker || claiming || (!client && pClient === signer)) return null;
  return "signer is not on this task";
}
