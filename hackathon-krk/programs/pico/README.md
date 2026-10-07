# Pico on-chain program

**Model:** one worker, optional independent reviewer, USDC escrow. This matches the current product UI. There is no slot team.

**Devnet Program ID:** `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j`  
Redeploy after this rewrite. Bump `declare_id` only if Playground assigns a new key. Old task accounts will not deserialize.

`config.fee_bps` is the reviewer fee, on top of the worker reward (max 2500). The design uses 10% (`1000`). The worker receives the full reward. The reviewer is paid once, after the final pass, whether the path was pass or revision first.

## Happy path

```
initialize_config(operator, fee_bps)

create_task(skill_id, min_level, reward, task_nonce, with_reviewer, finding_deadline)
  # status = Finding
  # locks reward, plus reward * fee_bps / 10_000 when with_reviewer

claim_task(work_deadline)     # credential skill + level; first transaction wins
start_work()
submit_work(work_hash)
  # reviewer_fee == 0 → Submitted (client reviews)
  # reviewer_fee  > 0 → InVerification

# client review
accept_work()                 # only when reviewer_fee == 0
auto_accept()                 # anyone, 14 days after submitted_at, reviewer_fee == 0

# independent review
claim_review()                # different person, same skill credential
pass_review()                 # pays worker reward + reviewer fee
request_revision()            # client on Submitted, or assigned reviewer on InVerification
```

## Change request

While Assigned, InProgress, or Revision:

| Instruction | Effect |
|-------------|--------|
| `propose_change(new_reward, new_deadline)` | Higher reward locks the difference now. Lower reward moves nothing yet. |
| `accept_change` | New reward and deadline apply. A lower reward refunds the difference to the client. |
| `decline_change` | Unaccepted top-up returns to the client. Worker is paid 50% of the current reward and leaves. Leftover reward stays locked. Status returns to Finding (or Refunded if nothing remains). |

`top_up(amount)` adds reward while Finding and no worker is assigned.

## Cancel / finding window

| Instruction | When |
|-------------|------|
| `expire_finding` | Finding, no worker, `now >= finding_deadline`. Full refund. |
| `cancel_together` | Client and worker both sign. Refunds reward, reviewer fee, and any unaccepted top-up. |

## Dispute

`raise_dispute` (client or worker) → Disputed.  
`resolve_dispute(to_worker, to_reviewer, to_client, reopen)` — operator. The three amounts must equal the vault. `reopen` pays nothing and returns the task to Finding.

## What stays off-chain

Who is allowed to send `claim_task` (the UI assigns the highest verified score). Benchmark content, session logs, and reputation. The chain only checks skill id and level on the credential.

## PDAs

| Account | Seeds |
|---------|--------|
| Config | `["config"]` |
| SkillCredential | `["credential", worker, skill_id_le]` |
| Task | `["task", client, nonce_le]` |
| vault_authority | `["vault_authority", task]` |
| vault | ATA(vault_authority, USDC) |

## Status

`Finding → Assigned → InProgress → Submitted | InVerification → Paid`  
Revision returns to submit. Disputed and Refunded are terminal except `reopen`.
