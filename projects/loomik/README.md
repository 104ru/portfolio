# Experimental Loomik

Separate local implementation in `loomik-experimental`.

Visual reference: https://lovable.dev/preview/xk0B8DPXGHF5TWCIdnhnpImPJMqlfmRs

Data source: the existing Loomik records in `src/data`, originally from https://liza-bam.github.io/loomik-app/. The GitHub Pages app is the data source, **not** the visual reference. Original company identities, scores and contact details are retained. Nine experimental draft follow-ups fill previously empty Moves lists for Shopify, Slack and Figma.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Open http://127.0.0.1:5174/.

## Implemented

- Reference account view: deal cards, central chat, compact Moves panel.
- Reference deal view: company rail, All Deals navigation, probability ring, stakeholder cards and scoped Moves. Single stakeholder column at normal widths; two only on large screens with enough pane width. Compact labels use logos with hover names.
- Persistent, independently resizable columns for account and deal views. Drag either divider, use arrow keys (Shift for larger steps), or double-click/Home to reset. Moves collapse and expand.
- Priority and company filters, stakeholder detail panels, compact email/meeting editors, signal/risk dialogs, reference-style signal history. Editors put the goal beside attachments, with pills on top and no redundant reasoning card.
- Tables and charts generated from Loomik records, sorting, view switching, expansion, context-aware follow-up charts. Risk counts reflect the current pending signal state.
- Suggested calls and scripted simulations with pause/advance/end controls, existing call review panel, saved transcript/recap and selectable follow-up Moves.
- Company profiles expose the source overview, contacts, activity and calendar records. Open the company name beside All Deals in a deal view.
- Moves show stakeholder photos in both expanded and collapsed views, plus compact titles when collapsed.
- Per-deal chat histories retained in the browser session. User-authored message text is stored verbatim; no canned user messages are inserted.
- Responsive panel navigation on narrow screens.

## Scope

The main account/deal/history layouts follow the supplied Lovable prototype. Data-dependent text, counts and card heights differ because these views use the original Loomik records. Stakeholder cards show recorded Priority and Sentiment values rather than inventing the reference demo's Power/Interest scores. Detail/editor dialogs use compact, flat styling. Calendar and assets open inside the workspace; legacy URLs redirect into this same interface. New chart/call surfaces extend the prototype.

Chat is a local deterministic prototype responder, not a connected language-model service. Calls are scripted rehearsals, not audio/video calls. No live CRM/news integration is connected. Original source data dates are preserved. The original Loomik/Lovable project is unchanged. The experimental portfolio demo is published separately through Sites.

`design-reference/lovable-reference-account.jpg` and `lovable-reference-deal.jpg` capture the actual reference. `previous-github-mirror/` archives the earlier incorrect reference; it is not served or included in production output.

## Validation

```sh
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Browser validation and comparison notes: `design-reference/verification.md`.

## Floating portfolio demo

Open `/?demo=floating` to present the interactive prototype over a staged desktop. Drag the slim Loomik bar, resize using the bottom-right corner, and adjust Glass opacity. Both handles support arrow keys. Daylight/Dusk switches the backdrop; Reset restores the layout. The X opens the unchanged regular prototype. Demo mode survives deal navigation and refresh. This is a browser simulation, not an operating-system overlay.

## Published portfolio demo

https://loomik-floating.sandy-tayts.chatgpt.site/?demo=floating

Public version 1, published November 14, 2026. Account view, deal navigation and direct deal refresh verified on the live site. Publishing identity is recorded in `design-reference/hosting.json`.
