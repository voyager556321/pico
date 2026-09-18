# Research notes: AI pay-per-use / micropayments

**Мета:** скептичний огляд ідеї (не валідація). Для хакатон-продукту див. `HANDOFF.md`.

---

## Чи є попит?

**Так, частково.** Люди скаржаться на:
- стек підписок $20×N
- кредити що згорають
- платиш за idle capacity

**Але:**
- power users часто **хочуть** підписку (передбачуваність)
- страх bill shock у pay-as-you-go
- кожне рішення «чи варте $0.03?» втомлює (mental accounting)

**Висновок:** люди хочуть «не платити за повітря», не обов’язково «$0.01 за клік з підтвердженням». Найкраще: prepaid wallet / credits **або** агент платить сам у межах бюджету.

---

## Існуючі рішення

### Non-crypto
PanelsAI, Zeno, Riser, Metered AI, Infer Mesh, OpenRouter, офіційні API prepaid credits. OpenAI вже додає usage credits поверх планів.

### Crypto / Web3
- **x402** (Coinbase) — HTTP 402 + stablecoins
- Solvela, x402 Nexus, MCPay, Nevermined, Skyfire, PayAI
- Stripe MPP / ACP, Google AP2, Visa/Mastercard agent pay
- Багато хакатон-клонів «AI + x402 на Solana»

### Solana-specific
Payment Channels (Foundation): один депозит → багато off-chain micropayments → одне settlement. Цільовий кейс: LLM per-token, сотні дешевих викликів. Colosseum прямо підсвічував це у вересні 2026.

---

## Сильні / слабкі use cases

| Сильні | Слабкі |
|--------|--------|
| Agent → API / MCP tool | Consumer ChatGPT-клон |
| Спеціалізовані дорогі дії | «Замінити Plus на 3¢/msg» |
| Монетизація MCP servers | Generic multi-model wrapper |
| Escrow + proof of delivery | Crypto заради crypto |

---

## Перешкоди

1. Card fees (~$0.30) вбивають справжні $0.01 платежі → потрібна агрегація (prepaid/session).
2. Маржа LLM на $0.01–$0.05 тонка.
3. CAC для one-off юзерів.
4. Ринок шумний; «anti-subscription AI» уже commodity.
5. Solana ≠ унікальна перевага для людей (wallet friction); meaningful для M2M.

---

## Solana: чи дає перевагу?

**Так для:** agent rails, sub-cent settlement, x402/Payment Channels narrative.  
**Ні / слабко для:** consumer UX vs Stripe $5 top-up; диференціація vs Base/L2 x402.

---

## Хакатон-оцінка (загальна)

- «Chat + micropayments»: низька диференціація.
- «Agent spend / MCP / Payment Channels + вузький vertical»: краще.
- Локальний KRK (малий пул) легший за global Colosseum / x402 з 400+ командами.
