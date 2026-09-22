# Platform layer — how Pico *should* work

This folder is the **product rules + protections** layer.

- Encodes FLOW.md (slots, who may act, hiring vs working).
- Exposes **capabilities** the UI may render (buttons, gates).
- Holds a **protection registry** — add new guards here without touching design.

Designers do **not** edit this folder. They only consume `TaskCapabilities` / view-models from controllers.

```
platform/  →  what is allowed & why
domain/    →  how to execute (chain / storage)
ui/        →  how it looks
```

## Add a protection

1. Create `protections/my-guard.ts` implementing `Protection`.
2. Register it in `protections/registry.ts`.
3. Capabilities / `assertAction` pick it up automatically.

UI stays dumb: if `caps.canQualify` is false, hide the button.
