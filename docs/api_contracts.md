# Pico API contracts

All routes live under `hackathon-krk/web/src/app/api`. JSON in, JSON out. Errors are `{ "error": string }`.

## Wallet signature (required on every POST under /api/pico)
The caller proves it owns a wallet by signing the UTF-8 message `pico:<wallet>:<unix-ms>` with Phantom `signMessage` (ed25519).
Headers:
- `x-pico-wallet`: base58 wallet that signed
- `x-pico-ts`: the unix-ms timestamp inside the message
- `x-pico-sig`: base64 of the 64-byte signature

The server (`src/lib/auth.ts`) rejects signatures older than 5 minutes (or more than 1 minute in the future). The client (`public/design/index.html`, `picoAuthHeaders`) caches the signature in `sessionStorage` per wallet and reuses it for ~4.5 minutes, so the user signs once per 5-minute window, not per request. On a 401 it drops the cache and re-signs once.
Auth errors:
- 401: `{ "error": "signature required" | "bad timestamp" | "signature expired" | "timestamp in the future" | "bad wallet" | "bad signature" }`
- 403: signature is valid but the signer may not make this change (see each route)

## GET /api/pico/account?wallet=<address>
Returns the account or `null` (also `null` if `wallet` is shorter than 32 chars).
```json
{ "wallet": "…", "role": "hire|work", "avail": 0, "company": "", "email": "", "onboarded": false, "skills": [], "updated_at": "ISO|null" }
```

## POST /api/pico/account
Body: partial account, `wallet` required. Unsent fields keep their previous value (upsert).
Requires the wallet signature headers; the signer must equal `body.wallet`.
- 200: full account (shape above)
- 400: `{ "error": "wallet is required" }`
- 401: missing/invalid/expired signature
- 403: `{ "error": "signer is not this wallet" }`
- 500: `{ "error": "<sanitized message>" }`

## GET /api/pico/tasks
- No query: array of tasks, newest `updated_at` first.
- `?id=<id>`: one task or `null`.
```json
{ "id": "…", "title": "", "cat": "", "reward": 0, "status": "finding", "client_wallet": null, "worker_wallet": null, "body": {}, "updated_at": "ISO|null" }
```

## POST /api/pico/tasks
Body: partial task, `id` required. Runs in a transaction with `select … for update`.
Requires the wallet signature headers. Authorization (`taskWriteDenied` in `src/lib/auth.ts`):
- New task: the signer becomes the client. `client_wallet`, if sent, must equal the signer; `worker_wallet`, if sent, must equal the signer.
- Existing task: the signer must be the task's `client_wallet`, its `worker_wallet`, or be claiming it (sending `worker_wallet` = signer).
- `client_wallet` can never be reassigned; `worker_wallet` can only be set to the signer's own wallet.
Rules:
- `body` is shallow-merged with the stored body.
- Once a task is past `finding`/`draft` and has a worker, a different `worker_wallet` gets 409 unless the new status is `completed` or `cancelled`.
- Status never moves from a late state (`review`, `verification`, `revision`, `dispute`, `completed`, `cancelled`) back to an early one; `completed` and `cancelled` are final.
Responses:
- 200: full task
- 400: `{ "error": "id is required" }`
- 401: missing/invalid/expired signature
- 403: `{ "error": "client_wallet must be the signer" | "worker_wallet must be the signer" | "client_wallet cannot be changed" | "signer is not on this task" }`
- 409: `{ "error": "taken", "row": <current task> }`
- 500: `{ "error": "<sanitized message>" }`

## POST /api/tools/run
Retired. Always 410 with an explanation.
