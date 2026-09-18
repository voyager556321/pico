# Pico Web (Next.js)

Frontend for **Pico** — payment layer for on-demand AI.  
Talks to the custom Anchor program on **Solana Devnet**.

## Setup (you do this)

### 1. Install deps
```bash
cd hackathon-krk/web
yarn install
```

### 2. Env file
```bash
cp .env.example .env.local
```

Fill `OPERATOR_SECRET_KEY` with the **Playground wallet secret**  
(the same wallet that is `config.operator` = `2D3thoP9nNRShnHimTsyRMhRArPC1PD2ovv1AEv2jds3`).

In Solana Playground: Wallet → export private key (base58 or JSON array).  
**Never commit `.env.local`.**

Also set:
```env
OPERATOR_PUBLIC_KEY=2D3thoP9nNRShnHimTsyRMhRArPC1PD2ovv1AEv2jds3
```

### 3. Phantom
- Install Phantom
- Enable **Devnet**
- For the existing budget: import the **same** Playground wallet  
  OR deposit fresh USDC from any Devnet wallet via the UI

### 4. Run
```bash
# stop old next processes if port busy
yarn dev
```
Open http://localhost:3000

> Note: mobile wallet adapter is stubbed in `next.config.ts` to avoid a Next/webpack  
> break from `@solana/kit`. Desktop Phantom is enough for the hackathon demo.

## Flow
1. Connect wallet  
2. **Add $1 / $2 / $5** → `initializeBudget` / `deposit` on-chain  
3. **Run** Explain Tx / Token Check → API calls `debit` as operator + returns result  
4. History + explorer links  

## Program
- ID: `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j`
- IDL: `src/idl/pico.json`
