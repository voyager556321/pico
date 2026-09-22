# UI layer — how Pico *looks*

Presentational components + chrome. Designers work here.

- Receive **view-models** and **capabilities** from controllers (`components/app/*Page.tsx` or route wrappers).
- Do **not** call `program.methods`, Anchor, or edit `platform/protections`.
- Prefer props like `caps.canQualify` over re-deriving business rules.

```
platform/  → rules + protections
domain/    → execute actions
ui/        → render
```

Existing design system tokens live in `src/app/globals.css` (`.app-dark`).
Shared primitives remain in `components/app/ui.tsx` until fully moved here.
