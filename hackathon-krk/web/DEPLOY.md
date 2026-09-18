# Deploy Pico web to Vercel

App root: `hackathon-krk/web`

## 1. Env vars (Production + Preview)

In Vercel → Project → Settings → Environment Variables:

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_SOLANA_RPC` | e.g. `https://api.devnet.solana.com` or Helius Devnet URL |
| `OPERATOR_PUBLIC_KEY` | `2D3thoP9nNRShnHimTsyRMhRArPC1PD2ovv1AEv2jds3` |
| `OPERATOR_SECRET_KEY` | Playground operator secret (never commit) |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | optional, default `gemini-3.6-flash` |

## 2. Deploy (CLI)

```bash
cd hackathon-krk/web
npx vercel login
npx vercel link
npx vercel env pull   # optional
npx vercel --prod
```

Or connect the GitHub repo in Vercel dashboard (Root Directory = `hackathon-krk/web` if monorepo).

## 3. After deploy

- Open the URL → landing `/`
- App → `/app`
- Phantom must be on **Devnet**
- Designer can later PR UI changes; redeploy picks them up

## 4. Note

Operator wallet needs **Devnet SOL** for `debit` fees in production traffic too.
