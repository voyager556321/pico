# Pico — пітч (KRK + Colosseum)

**Продукт:** task-based work platform on Solana — fund before work, skill match, qualify, independent verify, auto-pay.  
**Один рядок:** *Work without trust issues. Fund. Qualify. Verify. Pay.*

**Джерела структури:** [How to Win a Colosseum Hackathon](https://blog.colosseum.com/how-to-win-a-colosseum-hackathon/), [Perfecting Your Hackathon Submission](https://blog.colosseum.com/perfecting-your-hackathon-submission/).  
**Локальні критерії KRK:** Founder+Market Fit 20% · Insight 20% · Product+Execution 15% · Market Size 15% · Communication 15% · Viability 15%.

Колоссеум хоче **2 відео ≤3 хв**:
1. **Pitch** — *чому* (проблема, продукт, ринок, команда, демо-хедлайн).
2. **Technical demo** — *як* (стек, on-chain логіка, чому Solana).

Deck: [`pitch/pico-pitch.html`](pitch/pico-pitch.html) → PDF через print / Chromium (**8 слайдів**, ~3 хв).

---

## One-liner

> **Work without trust issues.**  
> A task-based work platform powered by Solana.  
> **Fund. Qualify. Verify. Pay.**

Аналогія (10 сек): як freelance milestone escrow — але без browse CV і без unilateral client Reject; купуєш **verified outcome**.

---

## Слайди (8 · ~3 хв)

| # | Слайд | Що кажеш |
|---|--------|----------|
| 1 | **Title** | Work without trust issues · Fund. Qualify. Verify. Pay. |
| 2 | **Problem** | Trust tax: companies waste time hiring; workers risk non-pay |
| 3 | **Solution** | Remove subjective decisions · Fund → Match → Qualify → Work → Verify → Pay |
| 4 | **Funding** | General Balance → lock Worker + Verifier reward before distribute |
| 5 | **Matching** | No apps / portfolios · skill-gated · qualify test · first qualified wins |
| 6 | **Verification** | Independent specialist vs Acceptance Criteria · PASS / revision · verifier paid for review |
| 7 | **Why Solana** | Programmable escrow, release, verifier reward · fast + cheap USDC |
| 8 | **Business** | Fee on deposits · future yield on idle liquidity · close the loop |

---

## Скрипт ~3:00

| Час | Текст |
|-----|--------|
| 0:00–0:20 | Title + one-liner. «Freelance still runs on trust. Pico removes that.» |
| 0:20–0:50 | Problem: companies — hiring time + uncertain quality; workers — subjective pay. |
| 0:50–1:10 | Solution flow: Fund → Match → Qualify → Work → Verify → Pay. |
| 1:10–1:40 | Funding example $200+$10=$210 locked before distribute. |
| 1:40–2:10 | Match + qualify race. No portfolios. First qualified gets the task. |
| 2:10–2:35 | Independent verify vs Acceptance Criteria. Verifier paid for review, not verdict. |
| 2:35–2:50 | Why Solana: programmable lock/release. Business: fee on deposits. |
| 2:50–3:00 | Close: less hiring time · money exists · pay follows verified work. Demo link. |

### Technical demo ~2:00 (окреме відео)

1. Program ID + explorer.  
2. General Balance / task lock / vault.  
3. Flow: fund → match/qualify → work → verify → pay.  
4. Why Solana (escrow rules, not custodial spreadsheet).  
5. Stack: Anchor + Next.js + USDC.

---

## Cheat sheet

| Питання | Відповідь |
|---------|-----------|
| Чому не Upwork? | Вони hiring marketplace. Ми — funded task + qualify + independent verify. |
| Чому Solana? | Programmable escrow; funds locked before work; transparent release. |
| Де money? | Platform fee on General Balance deposits; later yield on unused liquidity. |
| Хто вирішує pay? | Independent verifier against Acceptance Criteria — not only the client. |
| Cold start? | Wedge skills; operator-issued credentials; qualify tests per task. |

---

## Артефакти

| Файл | Призначення |
|------|-------------|
| `pitch/pico-pitch.html` | 8 слайдів (print → PDF) |
| `PITCH.md` | цей документ |
| `programs/pico/README.md` | on-chain flow |
