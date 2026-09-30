# Pico — MVP prototype

Clickable MVP of Pico (short tasks on Solana) for all three modes: **Hiring (Client)**, **Working (Worker)**, **Reviewer**.
One self-contained `index.html`. Real HTML/CSS, no screenshots. Mock data and local demo state only: no backend, no wallet, no Solana, nothing is paid.
Follows `user-flows-final.md`, `screen-map-final.md` and product decisions 1–45. Figma is the visual reference (dark UI, indigo accent, Manrope, sidebar pattern).

## Open
Double-click `index.html` (or open the artifact link). Top bar of the prototype:
- **Screen** menu — every screen, grouped: Shared, Client, Client · task pages, Worker, Reviewer, Archive (old logic, not linked).
- **Simulate** — plays the other side of the current screen (worker submits, reviewer returns a verdict, Pico decides a dispute, 14 days pass…). The label says what will happen next.
- **Reset demo** — clears saved state and starts at Sign up / Log in.
Everything you type and every transition is saved in this browser, so a reload keeps the state.

## Demo paths
**Client (Hiring)**
Sign up → Client onboarding (3 steps) → Home (empty state) → Create task: Details → Scope & criteria → Worker test (generate, edit, preview, pass mark) → Budget (reward + 10% fee, optional verification) → Not enough balance → Add funds (Phantom) → Lock and publish → Finding Worker → Simulate: worker passes → Assigned → In Progress → Submitted → Request changes → Needs Revision → resubmit → Accept and release → Completed.
If the worker declines a change request, the task page asks the client to choose terms for a new worker (proposed or current), shows what's left in escrow and what to add, then goes back to Finding Worker (or the client cancels).
Log in (instead of Sign up) opens the seeded Northwind account with a task in every status: Draft, Finding Worker, Assigned, In Progress, Submitted, In Verification, Needs Revision, Dispute, Completed, Cancelled.

