# Deploy Pico web to Vercel

App root: `hackathon-krk/web`

## 1. Env vars (Production + Preview)

In Vercel → Project → Settings → Environment Variables:

| Name | Notes |
|------|--------|
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | optional, default `gemini-3.6-flash` |

Fiat payment provider credentials are not required yet; provider selection and integration are pending. Do not configure legacy Solana operator secrets for the current marketplace UI.

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
- Funding, task publishing, and payouts remain disabled until fiat payments are integrated.
- Designer can later PR UI changes; redeploy picks them up.

## 4. Note

Legacy Solana transaction code is retained but is not active in the marketplace UI.
