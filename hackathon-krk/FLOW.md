# Pico — qualification & slots (locked)

Product rules agreed for MVP. On-chain enforces escrow, slots, chain, and payouts.
**Timed tests themselves run off-chain**; operator records podium / single-seat winners on-chain.

## Slots (naming)

| Rank on Test 3 (time) | Slot name | Duty |
|----------------------|-----------|------|
| 1 | **Execution Slot** | Does the work |
| 2 | **Primary Verification Slot** | Reviews Execution deliverable |
| 3… | **Audit Verification Slot** (…chain) | Reviews previous verifier’s work; **last** → client |

Client sets **N** verifications at create. Team size = **N + 1**.

Example N=2: Execution + Primary + Audit → client.

## Qualification (first team)

1. Candidates take **3 timed tests** (pass → continue; fail → other tasks).
2. Criterion: **time** (faster correct = better).
3. Need ≥ N+1 people finishing Test 3; else **refill** same level.
4. **Execution** = fastest on Test 3 among finishers.
5. Places **2 … N+1** = verification slots (same podium — no separate review hunt at start).
6. UI shows times so place-2 sees why they are not Execution.

## Work chain

1. Execution submits work + explanation (hashes on-chain).
2. Verifier 1 reviews Execution → Done.
3. Verifier k reviews verifier k−1 → Done.
4. Last verifier Done → submitted to client → escrow pays by **client % / bps**.

## Replacement

| Who leaves | New test | Winners | Who stays |
|------------|----------|---------|-----------|
| Execution | Single-seat | **1** | All verifiers |
| Verifier k | Single-seat for slot k | **1** | Execution + other verifiers |

## Payout

```
platform_fee = reward * fee_bps / 10_000
net = reward - fee
slot_i = net * slot_bps[i] / 10_000
```

`slot_bps[0..slot_count)` must sum to **10_000**.

## On-chain vs off-chain

| On-chain | Off-chain |
|----------|-----------|
| Escrow vault, status, slot holders, bps, hashes, pay | Test content, timers, anti-cheat |
| `assign_team` / `fill_slot` (operator after tests) | Ranking UI, notifications |
| `decline_slot`, verification chain | Reputation growth from failed races |