**Worker (Working)** — switch mode in the top bar
Working onboarding in 4 steps (how it works → connect Phantom, incl. "not installed" and "rejected" → pick domain → benchmark intro) → Benchmark (PASS / FAIL) → Home → Relevant tasks (only tasks you're eligible for; unverified domains show a "Verify …" card, never the hidden tasks) → Task details (what happens after Accept) → Qualification test (live answer count; PASS → assigned, FAIL, Task already taken) or no-test task → Workroom:
- Change request with Current vs Proposed terms: accept → new locked terms (added criteria marked); decline → confirmation → the task ends for the worker with 50% of the reward (decision 42);
- Submit work: files with uploading / upload failed / retry, optional link, criteria checklist, submitting state;
- Awaiting Review with the 14-day auto-payout timer, or In Verification;
- Needs Revision from the client (one criterion) or the reviewer (Met / Not met per criterion) → resubmit, or dispute / appeal the verdict;
- Dispute: opened by you or by the client (respond with evidence), evidence list, platform decision (full, partial with the split, refund, reopen, back to Needs Revision);
- Stop by agreement both ways: the client asks (agree / decline) or you ask (reason → waiting → the client agrees / declines).
Also: My work, Earnings, Profile (skills with Retake, benchmark history, reputation separate), Topics, Competition (no money), Settings (payout wallet change via Phantom, availability pause, notifications, sign out), Help & disputes with the worker's own disputes and FAQ.

**Reviewer**
Reviewer onboarding (what reviewers do, "criteria, not taste") → choose domains to review from verified skills (unverified → Get verified in Working; no skills → not eligible) → Home and Requests (only requests you're eligible for; "Review more domains" card instead of hidden requests) → Request: your share of the 10% fee, reviewers on the task, accept / decline with reason / expired (Simulate) → Review details: brief, locked criteria, approved change requests, submission → Start review → Workspace: Met / Not met per criterion, required note and optional evidence link for unmet criteria → verdict preview → confirm → submitting → PASS (worker paid, reward paid once) or NEEDS REVISION → waiting → re-review with previous marks. Appeal: read-only context, Pico decides (verdict kept → back to Needs Revision → re-review; overturned or partial → verification final → reward paid). Also: Completed reviews, Reviewer profile, Settings (domains, availability pause, notifications, shared payout wallet, sign out), Help & disputes with appeals on your verdicts.

## States covered
Buttons default / hover / pressed / disabled / loading · inputs empty / filled / focus / error / disabled · modals, dropdowns, toasts · success, error, empty, loading · no tasks · insufficient balance · funds locked · qualification PASS / FAIL · task already taken · Needs Revision · Dispute (with platform decision) · Change request · mutual cancellation · Completed · Cancelled · file upload (uploading, failed, retry) · Phantom not installed / rejected / connected.

## Where the code is (for "change only this button")
Inside `index.html`:
- `<style>` → the block that starts with the `v2` comment holds the MVP components (`.sec`, `.steps`, `.ttable`, `.card.tech/.rev`, `.auth`, `.modal.wide`, `.seg`, `.meter`, `.cmp` change-request table, `.upi` / `.drop` file upload…). Base tokens (colors, radii, type) are at the top of `<style>`.
- `<script>` → sections, in this order:
  - **CORE** — demo data, statuses, money (fee, locked, available), shared components `P.btn`, `P.field`, `P.chip`, `P.tgl`, `P.tabs`, `P.steps`, `P.card`, `P.callout`, `P.empty`, top bar and sidebars, modals, Simulate.
  - **CLIENT** — S1 Sign up / Log in, C1 onboarding, C3 Home, C4–C8 Create task, C21 My tasks, C22 Balance, C23 Activity, C26 Help & disputes.
  - **CLIENT TASK PAGE** — C9–C20, one page per task; content follows the status.
  - **WORKER** — W1–W23 (the workroom is `RENDER.wroom`: pending answers in `wPending`, status cards in `wStatus`). **REVIEWER** — R1–R11 plus reviewer Settings (the review page is `RENDER.rreview`, one page per request; content follows the state).
Each screen is a `RENDER.<name>` function; each button is `P.btn('Label', {...})`, so a single button, field or color can be changed without touching the rest. Older Figma-rendered screens (Landing, Company profile, Settings, About, How it works) are `<template id="scr-KEY">` blocks.

## Rules confirmed on 29.09 (in the prototype)
- Change request with a higher reward: the extra amount is locked when the client sends it.
- Worker declines a change request (decision 42): the task ends for them and they get 50% of the current reward from the client's locked funds at the moment of the decline. The client then picks the terms for a new worker and adds the difference, or cancels the task. The 50% is a temporary value.
- Retake: FAIL keeps the current verified level, a new PASS updates it.
- No file size or type limits in the MVP; upload failures are only simulated ("Prototype: next upload fails").
- Settings in Working mode is the worker's own screen; Reviewer mode has its own Settings too.

## Assumptions (confirm with the team)
- After a declined change the new search uses the same qualification test.
- Benchmark level: 75–99 → Mid, 100 → Senior. Retry cooldown after FAIL: TBD.
- Reputation display format: TBD (shown as a score out of 100 with completed tasks, on-time rate and verified competition results).
- Qualification off: the "12 eligible / 12 notified" counts are mock.
- Worker Settings content (wallet, availability, notification types, "always on" for change requests, cancel requests, revisions and disputes) is a proposal.
- Reviewer: no time is defined for a request to expire or for a missed review deadline; "expired" is shown through Simulate. Reviewer Settings content is a proposal, like the worker's.
- Landing / About copy is unchanged from the earlier version ("up to 15 min", reviewer paid the same for PASS / NEEDS REVISION).
- Older screens (Company profile, Settings, About, How it works, Landing) still show the earlier two-mode switch in their static header.

## GitHub
If it goes to GitHub: branch `design` only, never `main`.
