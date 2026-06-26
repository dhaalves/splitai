# SplitAI

A fully client-side Splitwise-like expense splitter. Persists to IndexedDB; deploys as a static site to GitHub Pages. No server, no backend, no tracking — your data stays in your browser.

## Features

- **Profile setup** — single-user "you" with first-run onboarding
- **Friends** — track 1:1 expenses with running balances
- **Groups** — home, trip, couple, other; group expenses split among members
- **All split methods** — equal, exact amounts, percentages, shares
- **Settle up** — record settlement payments; suggestions from balances
- **Simplify debts** — greedy netting algorithm minimizes group repayments
- **Categories** — seeded defaults + custom; icon + color per category
- **Recurring expenses** — weekly/monthly/yearly templates with auto-generation on startup
- **Dashboard** — "you owe / you are owed" summary + 6-month spending chart
- **Search** — text + category + group filters
- **Backup** — export/import JSON (full backup with id remapping), export CSV (expenses)
- **Soft deletes** — expenses/groups restorable for 30 days, then auto-purged
- **Migrations** — forward-only schema versioning

## Develop

```bash
npm install
npm run dev
```

## Test

```bash
npm test          # run once
npm run test:watch # watch mode
```

## Build

```bash
npm run build     # tsc + vite build → dist/
npm run preview   # preview the production build locally
```

## Deploy to GitHub Pages

1. Create a repo named `splitai` (or similar).
2. Push this code.
3. Set `VITE_BASE_PATH` to your repo path (e.g. `/splitai/`) in the deploy script or as an env var.
4. Run `npm run deploy` — this builds with the correct base path and pushes `dist/` to the `gh-pages` branch.
5. In GitHub repo settings → Pages, set the source to the `gh-pages` branch.
6. Your app is live at `https://<username>.github.io/splitai/`.

If your repo name differs, update `VITE_BASE_PATH` in the deploy command to `/<repo-name>/`.

For a user/org root page (`user.github.io`), leave `VITE_BASE_PATH=/` (or unset).

## Data

All data lives in your browser's IndexedDB under the `splitai-db` database. Use **More → Backup & Data → Export JSON** regularly to create a backup. Clearing site data wipes everything — there is no server-side copy.

## Tech Stack

- React 18 + TypeScript
- Vite (build + dev)
- React Router v6 (HashRouter for GH Pages deep links)
- Zustand (UI state)
- Dexie.js (IndexedDB persistence with reactive `useLiveQuery`)
- TailwindCSS (dark theme, mobile-first)
- Recharts (dashboard chart)
- Vitest + React Testing Library + fake-indexeddb (testing)
