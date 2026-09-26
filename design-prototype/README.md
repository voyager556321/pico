# Pico — design prototype (branch `design`)

Clickable prototype of the Hiring-side screens from Figma (file "Blockchain hack Krakow", page `05 — Task Marketplace`).
Screens are 1440px renders from Figma. On top of them sit **live components built from the Pico design system tokens**
(colors, radii, type, Button Glow, Focus Ring), so you can test the states, not just the links.
No backend, no wallet, sample data only. It lives in its own folder `design-prototype/` and does not touch the app.

## Open locally
Double-click `index.html`. Use the "Screen" menu or click through. "Show clickable areas" outlines everything interactive.
Keyboard works too: Tab moves focus (Focus Ring), Enter/Space activates, arrows move inside tabs and dropdowns, Esc closes a dropdown.

## Component states you can test
- **Button** (Primary / Secondary / Ghost / Danger × L / M / S): hover, pressed, focus, loading, disabled.
  - Loading: Home → Create task (with text), Company profile → Save changes, Workroom → Send.
  - Disabled: Save changes and Discard until you edit something; Send while the message is empty.
- **Input**: default, hover, focus, filled, validating, success, error.
  - Website: checks the format, then "Checking the link…" → verified (green check). Without https:// it adds it on blur.
    To see the "doesn’t open" error, type an address with `broken` or ending in `.test`, e.g. `https://broken.test`.
  - Notification email: format check. The original address shows as verified. A new valid address shows the "confirmation link after you save" note.
  - Company name: empty → required error. Short description: live character counter (max 160), empty → error.
  - Save with an error focuses the broken field and says how many fields to fix.
- **Select**: opens a menu with a checkmark on the current option (My tasks, Activity, Settings, Company profile time zone).
- **Search** (My tasks): focus state, clear button.
- **Tabs**: hover, selected, focus. In the Workroom they switch screens; elsewhere they switch selection only (the list is static).
- **Chips**: Landing = single choice, Company profile = multi-select (at least one must stay on), Home = fills the task composer.
- **Toggle** (Settings): on / off, hover, focus, with a confirmation toast.
- **FAQ** (Help & disputes): expand / collapse, one open at a time.
- **Sidebar, task rows, links**: hover, pressed, focus; the current page is marked.

## Create task flow (new)
Start on **Home**: type in "Describe the result you need…" and press **Create task** (or click a suggestion chip).
1. **Describe** — description (live counter, required), title (required), category chips switch Design / Development / QA questions, answer chips (one or several), selects, link fields with verification.
2. **Scope & criteria** — Level and Deadline selects, copy-document link.
3. **Worker test** — "What the test is based on" → **Generate test** → generating → questions Pico wrote (Edit / Regenerate / Preview). Continue is disabled until the test exists. No time limit.
4. **Budget & publish** — type a budget: totals, Available → after, Locked → after update live. Independent verification toggle adds a 10% reviewer fee (assumption). Budget above the balance switches to the **Not enough balance** state.
   Turning Independent verification on shows **How many reviewers?** (1 / 3 / 5, fee per reviewer = 10% of the budget, assumption) and recalculates everything.
   **Add funds** opens the Phantom modal: amount + 50/100/200/Max, validation against the wallet (1,240.00 demo), Waiting for Phantom → Funds added (or "Prototype: reject in Phantom"). After adding, you can publish.
5. **Lock and publish** → task page "Finding a worker" with the locked amount. **Candidates who passed**: click a row, View answers or Message to open the candidate panel with their test answers and a pre-assignment chat (you can send messages).
Add funds also works from Home and Balance. Numbers on the static renders (Home, Balance) don't change — only the live fields do.
Steps 2–4 are drawn on the Design example; from Development / QA a note says so.

