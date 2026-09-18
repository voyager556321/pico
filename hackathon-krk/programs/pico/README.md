# Pico on-chain program

**Pico** — *A payment layer for on-demand AI*

Custom Anchor program: USDC escrow vault + operator `debit` + user withdraw.

**Devnet Program ID:** `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j`  
Explorer: https://explorer.solana.com/address/6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j?cluster=devnet

## Solana Playground steps

1. Open [https://beta.solpg.io](https://beta.solpg.io)
2. New Anchor project → replace `lib.rs` with  
   `programs/pico/src/lib.rs` from this repo
3. Build
4. Deploy to **devnet** (Playground wallet needs SOL — use faucet)
5. Copy the new **Program ID** → paste into `declare_id!("...")` → rebuild → redeploy if Playground asks
6. Export **IDL** (JSON) → save as `web/src/idl/pico.json` (later)

### After first deploy

Call once (from Playground test UI or a script):

- `initialize_config(operator)`  
  - `mint` = Devnet USDC `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`  
  - `treasury_token_account` = your ATA for that mint (create in Playground/Phantom if needed)  
  - `operator` = pubkey of the backend hot wallet (will sign every `debit`)

## PDAs

| Account | Seeds |
|---------|--------|
| `Config` | `["config"]` |
| `Budget` | `["budget", owner, mint]` |
| `vault_authority` | `["vault_authority", budget]` |
| `vault` | ATA(`vault_authority`, mint) |

## Instructions

| Ix | Signer | Effect |
|----|--------|--------|
| `initialize_config` | authority | Set operator + mint + treasury |
| `update_operator` | authority | Rotate operator |
| `initialize_budget(amount)` | user | Create budget + vault, deposit USDC |
| `deposit(amount)` | user | Top up vault |
| `debit(amount, tool_id)` | **operator** | Vault → treasury, emit `SpendEvent` |
| `withdraw_remaining` | user | Drain vault back to user |

### Amounts (USDC 6 decimals)

| UI | On-chain `u64` |
|----|----------------|
| $0.01 | `10_000` |
| $0.05 | `50_000` |
| $1 | `1_000_000` |
| $5 | `5_000_000` |

### tool_id convention

| id | Tool |
|----|------|
| 1 | Explain Tx |
| 2 | Token Check |

## Security notes (pitch-ready)

- Funds sit in **vault ATA** owned by PDA — not a custodial EOA wallet alone
- Only **config.operator** can `debit`
- User alone can `deposit` / `withdraw_remaining`
- `has_one` + mint/vault/treasury constraints on every path

## Local files

- `src/lib.rs` — program source (Playground copy-paste)
- `../client/pico.ts` — TypeScript invoke helpers (after IDL export)
