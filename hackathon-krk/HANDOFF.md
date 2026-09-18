# Handoff: Blockchain Hack Kraków + Colosseum

**Оновлено:** 2026-09-16  
**Статус:** on-chain дизайн підтверджено; Anchor `lib.rs` готовий під Playground  
**Команда:** 1 dev + 1 UI/UX  
**Назва:** **Pico** — *A payment layer for on-demand AI*

Повертаєшся сюди → читай цей файл зверху вниз.  
Правила для агента: `.cursorrules` (обов’язковий custom Anchor + Playground).  
Деталі ринку — `RESEARCH.md`. **Болі ринку (оновлено) — `MARKET-PAINS.md`**. UI — `UI-BRIEF.md`. **Figma для дизайнерки — `FIGMA-BRIEF.md`**. Програма — `programs/pico/`.
Web: лендинг `/` · апка `/app`.

---

## Хакатон

| | |
|---|---|
| **Локальний** | [BLOCKCHAIN HACK KRAKOW](https://luma.com/BlockchainHackKRK) — Superteam Poland |
| **Де** | Zabłocie 20, Kraków |
| **Коли** | 19–20 вересня 2026 (kickoff 10:00, pitch 20.09 ~18:00) |
| **Вимога** | Проєкт **на Solana** |
| **Важливо** | Щоб виграти локально — треба також податись на **Colosseum** (Crypto World’s Fair, 14.09–12.10.2026) |
| **Критерії (з минулого KRK)** | Founder+Market Fit 20%, Insight 20%, Product+Execution 15%, Market Size 15%, Communication 15%, Viability 15% |

Мета локального: head start під Colosseum, не «ідеальний стартап за 48г».

---

## Продукт (що будуємо)

**НЕ** новий Solana wallet (не Phantom).  
**ТАК** prepaid budget для AI-дій / agent tool calls.

### One-liner
> Prepaid USDC budget for AI tool calls on Solana. Deposit once, pay per call, see the meter, settle.

### Аналогія для людей
Як передплачена картка в кав’ярні: кинув $5 → кожна дія $0.01–$0.05 → завжди видно залишок → можна закрити рахунок.

### Бренд
- **Pico**
- Tagline: **A payment layer for on-demand AI**

### Scope на 48 годин
1. Deploy custom Anchor program (Playground → devnet)
2. Deposit $1 / $2 / $5 USDC into on-chain vault
3. **2 tools** з ціною до кліку (operator `debit` on-chain):
   - Explain Tx — ~$0.01 (`tool_id = 1`)
   - Token Check — ~$0.05 (`tool_id = 2`)
4. Live meter з Budget PDA + історія / explorer
5. `withdraw_remaining` + кнопка «Agent: run 10 calls»

### Поза scope
- ChatGPT-клон / multi-model chat
- Marketplace агентів / reputation
- 10 tools / повний MCP ecosystem
- Локальний Rust/Solana CLI (див. `.cursorrules` → Playground)

### Стек (обов’язково per `.cursorrules`)

```text
[Next.js + wallet adapter]
        │
        ▼
[API: LLM tools + operator Keypair]
        │  debit(amount, tool_id)
        ▼
[Custom Anchor program "pico" on Devnet]
   Config PDA · Budget PDA · Vault ATA (USDC)
[OpenRouter / LLM]
```

- **On-chain:** Rust/Anchor у [Solana Playground](https://beta.solpg.io) — код у `programs/pico/src/lib.rs`
- **Off-chain:** Node/Next.js локально; IDL після деплою
- **Mint:** Devnet USDC `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

### On-chain інструкції
`initialize_config` → `initialize_budget` → `deposit` / `debit` / `withdraw_remaining`  
Деталі: `programs/pico/README.md`

---

## Пітч (90 сек)

1. Агентам потрібен spend layer, не підписка.  
2. Deposit $2.  
3. 1× Explain Tx → результат + списання.  
4. 1× Token Check → результат.  
5. Agent demo: 8–10 calls, баланс падає.  
6. Settle → explorer.  
7. Далі: будь-який MCP tool на той самий budget.

**Одне речення:**  
«Люди не платять по $0.02 за клік п’ятдесят разів — агенти так. Ми робимо безпечний budget UX для AI tool calls на Solana.»

---

## Розподіл ролей

| Dev | UI/UX |
|-----|--------|
| Solana pay + backend + LLM calls | Figma → 4–6 екранів |
| Metering / debit / settle | Budget UX, страх overspend |
| Demo script | Pitch visuals / landing copy |

---

## План weekend

| Коли | Що |
|------|-----|
| Сб вечір | Deposit + 1 paid tool + debit у UI |
| Нд до 14:00 | Другий tool + settle + polish |
| Нд 14–18 | 90-сек демо, пітч, submit Colosseum |

---

## Висновки з дослідження (коротко)

- Pay-as-you-go AI **вже існує** без крипти (PanelsAI, Zeno, OpenRouter…) — не позиціонувати як «перші у світі».
- Люди частково ненавидять підписки, але **мікроплатіж за кожен клік людині** — поганий UX (mental accounting).
- Сильний кейс = **агенти / tools / MCP**, не consumer chat.
- Solana має сенс для settlement; перевага слабша vs «просто prepaid Stripe».
- На KRK шанси кращі з **Agent Spend + 2 tools + гарний UX**, ніж з chat-клоном (~30–45% топ-3 якщо добре виконати vs ~10–15% за банальний chat).

Детальніше → `RESEARCH.md`.

---

## Наступні кроки (коли повернешся)

- [x] Обрати фінальну назву → **Pico**
- [x] Deploy Anchor на devnet + initializeConfig/Budget + debit
- [ ] UI/UX: Figma за `UI-BRIEF.md` (паралельно з web)
- [ ] `cd web && yarn install` + `.env.local` з OPERATOR_SECRET_KEY
- [ ] `yarn dev` — Phantom Devnet demo
- [ ] Зареєструватись / податись на Colosseum
- [ ] Підготувати 90-сек демо-скрипт

### Web app
Див. `web/README.md`. Код UI: `web/src/components/PicoApp.tsx`.

---

## Посилання

- Luma KRK: https://luma.com/BlockchainHackKRK  
- Colosseum / Payment Channels контекст: https://blog.colosseum.com/crypto-worlds-fair-crash-course-payment-channels/  
- x402 на Solana: https://solana.com/x402/what-is-x402  