## Page logic (every task opens its own page)
One task page, many states — the layout follows the state, the top card always says what happens next:
| Task (Home / My tasks) | State | Page | What you can do |
|---|---|---|---|
| Sign-up regression test | Work submitted | Workroom (Review / Conversation / Files / Activity) | Accept and release, Request changes |
| Landing copy QA | Dispute · your move | Dispute page | Reply in the thread, Add evidence, Accept the work instead |
| Spring sale landing page, Pricing page redesign | Finding a worker | Task page · worker test | See test stats, candidates who passed (answers + chat), cancel and unlock funds |
| Checkout layout fixes | In progress | Task page · conversation | Reply to the worker, propose a change, add links |
| Payment webhook | Reviewer is checking | Task page · verification | Nothing to do; see the submission; chat |
| Onboarding illustrations | Worker is revising | Task page · revision | See your change request, message the worker |
| Launch banner set, Icon set cleanup | Paid | Read-only task page | Proof, delivered files, criteria met |
| API docs review | Cancelled · refunded | Read-only task page | Proof, Create a similar task |
| Mobile nav audit | Draft | Create task form, prefilled | Finish and publish |
Balance (Locked by task, History) and Activity events open the same task pages. Help → Reply in dispute / Add evidence open the dispute.
**Working mode** (Hiring / Working switch, Find work, View task, Switch to Working): Find work → a task → take the test (link + choice answers, validated) → Pico grades → Passed, on the candidate list.

## Everything is wired (latest)
- **Top bar on every app screen:** Search (or Ctrl/Cmd+K) finds pages and tasks; bell opens notifications that link to the right task; the wallet chip opens a wallet menu (copy address, add funds, Balance, disconnect); "Working" and all worker-side buttons lead to How it works (worker lane); the account block opens Company profile; the logo goes Home.
- **Task rows** on Home and My tasks open the page for their state (review, conversation, activity, task page, Balance for paid/refunded, the form for the draft). Row chat icons open the chat, "…" opens a small menu.
- **My tasks / Activity / Balance tabs** filter the list (non-matching rows are dimmed); My tasks search filters by task name.
- **Workroom:** Accept and release → confirmation → Paid; Request changes → pick criteria + "What is missing?" (validated); Propose a change; Add link (validated).
- **Help:** Contact support, Reply in dispute, Add evidence, Open a dispute — each is a form with validation.
- **Settings:** Disconnect asks for confirmation. **Create task:** edit/add criteria, edit test questions, worker preview.
- Proof links and "Open link" say where they would go (external, not linked in the prototype).

## Where the flows go
- Sidebar on every app screen → all menu pages.
- Home / My tasks: "Sign-up regression test" row and "Review work" → Workroom; "Landing copy QA" row and "Reply" → Help & disputes; "View all tasks" → My tasks.
- Workroom: tabs Review / Conversation / Files & links / Activity, "Message worker", "← My tasks", breadcrumb.
- Activity: "Open workroom", "Open dispute". About Pico / How it works / Landing: "Create a task", "Hire for a task", "See how it works".
- Buttons whose next screen isn’t designed yet (Add funds, Accept and release, Request changes, Disconnect, worker side…) respond with their states and a message saying what comes next. **Nothing is paid or released.**

## Assumptions to confirm with the developer
Link check (does the site respond), email confirmation flow, and whether Website is optional are simulated here, not real.

## Put it on GitHub (branch `design` only — never `main`)
GitHub Desktop: open the pico repo → Current branch: `design` → copy this folder into the repo as `design-prototype/` → Commit to design → Push origin.
Terminal:
```
git checkout design
git pull
# copy this folder into the repo root as design-prototype/
git add design-prototype
git commit -m "Prototype: live design-system states for hiring screens"
git push origin design
```

Real elements, not pictures (new)

22 of 24 screens are now built from real HTML elements exported from the Figma file: every text, card, badge and icon is a DOM element at the same position as in Figma (texts in Manrope, colors, radii, shadows and gradients from the layers). You can select and inspect them, and Claude's Design mode can target them. Live components (buttons, fields, chips, toggles) sit on top as before. Two Workroom tabs (Files & links, Activity) are still images.

Your text stays (new)

What you type in Create task carries through the whole flow: the title and description from step 1 (or from the Home composer, where Pico suggests a title from your description) show up in the stepper, in "What the test is based on", in the Summary before publishing and on the published task page. Switching category keeps your text. Everything you type or change is saved in this browser, so it survives a reload. "Reset demo" in the top bar clears it and starts over.
