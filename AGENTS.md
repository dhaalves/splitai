# AGENTS.md

Notes for OpenCode sessions working in this repo. Read once, act fast.

## Stack

Client-only React 18 + TypeScript + Vite SPA. No backend, no network calls, no auth server.
Persistence: **IndexedDB via Dexie.js** (`src/db/`). UI-only state: **Zustand** (`src/stores/`).
Routing: **React Router v6 with `HashRouter`** (chosen for GitHub Pages deep-link support — do not switch to `BrowserRouter`).
Styling: TailwindCSS, dark theme, mobile-first. Custom tokens `accent`, `owed`, `owe` in `tailwind.config.js`.

## Commands

```bash
npm run dev          # vite dev server
npm run build        # tsc -b && vite build  (typecheck FAILS the build — see below)
npm run preview      # serve built dist/ locally
npm test             # vitest run (once, jsdom + fake-indexeddb)
npm run test:watch   # vitest watch
npm run lint         # eslint src --ext .ts,.tsx
npm run deploy       # build + push dist/ to gh-pages branch (requires VITE_BASE_PATH)
```

Run a single test:

```bash
npx vitest run src/domain/__tests__/splits.test.ts
npx vitest run -t "parses a user-typed"      # by test name
```

## Build pipeline gotchas

- `npm run build` runs `tsc -b` first. project references: `tsconfig.json` (app) → `tsconfig.node.json` (`vite.config.ts`). Errors here block `vite build`.
- `tsconfig.json` has `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Unused vars fail the build, not just lint. No `as any` / `@ts-ignore` (also a hard rule from project instructions).
- `vite.config.js` and `vite.config.d.ts` are gitignored stale artifacts — **edit `vite.config.ts`** only.
- `*.tsbuildinfo` are gitignored build cache — safe to delete if a build acts stale.

## Money is in CENTS

All money values (`Expense.amount`, `SplitEntry.share` for `exact`, balances, settlements) are **integer minor units (cents)**. Never store floats.
Convert at the UI boundary with `src/lib/currency.ts`: `parseAmountToCents`, `centsToMajor`, `majorToCents`, `formatMoney`.
Split math in `src/domain/splits.ts` floors and distributes remainder cents — keep that pattern when adding split methods.

## DB initialization is a singleton

`src/db/init.ts` → `initApp()` runs once before React renders (`main.tsx`), in order:

1. `runMigrations(db, { 1: async () => {} })`
2. `seedCategories(db)` (idempotent; re-seeds defaults even if already seeded)
3. `runRecurringSweep(db)` — auto-generates recurring expenses whose `nextDate` has passed
4. `runPurgeSweep(db)` — hard-deletes expenses/groups soft-deleted >30 days ago

To add startup DB work, extend `initApp`. Do NOT do it from components.

## Schema changes need TWO edits

Adding a Dexie version is not enough — schema version is tracked in BOTH Dexie's `.version(n)` and a `schemaVersion` row in `db.meta`:

1. Bump `.version(n).stores(...)` in `src/db/db.ts` and bump `CURRENT_SCHEMA_VERSION` (const at top of file).
2. Add a migration entry `n: async (db) => { ... }` to the map passed to `runMigrations` in `src/db/init.ts`.

Migrations are **forward-only**. `migrations.ts` runs each step `v = current+1 .. target` and writes `schemaVersion` after each. Never mutate past migration functions.

## Testing pattern (Dexie)

Tests run in jsdom with `fake-indexeddb/auto` (set in `src/test/setup.ts`, referenced by `vitest.config.ts`). Vitest globals are on (`describe`, `it`, `expect` available without import).

Any test touching the DB must reset both singletons in `beforeEach`:

```ts
import { resetDb } from '../db/db';
import { resetInit } from '../db/init';

beforeEach(async () => {
  resetDb();      // close + create fresh in-memory db with unique name
  resetInit();    // clear the initApp singleton so it re-runs
  // ...then seed what the test needs (profile, categories, friends)
});
```

Forgetting `resetInit` causes `initApp()` to resolve the cached (possibly empty) promise — silent stale-state bugs. forgetting `resetDb` leaks data between tests.

## Architecture

```
src/db/        Dexie db class, schema types (schema.ts is the source of truth for entity shapes),
               migrations, seed, recurring sweep, purge sweep
src/domain/    Pure logic: balances, splits, simplify, recurring. NO IO — unit-testable in isolation.
src/features/  Feature modules (auth, backup, categories, dashboard, expenses, friends,
               groups, recurring, search, settle). Each owns its hooks/components + __tests__.
src/pages/     Route-level views, wired in src/App.tsx (all routes listed there)
src/components/ Shared UI primitives (Money, AmountInput, Modal, ...). Mobile-first.
src/stores/    Zustand for UI state ONLY (toasts, ui). Persistent state lives in Dexie.
src/lib/       Utilities: currency, dates, csv, id (uid)
src/test/      setup.ts (jest-dom + fake-indexeddb + suppresses 'not wrapped in act')
```

Tests live next to the code under `__tests__/` dirs. A test touching a feature page usually wraps the component in `<HashRouter>`.

## IDs

`src/lib/id.ts` → `uid()`: 16 random bytes → base64url (22 chars), via `crypto.getRandomValues`. Use `uid()` for every new entity id. Do not invent other schemes.

## Routing

All routes are declared in `src/App.tsx`. `ProfileGate` redirects unauthored users to `/setup` until a Profile row exists. A new top-level page must be added there.

## Default branch

`master` (CI deploys from pushes to `master`). New work merges target `master`, not `main`.

## Deployment (GitHub Pages)

Two paths exist — **CI is the canonical one**.

**CI auto-deploy** (`.github/workflows/deploy.yml`): on push to `master` → `npm ci` → `npm run build` with `VITE_BASE_PATH: /splitai/` → `actions/deploy-pages@v4`. GitHub Settings → Pages → Source must be **"GitHub Actions"** (not a branch). The `/splitai/` base path is hard-coded in the workflow YAML — renaming the repo means editing `deploy.yml` too.

**Manual alternative** (`npm run deploy`): builds and pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. Use only if you must deploy from a branch instead of the Actions provider. The two methods target different Pages sources — don't mix them without flipping Settings → Pages.

`VITE_BASE_PATH` (env var, read in `vite.config.ts` → `base`) must be `/<repo-name>/` for a repo page, or `/` (or unset) for a user-root page (`<user>.github.io`).

HashRouter means no server-side rewrite needed — deep links like `/#/expenses/<id>` work directly.

PowerShell example (env var scoped to the command):
```powershell
$env:VITE_BASE_PATH="/splitai/"; npm run deploy
```

## Hard rules

- No backend / no `fetch` / no network. All data in IndexedDB. Backup = JSON export only.
- No `as any`, `@ts-ignore`, `@ts-expect-error`.
- Don't edit `vite.config.js` — edit `vite.config.ts`.
- `.omo/` and `.superpowers/` are gitignored agent work dirs, not source.