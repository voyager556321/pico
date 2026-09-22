# Pico web layers

Three folders — different owners, clear boundaries.

| Layer | Path | Owner | Responsibility |
|-------|------|--------|----------------|
| **Platform** | `src/platform/` | Product / you | How the product *must* behave: FLOW rules, roles, **protections** (KYC, anti-cheat, rate limits later) |
| **Domain** | `src/domain/` | Engineers | How to *execute*: Solana txs, localStorage, demo stubs |
| **UI** | `src/ui/` (+ `components/app` views) | Designer | How it *looks*: layout, CSS, copy presentation via capabilities |

```
UI  ──reads──►  TaskCapabilities (platform)
UI  ──calls──►  domain actions (which assert platform protections)
```

## Add a protection

1. `src/platform/protections/my-guard.ts` — implement `Protection`
2. Register in `protections/registry.ts`
3. UI automatically gets `caps.canX === false` and `caps.blocks.x`

No designer changes required.

## Controllers vs views

- Controllers: `components/app/*Page.tsx` — wire hooks + capabilities + actions
- Views: e.g. `ui/app/TaskDetailView.tsx` — pure presentation

Infra (IDL, PDAs, constants) stays in `src/lib/`.
