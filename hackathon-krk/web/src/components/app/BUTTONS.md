# Pico Design System — Buttons

Source: Figma `03 — Design System`  
https://www.figma.com/design/UG9ZJPAmjmqtmRImkN9c7R/Blockchain-hack-Krakow?node-id=3-3

## Variants

| Class | Use |
|-------|-----|
| `.btn-primary` / `.btn-pink` | Main CTA (Add funds, Run tool, Launch) |
| `.btn-secondary` | Secondary (Withdraw, Cancel outline) |
| `.btn-ghost` | Text / soft (Paste, Back, Cancel text) |
| `.btn-icon` | Square icon-only |

## States (implemented in CSS)

| State | Behavior |
|-------|----------|
| **Default** | Solid pink / bordered / text |
| **Hover** | Brighter pink + stronger glow (primary); border pink tint (secondary) |
| **Active** | Slight press (`translateY` + darker) |
| **Focus** | Pink outline ring |
| **Disabled** | Muted pink / 40% opacity, no shadow, `not-allowed` |
| **Loading** | `.btn-loading` + `.btn-spinner`, `pointer-events: none` |

## Sizes

| Class | Height |
|-------|--------|
| `.btn-sm` | 36px |
| `.btn-md` | 44px (default) |
| `.btn-lg` | 52px |

## React

```tsx
import { Btn, BtnPink, BtnGhost } from "@/components/app/ui";

<BtnPink loading={busy}>Run Token Check</BtnPink>
<BtnGhost>Withdraw</BtnGhost>
<Btn variant="ghost" size="sm">Paste</Btn>
```
