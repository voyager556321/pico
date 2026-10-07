# Redeploy checklist

After changing [`src/lib.rs`](src/lib.rs):

1. Solana Playground → paste `lib.rs` → **Build** → **Deploy** Devnet
2. If Program ID changes: update `declare_id!`, rebuild, then set:
   - `web/src/lib/constants.ts` → `PROGRAM_ID`
   - `web/src/idl/pico.json` → `metadata.address`
   - `programs/client/pico.ts` → `PROGRAM_ID`
3. Export IDL from Playground and replace `web/src/idl/pico.json`. `programs/pico/idl.json` is the previous slot IDL and does not match this program.
4. One-time: `initializeConfig(operator, fee_bps)`. Use `1000` for the UI's 10% reviewer fee, charged on top of the worker reward.
5. Confirm treasury ATA + Devnet USDC mint.

`web/` still decodes the old slot task. Leave that app on the previous program until it is rewritten. This layout change is not compatible with accounts created by the slot program.
