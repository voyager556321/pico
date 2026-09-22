# Redeploy checklist (slot program)

After changing [`src/lib.rs`](src/lib.rs):

1. Solana Playground → paste `lib.rs` → **Build** → **Deploy** Devnet  
2. If Program ID changes: update `declare_id!`, rebuild, then set:
   - `web/src/lib/constants.ts` → `PROGRAM_ID`
   - `web/src/idl/pico.json` → `metadata.address`
   - `programs/client/pico.ts` → `PROGRAM_ID`
3. Export IDL from Playground and replace `web/src/idl/pico.json` (or keep the hand-synced IDL in repo if it matches).
4. One-time: `initializeConfig(operator, fee_bps)` — **no** `rechecker_bps` anymore (splits are per-task `slot_bps`).
5. Confirm treasury ATA + Devnet USDC mint.

Until redeploy, UI may fail on-chain calls against the old program — qualify UI + localStorage still work for demo.
