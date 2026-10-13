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
      src/platform/         product rules: flow, roles, protections, capabilities
      src/domain/           actions: task, qualify, work, verify, operator
      src/ui/               pure views
      src/components/       controllers (*Page.tsx), shared UI, Solana provider
      src/lib/              infra: IDL, PDAs, ATA, constants, Gemini, offchain store
  design-prototype/         static design work
```

## Runtime pieces
| Piece | Where | Notes |
|---|---|---|
| Web + API | Vercel, Next.js route handlers | `force-dynamic`, one short-lived `pg` client per request |
| Database | Supabase Postgres (pooler host) | tables auto-created on first request |
| Wallet | Phantom | wallet address is the account id |
| Chain | Solana devnet | Circle devnet USDC mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`, Memo program for lock/release memos |
| AI | Gemini via `@google/genai` | server-side only |

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

## Money path (devnet demo)
1. Deposit: client SPL transfer into a demo-held token account.
2. Lock: memo `pico lock <task> <amount>` after a balance check.
3. Release: SPL transfer to the worker plus memo `pico release <task>`; the API verifies the tx before marking the task paid.

## Environment
`NEXT_PUBLIC_SOLANA_RPC`, `OPERATOR_PUBLIC_KEY`, `OPERATOR_SECRET_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`.

## Known debt
- DB helpers (`dbUrl`, `safeErr`, `withDb`) are duplicated in both API routes; move to `src/lib/db.ts`.
- Schema is created at request time; move to migrations.
- No auth beyond the wallet address in the request; anyone can write any wallet's account row.
- Payment rail is tied to Solana; isolate behind a payment interface before adding a card/bank provider.
