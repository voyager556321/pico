# Domain layer — how Pico *executes*

Chain calls, localStorage, demo stubs, data hooks.

- Uses `@/platform` `assertAction` before sensitive writes when a context is provided.
- No Tailwind / layout — designers do not edit this folder.

Infrastructure still lives under `src/lib/` (Anchor IDL, PDAs, constants). Domain orchestrates it.
