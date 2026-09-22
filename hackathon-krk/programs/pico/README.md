# Pico on-chain program

**Model:** per-task USDC escrow + **slot team** from a timed qualification podium.

| Slot index | Name | Duty |
|------------|------|------|
| 0 | Execution | Does the work |
| 1 | Primary Verification | Reviews Execution |
| 2… | Audit Verification | Reviews previous verifier; **last → client** |

Full product rules: [`../../FLOW.md`](../../FLOW.md)

**Devnet Program ID:** `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j`  
(Redeploy after this rewrite; bump `declare_id` if Playground assigns a new key.)

## Happy path

```
initialize_config(operator, fee_bps)

create_task(skill_id, reward, deadline, nonce, review_count, slot_bps)
  # status = Qualifying; locks USDC
  # slot_bps[0..review_count+1) sum to 10_000 (share of *net* after fee)

# off-chain: Test 1 → 2 → 3 (time). Need ≥ N+1 finishers or refill.

assign_team(holders, times_ms)          # operator; 0 = fastest Execution
submit_execution(result_hash, explanation_hash)
submit_verification(review_hash)        # slot 1, then 2, …
# last verification → status Submitted
finalize_and_pay()                      # remaining_accounts = slot ATAs in order
```

## Declines

| Who | Instruction | Next |
|-----|-------------|------|
| Execution (while Working) | `decline_slot` | `HiringSlot` for index 0; verifiers stay |
| Active verifier | `decline_slot` | `HiringSlot` for that index |
| After single-seat race | `fill_slot(index, time_ms)` | Resume Working / InReview |

## Payout (`finalize_and_pay`)

```
fee     = reward * fee_bps / 10_000     → treasury
net     = reward - fee
slot_i  = net * slot_bps[i] / 10_000    → slot holder i
dust    → Execution
```

Example N=2, bps `[7000,2000,1000,0]`, fee 10%: reward $100 → fee $10, exec $63, primary $18, audit $9.

## Cancel / expire

Only while `Qualifying` (no team yet): `cancel_task` / `expire_qualifying_task`.

## Dispute

`reject_verification` or `raise_dispute` → `Disputed` → `resolve_dispute(client, fee, slot_amounts)`.

## What stays off-chain

Test content, timers, anti-cheat, notifications, reputation from failed races.  
On-chain stores **holders + times_ms** so UI can show why place-2 is not Execution.

## PDAs

| Account | Seeds |
|---------|--------|
| Config | `["config"]` |
| SkillCredential | `["credential", worker, skill_id_le]` |
| Task | `["task", client, nonce_le]` |
| vault_authority | `["vault_authority", task]` |
| vault | ATA(vault_authority, USDC) |

## Deploy (Playground)

1. Paste `src/lib.rs` → Build → Deploy Devnet  
2. Sync `declare_id` + `PROGRAM_ID` in client / web  
3. Export IDL → `web/src/idl/pico.json`  
4. `initialize_config(operator, fee_bps)` once  

## Client

[`../client/pico.ts`](../client/pico.ts) — helpers for the slot flow.
