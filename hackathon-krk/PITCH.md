# Pico — пітч (KRK + Colosseum)

**Джерела структури:** [How to Win a Colosseum Hackathon](https://blog.colosseum.com/how-to-win-a-colosseum-hackathon/), [Perfecting Your Hackathon Submission](https://blog.colosseum.com/perfecting-your-hackathon-submission/), патерни суддів (traction first, demo early, one-liner, why Solana), DePitch / winning decks (Surf Cache, Nomu, Spend…).  
**Локальні критерії KRK:** Founder+Market Fit 20% · Insight 20% · Product+Execution 15% · Market Size 15% · Communication 15% · Viability 15%.

Колоссеум хоче **2 відео ≤3 хв**:
1. **Pitch** — *чому* (проблема, продукт, ринок, команда, демо-хедлайн).
2. **Technical demo** — *як* (стек, on-chain логіка, чому Solana) — не другий пітч.

Нижче — слайди + скрипти під **Pico**.

---

## One-liner (запам’ятати)

> **Give your AI a budget, not your wallet.**  
> Prepaid USDC spend layer for on-demand AI tools on Solana.

UA: *Кинь агенту ліміт, не весь гаманець. Передплачений USDC-бюджет під AI tool calls на Solana.*

Аналогія (10 сек): як передплачена картка в кав’ярні — кинув $5, кожна дія $0.01–$0.05, видно залишок, можна закрити рахунок.

---

## Що вирішуємо (проблеми)

| # | Біль | Хто страждає | Як Pico закриває |
|---|------|--------------|------------------|
| 1 | Підписки не пасують до bursty AI / agent loops | Builderи агентів, power users | Pay-per-call з prepaid vault |
| 2 | 6–8 окремих prepaid-балансів (Exa, OpenRouter…) | Indie builders | Один on-chain spend vault + meter |
| 3 | Агенти не вміють Stripe / KYC checkout | Autonomous agents | Wallet + USDC; людина задає стелю |
| 4 | Страх «віддати агенту весь wallet» | Будь-хто з ключами | Hard spend ceiling, не full custody |
| 5 | Непрозорі Solana txs / scam-токени | Retail / semi-pro | Explain Tx ($0.01) + Token Check ($0.05) |
| 6 | Карткові fees вбивають $0.01 charges | Micropayment products | Solana fees + USDC escrow |

**Не кажемо:** «ми замінимо ChatGPT» / «ми єдиний x402».  
**Кажемо:** control layer — budget UX + meter + debit на Solana; tools — перший wedge.

Деталі болів → `MARKET-PAINS.md`.

---

## Навіщо створили

1. **Особистий біль:** AI-агенти й tool calls вже є, а платіжний UX — ще підписки й API-ключі. Люди не хочуть клікати $0.02 п’ятдесят разів; агенти — так. Потрібен **безпечний spend layer**.
2. **Чому зараз:** agent economy + narrative x402 / Solana payments; fees дозволяють $0.01–$0.05.
3. **Чому ми:** 1 eng + 1 design — швидкий loop «on-chain escrow → живий meter → корисні Solana tools»; founder-market fit під AI + Solana builders.
4. **Чому Solana (обов’язково сказати суддям):** лише дешеві + швидкі rails роблять micropayment за tool call економічним; custom Anchor program = суддівський mandatory для KRK і доказ, що це не обгортка над Stripe.

---

## Що вже працює (MVP — говорити в теперішньому часі)

- Custom **Anchor** program на **Devnet** (config / budget PDA / vault / debit / withdraw).
- **Next.js** app: landing `/` + app `/app`, Phantom, live balance.
- 2 платні tools через Gemini: **Explain Tx** ~$0.01, **Token Check** ~$0.05 → analyze-then-debit.
- Deploy: [hackatonpico.vercel.app](https://hackatonpico.vercel.app) · GitHub: `voyager556321/pico`.
- Program ID: `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j`.

---

## Технології

```text
Phantom / wallet-adapter
        │
   Next.js 15 (App Router)  ← UI + /api/tools/run
        │  operator Keypair signs debit
        ▼
 Anchor program "pico" (Rust) on Solana Devnet
   Config PDA · Budget PDA · USDC vault ATA · treasury
        │
   Gemini (token/tx analysis)
```

| Шар | Стек |
|-----|------|
| On-chain | Rust, Anchor, PDAs, SPL Token (Devnet USDC) |
| Client | Next.js, TypeScript, `@coral-xyz/anchor`, wallet-adapter |
| AI | Google Gemini (`@google/genai`) |
| Deploy | Solana Playground → Devnet · Vercel · GitHub |

**Інструкції on-chain:** `initialize_config` → `initialize_budget` → `deposit` / `debit(amount, tool_id)` / `withdraw_remaining`.

---

## Слайди (8–10 · ≤40 слів на слайд · заголовок = takeaway)

Формат як у виграшних: **не** «Problem», а конкретний біль у title.

### 1. Title
**Pico — Give your AI a budget, not your wallet**  
A payment layer for on-demand AI · Solana  
Team: [імена] · Kraków / remote

### 2. Problem (insight)
**Agents need to spend. Humans won’t hand over the wallet.**  
Subscriptions waste money on idle capacity. API keys die at 2am. Full wallet access is a non-starter.

### 3. Who it’s for
**First users:** Solana builders & traders who run AI tools in bursts — not $20/mo for occasional Explain Tx.  
Next: agent runtimes that need a hard USDC ceiling.

### 4. Solution
**Prepaid USDC vault + metered debit per tool call.**  
Deposit once → price before click → balance falls → withdraw what’s left.

### 5. Why Solana
**$0.01 tool calls only work on cheap rails.**  
Custom Anchor escrow + operator debit = auditable spend, not a Stripe wrapper.

### 6. Product / demo (вставити Loom 45–60с)
**Live on Devnet:** deposit → Explain Tx → Token Check → meter + explorer.  
Link: hackatonpico.vercel.app/app

### 7. How it works (1 діаграма)
User wallet → Budget PDA / vault → operator `debit` → treasury · Gemini runs tool first.

### 8. Competition (чесно)
OpenRouter / x402 gateways meter APIs.  
**Pico wins the UX wedge:** hard budget vault + consumer control + Solana-native tools (tx / token).

### 9. Traction / validation (що є — без фантазій)
Working Devnet demo · custom program live · 2 paid tools · deployed web.  
[Додати: цитата з Telegram / N builderів спробували / waitlist — як з’явиться.]

### 10. Ask / next (не «roadmap на 2 роки»)
**KRK:** win local + Colosseum submit.  
**Next 6 weeks:** more tools / MCP on the same budget · mainnet when fees & custody ready.  
**Ask:** try the demo · feedback · intro to agent teams.

~~Не слайд «roadmap з 12 фічами»~~ · ~~не «revolutionary» без цифр~~.

---

## Скрипт пітчу ~90 сек (локальний KRK)

| Час | Текст |
|-----|--------|
| 0:00–0:15 | «AI-агентам потрібен spend layer, не підписка. Люди не віддадуть весь гаманець — потрібен ліміт.» |
| 0:15–0:25 | «Pico — prepaid USDC budget для AI tool calls на Solana. Give your AI a budget, not your wallet.» |
| 0:25–0:55 | **Демо:** Phantom → deposit → Explain Tx → Token Check → баланс падає → explorer. |
| 0:55–1:10 | «Під капотом: custom Anchor — vault, debit, withdraw. Gemini аналізує; operator списує on-chain.» |
| 1:10–1:25 | «Ринок: agent payments + micropayments. Наш клин — budget UX, не ще один чат.» |
| 1:25–1:30 | «Спробуйте hackatonpico.vercel.app. Далі — будь-який tool на той самий budget.» |

### Colosseum pitch video ~2:30 (Loom)

1. Team (15с) — хто ви, чому AI + Solana.  
2. Problem + who (30с).  
3. Product one-liner + **чому побудували** (20с).  
4. Market / why now / why Solana (25с).  
5. Demo на екрані (45с).  
6. Traction + how get users (20с).  
7. Closing memorable line + link (15с).

### Technical demo video ~2:00 (окремо)

Без маркетингу. Показати:
1. Program ID + explorer.  
2. PDAs: config / budget / vault.  
3. Flow: initialize_budget → debit з `tool_id` → SpendEvent.  
4. `/api/tools/run`: Gemini → потім operator sign.  
5. Чому operator model (не user підписує кожен $0.01).  
6. Stack one-liner: Anchor + Next.js + Gemini + USDC.

---

## Cheat sheet під питання суддів

| Питання | Відповідь |
|---------|-----------|
| Чому не OpenRouter? | Вони агрегатор API. Ми — on-chain budget + control UX + Solana tools. |
| Чому не віддати ключ агенту? | Саме цього уникаємо: ceiling у vault, withdraw anytime. |
| Де money? | Fee на tool call / treasury share; later marketplace tools на той самий debit. |
| Mainnet? | Devnet для хакатону; mainnet коли custody + operator ops готові. |
| Моат? | UX + escrow primitive + рання дистрибуція до Solana AI builders; протокол x402 — сумісний наратив, не конкурент 1:1. |

---

## Чеклист перед виступом / сабмітом

- [ ] One-liner сказати вголос некрипто-другу — чи зрозумів за 5 сек?  
- [ ] Демо записане (live може впасти) + Phantom на **Devnet**.  
- [ ] Repo public · README · program ID · Vercel link.  
- [ ] Env на Vercel: `GEMINI_*`, `OPERATOR_*`, RPC.  
- [ ] Pitch video ≠ technical demo.  
- [ ] Немає locked Google Doc / private Loom.  
- [ ] 1 конкурентний слайд, без feature soup.  
- [ ] Закінчити CTA, не «дякуємо».

---

## Посилання команди

| | |
|--|--|
| Live | https://hackatonpico.vercel.app |
| App | https://hackatonpico.vercel.app/app |
| GitHub | https://github.com/voyager556321/pico |
| Program | `6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j` (devnet) |
| Більше болів | `MARKET-PAINS.md` |
| Handoff | `HANDOFF.md` |
