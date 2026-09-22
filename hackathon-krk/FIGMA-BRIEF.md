# Pico — Figma brief (hackathon MVP)

**Продукт:** Pico  
**Tagline:** AI tools. Real control. On-chain.  
**One-liner:** Give your AI a budget, not your wallet.  
**Платформа:** responsive web (mobile-first ~390px + desktop)  
**Мережа демо:** Solana Devnet  
**Референс візуалу:** Nora mockups (dark + pink/purple/orange neon + glass)  
**UX source of truth:** `Blockchain hack Krakow.pdf`  
**Живий код:** `hackathon-krk/web` (логіка вже працює — Figma = polish / hi-fi)

---

## 1. Бренд і палітра

| Token | Value | Використання |
|-------|--------|----------------|
| `--bg` | `#07060F` | фон |
| `--bg-2` | `#120B1F` | градієнт низу |
| `--panel` | `rgba(28,18,48,0.72)` | glass cards |
| `--text` | `#F4F0FF` | основний текст |
| `--muted` | `#A89BC4` | вторинний |
| `--pink` | `#FF4FD8` | градієнт / акцент |
| `--purple` | `#8B5CFF` | градієнт |
| `--orange` | `#FF8A3D` | градієнт |
| `--border` | `rgba(255,255,255,0.10)` | обводки |
| Gradient CTA | `135deg #FF4FD8 → #8B5CFF → #FF8A3D` | кнопки Run / Add / Connect |

**Шрифт:** Manrope (400/500/600/700/800) для UI · **IBM Plex Mono** лише для адрес, signature й tx hash  
**Logo mark:** літера **P** у rounded square з gradient fill  
**Не використовувати:** Nora як назву; Inter/Roboto; Sora; світлу тему для MVP

**Ключові меседжі (EN, готові в макет):**
- «Give your AI a budget, not your wallet.»
- «This is a spending limit, not full wallet access.»
- «Built on Solana»
- «Hard limit: the agent can’t spend more than your budget.»

---

## 2. Що вже реалізовано в коді (не ламай flow)

1. Connect Phantom  
2. Add funds $1 / $2 / $5 → on-chain budget  
3. Tools: Token Check ($0.05), Explain Tx ($0.01)  
4. Result + charge + remaining  
5. Agent Demo (8× Explain, est. $0.08)  
6. Activity list + explorer proof  
7. Withdraw remaining  

Figma має покращити **екрани/стани/мікрокопі**, а не змінювати бізнес-логіку.

---

## 3. Екрани MUST HAVE у Figma

Малюй як **frames 390×844** + desktop variant 1280 (опційно).

### A. Connect / Entry
- Logo Pico + hero «Real control. On-chain.»
- Chips: Analyze / Automate / Simplify
- CTA: Connect Phantom
- Microcopy: підключення ≠ доступ до коштів
- Badge: Built on Solana · Devnet
- States: default · connection rejected · Phantom not found

### B. Create budget
- Title: Set your spending budget
- Presets: $1 · $5 · $10 · $20 + Custom
- Big amount display
- Wallet USDC balance
- Line: «This is a spending limit…»
- CTA: Deposit $X.00
- States: processing · rejected · insufficient USDC · success toast

### C. Home / Tools Dashboard
- Greeting optional (можна без імені)
- **Available Budget** card: $X.XX USDC
- Progress: Spent $Y / $Z limit
- Manage budget link
- Tabs: All tools · Blockchain (Popular/Content можна як disabled chips)
- Tool rows/cards:
  - Token Check — Check token info, price and risks · $0.05
  - Explain Transaction — Get a clear explanation… · $0.01
  - Research — Nice-to-have, можна «Coming soon»
- Agent Demo card
- Recent Activity (3 останні)
- Bottom nav (optional visual): Home · Tools · Activity · Settings (Settings = empty/disabled)

### D. Tool run — Token Check
- Input: Token address (+ Paste / Use sample)
- Cost summary: Cost · Available · After this check
- CTA: Run Token Check · $0.05
- States: empty/disabled · invalid address · insufficient budget (CTA → Add Funds) · processing · success

### E. Result + receipt
- AI Insights / risk summary (placeholder content ok)
- Charged $0.05 · Remaining $4.95 · Status Paid
- View proof / transaction
- Disclaimer: Automated analysis. Not a guarantee of safety.
- CTA: Run again / Back to tools

### F. Agent Demo
- Calls: 8 (або 10 у дизайні — узгоджено з девом: зараз 8)
- Estimated maximum cost: $0.08
- Available budget
- Hard limit copy
- Progress 1/8 … 8/8
- States: running · budget limit reached · completed

### G. Activity
- List: tool · time · price · status
- Empty: No activity yet · Explore tools
- Details (nice): proof link

### H. Manage Budget
- Initial · Spent · Calls · Remaining
- Keep balance for later
- Withdraw remaining balance
- Success: $X USDC returned + tx link

### I. Add Funds (bottom sheet)
- Current → New budget
- Amount chips
- Return context: tool / agent / dashboard

---

## 4. Компоненти (library)

- Budget card  
- Tool card / tool row  
- Amount chips  
- Cost summary block  
- Gradient primary button (+ disabled / loading)  
- Ghost / chip button  
- Input + error  
- Status badge: Paid / Pending / Failed  
- Activity row  
- Agent call row  
- Toast / banner  
- Wallet connect button (стиль як у референсі)

---

## 5. Стани, які обов’язково показати

| State | Де |
|-------|-----|
| Processing | Deposit, Run, Withdraw, Agent |
| Insufficient budget | Tool CTA → Add Funds |
| Budget = $0 | Dashboard |
| Wallet disconnected | Banner Reconnect |
| Invalid input | Tool field |
| Empty activity | Activity |
| Agent budget limit reached | Agent Demo |
| Withdraw success | Manage Budget |

---

## 6. Відповіді дева (для текстів у Figma)

1. **Charge when?** Після успішного on-chain `debit`.  
2. **Failed after debit?** Рідко; не обіцяти «not charged» якщо debit уже confirmed.  
3. **Settle?** У UI = **Withdraw remaining** / **Keep balance** (слово settle не треба).  
4. **Keep balance?** Бюджет лишається активним без expiry.  
5. **Activity storage?** UI history + on-chain tx proof (не повний on-chain journal).  
6. **Agent Demo:** 8× Explain Tx @ $0.01 → est. max **$0.08**.

---

## 7. Пріоритет малювання (порядок)

1. Home / Budget + Tools (C)  
2. Token Check run + result (D+E)  
3. Connect + Create budget (A+B)  
4. Agent Demo (F)  
5. Manage Budget + Add Funds sheet (H+I)  
6. Activity + error states  

**Не треба зараз:** логін, профіль, маркетплейс tools, нотифікації, кілька бюджетів, графіки.

---

## 8. Handoff дизайнера → дева

Віддати:
- Figma file з auto-layout  
- Export іконок SVG  
- Текст-стилі (Manrope + IBM Plex Mono для адрес/хешів)  
- Спеки spacing 8pt grid  

Дев мапить на існуючий `PicoApp.tsx` — нові екрани як sections/modals, без нового смартконтракту.

---

## 9. Pitch one-liner для обкладинки Figma

> **Pico** — prepaid USDC budget for on-demand AI tools on Solana.  
> Humans and agents pay per action — never more than the budget.
