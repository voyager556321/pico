# Pico architecture

## Repository layout (current)
```
blockchain/                 repo root (GitHub: voyager556321/pico)
  .cursorrules              global rules for Cursor
  docs/                     product_requirements, architecture, api_contracts, notes
  hackathon-krk/
    programs/pico/          Anchor (Rust) program, IDL, devnet deploy notes, Playground tests
    programs/client/        TS client for the program
    web/                    Next.js app (deployed to Vercel)
      src/app/              routes: landing, /app/*, /api/pico/*
      src/catalog/          chain-independent product catalog data
      src/platform/         product rules: flow, roles, protections, capabilities
      src/domain/           actions: task, qualify, work, verify, operator
      src/ui/               pure views
      src/components/       existing shared UI and legacy task screens
      src/lib/              infra: IDL, PDAs, ATA, constants, Gemini, offchain store
  design-prototype/         standalone prototypes and archived design references
```

## Runtime pieces
| Piece | Where | Notes |
|---|---|---|
| Web + API | Vercel, Next.js | React landing at `/`; route handlers under `/api`; `/app` currently has no payment provider or wallet provider |
| Database | Supabase Postgres (pooler host) | tables auto-created on first request |
| Payment | Fiat provider (TBD) | Integration pending; funding, task publication, and payouts are disabled in the UI |
| Legacy chain | Solana devnet | Previous USDC flow is inactive in the marketplace UI; transaction code remains for migration reference |
| AI | Gemini via `@google/genai` | server-side only |

## Dependency boundaries
- `src/app` contains route entry points; keep product and infrastructure logic out of route files.
- `src/catalog` contains product data that must not import wallet, chain, or server modules.
- The app does not mount a wallet or Solana provider.
- Legacy task actions still import Solana packages directly but are blocked by platform protections; replace them behind a fiat payment interface before enabling paid actions.
- `design-prototype/figma-reference` is an archived visual reference, not a runtime page or source of React content.

## Database
`pico_accounts`
| column | type | default |
|---|---|---|
| wallet | text PK | |
| role | text | `'hire'` (`hire` or `work`) |
| avail | numeric | 0 |
| company | text | `''` |
| email | text | `''` |
| onboarded | boolean | false |
| skills | jsonb | `[]` |
| updated_at | timestamptz | now() |

`pico_tasks`
| column | type | default |
|---|---|---|
| id | text PK | |
| title | text | `''` |
| cat | text | `''` |
| reward | numeric | 0 |
| status | text | `'finding'` |
| client_wallet | text | null |
| worker_wallet | text | null |
| body | jsonb | `{}` (merged on each write) |
| updated_at | timestamptz | now() |

## Legacy money path (inactive)
1. Deposit: client SPL transfer into a demo-held token account.
2. Lock: memo `pico lock <task> <amount>` after a balance check.
3. Release: SPL transfer to the worker plus memo `pico release <task>`; the API verifies the tx before marking the task paid.

This flow is disabled. A fiat payment provider has not yet been selected or integrated.

## Environment
`GEMINI_API_KEY`, optional `GEMINI_MODEL`, `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`. Legacy Solana settings are not required by the current UI.

## Known debt
- DB helpers (`dbUrl`, `safeErr`, `withDb`) are duplicated in both API routes; move to `src/lib/db.ts`.
- Schema is created at request time; move to migrations.
- No auth beyond the wallet address in the request; anyone can write any wallet's account row.
- Existing task actions are tied to Solana; replace them behind a payment interface before enabling task funding or payouts.
