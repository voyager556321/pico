# Pico Web (Next.js)

Frontend for **Task.quo**, a marketplace for short tasks.

Fiat payments are being integrated. Funding, publishing, payouts, and payment-backed task actions are temporarily disabled; the marketplace does not require a crypto wallet.

## Setup (you do this)

### 1. Install deps
```bash
cd hackathon-krk/web
yarn install
```

### 2. Env file (optional for the UI)
```bash
cp .env.example .env.local
```

Set `GEMINI_API_KEY` only if you need the server-side AI feature. Do not add old Solana operator keys; the current marketplace UI does not use them.

### 4. Run
```bash
# stop old next processes if port busy
yarn dev
```
Open http://localhost:3000

Payment provider selection and integration are still pending. Local demo data is illustrative and does not represent live balances or payments.
