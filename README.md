# Pico

**GitHub:** https://github.com/voyager556321/pico

**Demo:** https://hackatonpico.vercel.app

**Track:** Marketplace Platforms · Solana devnet

Pico is a Solana marketplace that assigns a short job to the worker with the closest verified skill score, and holds the client’s USDC until that work is released.

## Problem

A two-hour job still starts like a hire: browse people, trust a claim, then chase the payment. Pico records a verified skill first, assigns from that score, and keeps the USDC in place until the client signs the release.

## How Pico assigns work

1. A worker verifies one domain. **Linux I2C** is the real benchmark: three public cases, equal weight, pass mark 75, scored in the browser. A perfect score is Senior. A pass under 100 is Mid.
2. A client posts a category, a minimum level, acceptance criteria, and a USDC reward.
3. Pico assigns the closest verified score at that level or above. When the task has its own test, the highest verified score among people who pass is the one assigned.
4. The other side sees Client #id or Worker #id. The company name stays on the account.

## Money path on the live demo

Cluster: **Solana devnet**. Mint: Circle devnet USDC `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`. Phantom signs each step. The homepage is the product to try.

| Step | What the client signs | Where the USDC sits |
| --- | --- | --- |
| Deposit | SPL transfer from the client’s token account | A token account held in this browser for the demo |
| Lock | Memo `pico lock <task> <amount>` on the Memo program | Same account. The signed memo records the lock, after a balance check |
| Release | SPL transfer to a **different** worker address, plus memo `pico release <task>` | The worker’s devnet USDC account |

The release transaction is signed by the browser-held account and by the client in Phantom. A proof link opens the transaction on the Solana explorer (`cluster=devnet`).

## Account

The wallet is the account. Connecting Phantom loads `/api/pico/account?wallet=…` and restores role (`hire` or `work`), available balance, company, and onboarding. Tasks for that client come back from `/api/pico/tasks`. Both routes store rows in Supabase (Postgres). A saved address is a record: each page load asks Phantom to connect again before the session is live. One role is stored per wallet.

## Skill and reputation

A worker’s skills are a list of verified domains, each with a level and a score. Behavior reputation is a separate number, moved by finished tasks and on-time delivery. Reviewer reputation is separate again.

The live site judges Linux I2C in the page, against public mock cases. `design-prototype/i2cHarness.c` also runs a held-out set. The local grader in `design-prototype/serve.py` returns public case ids and held-out pass counts. Held-out case ids stay out of that response, and the worker’s result screen shows the public cases.

## What works in this build

| Today | In the repo, redeploy still ahead |
| --- | --- |
| Homepage at the demo URL: hiring, working, and reviewer flows | One-worker Anchor escrow in `hackathon-krk/programs/pico` |
| Real devnet USDC deposit, memo lock, and release to another wallet | On-chain credential, claim, accept, 14-day auto-accept, reviewer fee |
| Shared tasks and accounts through `/api/pico/tasks` and `/api/pico/account` | Program-owned vault (the live hold is the browser token account above) |
| Linux I2C scored in the browser | Optional local grader: `python3 design-prototype/serve.py` (needs gcc; not part of the hackathon demo) |

`/app` is an earlier multi-slot task UI. Judge the homepage.

## Stack

```
Browser + Phantom (devnet)
  deposit / memo lock / release  →  SPL Token + Memo program
  tasks and account              →  Next.js /api/pico/*  →  Supabase
  Linux I2C score                →  public cases in the page
Anchor one-worker escrow         →  hackathon-krk/programs/pico  (source)
Live program at the id below     →  earlier budget program on devnet
```

Next.js 15, React 19, `@solana/web3.js`, Anchor 0.29 in the web app. The homepage is a static page served by a rewrite to `hackathon-krk/web/public/design/index.html`.

## Program

| | |
| --- | --- |
| Program id | `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j` |
| Cluster | Devnet |
| Explorer | https://explorer.solana.com/address/6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j?cluster=devnet |
| What that address runs | The earlier budget program: config, budget, deposit, debit. Recorded in `hackathon-krk/programs/pico/devnet.json`. |
| Source in this repo | The one-worker escrow uses the same `declare_id`. That source has not been deployed over the budget program. |

## Run locally

```bash
cd hackathon-krk/web
yarn install
yarn dev
```

Open http://localhost:3000. `/` is the product page. Phantom needs Solana Devnet (the popup must say Devnet).

Shared tasks and accounts need `POSTGRES_URL` (or `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`). With those unset, the page still runs and the deposit path still talks to devnet; shared rows stay empty.

Optional local harness. The hackathon demo is the Vercel site above; judges do not need this process. It is here for a machine that has gcc and wants the held-out I2C grade:

```bash
python3 design-prototype/serve.py
```

Open http://127.0.0.1:3456/. That process serves the page and `POST /api/benchmark/grade`.

## Layout

| Path | Contents |
| --- | --- |
| `hackathon-krk/web` | Next.js app. Homepage rewrite, `/app`, API routes |
| `hackathon-krk/web/public/design` | The page the demo serves |
| `hackathon-krk/programs/pico` | Anchor source and the devnet notes for the live budget program |
| `design-prototype` | The same product page, plus the I2C harness |
