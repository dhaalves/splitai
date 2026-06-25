# SplitAI — Design Spec

**Date:** 2026-06-25
**Status:** Approved (pending user review)
**Reference:** https://dev.splitwise.com/ (data model inspiration only; no API integration)

## 1. Purpose

SplitAI is a fully client-side expense-splitting app modeled on Splitwise's core workflows. It runs entirely in the browser with no server-side code, persists data locally via IndexedDB, and deploys as a static site to GitHub Pages.

**Primary user:** A single user ("you") who tracks shared expenses with friends and groups, sees who owes whom, and settles up. Friends are local contact entries — they do not see shared data (no server, no sync).

## 2. Requirements Summary

### In scope (v1)
- Local profile ("you") with first-run setup
- Friends + non-group (1:1) expenses with running balances
- Groups (home, trip, couple, other) with members and group expenses
- All split methods: equal, exact, percent, shares
- Settlements / settle-up flow
- Categories (seeded, editable, with icon + color)
- Recurring expenses (weekly, monthly, yearly) with auto-generation
- Simplify debts (greedy netting within a group)
- Export/import JSON (backup/restore), CSV export
- Search + filter expenses; dashboard with monthly spending chart

### Out of scope (v1, explicit non-goals)
- Multi-currency / FX conversion (single default currency only)
- Comments on expenses
- Receipts / image attachments
- Real-time collaboration, server sync, or sharing
- Auth / login / multi-account
- Notifications
- E2E test automation (manual smoke testing only for v1)

## 3. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Build | Vite | Fast dev server, optimized static build |
| UI | React 18 + TypeScript | Component model, type safety |
| Routing | React Router v6 (hash router) | GH Pages-compatible deep links without server rewrites |
| UI state | Zustand | Minimal boilerplate for view/modal/filter state |
| Persistence | Dexie.js (IndexedDB) | Reactive `useLiveQuery`, structured storage, ~50MB+ quota |
| Styling | TailwindCSS v3 | Custom dark theme, mobile-first utilities |
| Charts | Recharts | Lightweight React-friendly charting |
| Testing | Vitest + React Testing Library + fake-indexeddb | Vite-native runner; in-memory Dexie for component tests |
| Deploy | `gh-pages` npm script | Static `dist/` to `gh-pages` branch |

## 4. Architecture

### 4.1 Project Structure

```
src/
  db/              # Dexie schema, seed data, migrations, dbResult helper
  stores/          # Zustand UI stores (view, modals, filters, toasts)
  domain/          # Pure logic: splits, balances, simplify debts, recurring dates
  components/      # Reusable UI (Button, Modal, Avatar, Input, etc.)
  features/        # Feature modules (see 4.2)
  pages/           # Route-level screens
  lib/             # utils: id, dates, currency format, csv/json, strings map
  App.tsx          # Router + layout shell
  main.tsx
```

### 4.2 Feature Modules

Each module is self-contained: its components, hooks, and types live together.

| Module | Responsibility |
|---|---|
| `auth` | First-run profile creation, profile edit |
| `groups` | List, create, detail, add/remove members |
| `friends` | List, create, balances, friend detail |
| `expenses` | Add/edit/delete, split methods, category picker |
| `settle` | Settle-up flow, settlements log |
| `recurring` | Recurring templates + auto-generation |
| `dashboard` | Totals, charts, recent activity |
| `search` | Text + filter chips |
| `backup` | Export/import JSON, CSV export |

### 4.3 State Strategy

- **Persistent domain state** (profiles, contacts, groups, expenses, recurring, categories) lives in IndexedDB via Dexie. Components read with `useLiveQuery` — auto-re-renders on table changes, scoped to the queried data.
- **Ephemeral UI state** (current view, active modal, filter selections, toasts, unsaved-changes tracking) lives in Zustand stores. Not persisted.
- **Derived data** (balances, simplified debts, monthly totals) computed by pure functions in `domain/`, memoized per-query. Never stored.

## 5. Data Model

All monetary amounts stored as **integer minor units (cents)** to avoid floating-point errors. Display via `Intl.NumberFormat`.

### 5.1 Tables

#### `profiles` (singleton — "you")
```ts
{
  id: string
  firstName: string
  lastName: string
  email: string
  defaultCurrency: string   // ISO 4217, e.g. "USD"
  avatarColor: string       // generated color for avatar fallback
  createdAt: number
}
```

#### `contacts` (friends + group members)
```ts
{
  id: string
  firstName: string
  lastName: string
  email?: string
  avatarColor: string
  createdAt: number
}
```

#### `groups`
```ts
{
  id: string
  name: string
  type: "home" | "trip" | "couple" | "other"
  memberIds: string[]       // includes your profile id
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}
```

#### `expenses`
```ts
{
  id: string
  amount: number            // minor units (cents)
  currency: string          // matches profile default
  description: string
  category: string          // category id
  date: number              // expense date (ms)
  createdAt: number
  updatedAt: number
  groupId: string | null    // null = non-group (friend) expense
  paidBy: string            // contact or profile id
  splitMethod: "equal" | "exact" | "percent" | "shares"
  splits: { userId: string; share: number }[]
  isSettlement: boolean     // true for settle-up payments
  recurringId: string | null // link to recurring template if auto-generated
  deletedAt: number | null  // soft delete (restorable)
}
```

**Split semantics** (the `share` field's meaning depends on `splitMethod`):
- `equal` — `share` ignored; amount split evenly across all `splits` entries. Remainder cents distributed to first entries.
- `exact` — `share` = cents each person owes; sum of `share` must equal `amount`.
- `percent` — `share` = 0–100; sum must equal 100; owed = `amount * share / 100`, rounded to cent with remainder distributed.
- `shares` — `share` = relative weight (e.g. `1,1,2`); owed = `amount * share / totalShares`, rounded with remainder distributed.

#### `recurring` (templates)
```ts
{
  id: string
  description: string
  amount: number
  category: string
  groupId: string | null
  paidBy: string
  splitMethod: "equal" | "exact" | "percent" | "shares"
  splits: { userId: string; share: number }[]
  frequency: "weekly" | "monthly" | "yearly"
  startDate: number
  nextDate: number          // next due date
  lastGenerated: number | null
  active: boolean
  createdAt: number
}
```

**Auto-generation:** On app startup, `db/` runs a sweep over active recurring templates where `nextDate <= now`. For each, it creates an expense (with `recurringId` linking back, `date = nextDate`), advances `nextDate` by one `frequency` interval (skipping invalid dates like Feb 30 by rolling back to month end), and sets `lastGenerated = now`. Multiple overdue instances are generated in sequence (e.g., a monthly bill 3 months overdue creates 3 expenses). A user can also trigger generation manually from the recurring detail screen.

#### `categories` (seeded, editable)
```ts
{
  id: string
  name: string
  icon: string              // emoji or icon key
  color: string             // hex
  system: boolean           // true = cannot delete
}
```

### 5.2 Balance Computation

Pure function in `domain/balances.ts`:

1. For a scope (all expenses, a group, or a friend pair), filter to non-deleted expenses. **Settlements are included** — a settlement is an expense where one person paid another to settle up, so it correctly reduces the owed balance. The `isSettlement` flag is for UI display/filtering only, not for balance exclusion.
2. For each expense, compute each participant's net contribution: `paid − owed`.
   - `paid` = full amount credited to `paidBy`.
   - `owed` = each split's computed owed amount per split method.
3. Accumulate net per user across all scoped expenses.
4. Produce directed balances: for each pair `(A, B)` where A's net is negative and B's is positive, `A owes B = min(|A.net|, B.net)`. Netting produces a minimal set of directed debts.

**Group balances** — same computation scoped to `groupId`.
**Friend balances** — scoped to expenses where both `paidBy` and all `splits[].userId` are within `{you, friend}` and `groupId` is null (plus any group expenses between them, aggregated).

### 5.3 Simplify Debts

Pure function in `domain/simplify.ts`:

1. Compute each group member's net balance within the group (sum of `paid − owed` across all non-deleted group expenses, including settlements).
2. Split members into debtors (net < 0) and creditors (net > 0).
3. Greedily match the largest debtor to the largest creditor: transfer `min(|debtor.net|, creditor.net)`, reduce both, repeat until all nets are zero (within rounding tolerance).
4. Return a list of `{from, to, amount}` transfers — the minimal repayment plan.

Computed on demand (not stored). The Group detail screen has a "Simplify" toggle to switch between raw per-expense balances and the simplified view.

### 5.4 Soft Deletes

- `expenses.deletedAt` and `groups.deletedAt` mark soft deletion. Deleted items excluded from balance computation and lists but restorable within 30 days.
- A startup sweep in `db/` purges entries where `deletedAt` is older than 30 days.
- `contacts` are hard-deleted only if they have no non-deleted expenses and aren't in any non-deleted group; otherwise the action is blocked with an explanatory toast.

### 5.5 Migrations

- `db/migrations.ts` reads a `schemaVersion` key from a meta table on app start.
- Forward-only migrations run if the stored version is older than the current code version. No down-migrations.
- Import sets `schemaVersion` to the current code version after re-mapping ids.

## 6. UI/UX Design

### 6.1 Theme

Dark, modern. Tailwind tokens:
- Background: slate-900
- Cards / elevated surfaces: slate-800
- Borders: slate-700
- Primary accent: indigo-500
- "You are owed": emerald-400
- "You owe": rose-400
- Text: slate-100 (primary), slate-400 (secondary)

Rounded-xl corners, subtle borders (`border-slate-700`), soft shadows. Mobile-first.

### 6.2 Layout Shell

- **Mobile (<768px):** Bottom tab bar — **Home, Groups, Friends, More**. Single scrollable column. Sticky top header with screen title + contextual action.
- **Desktop (≥768px):** Fixed left sidebar (~240px) with logo, primary nav, profile at bottom. Main content in centered max-width container (~`max-w-3xl`). Bottom bar hidden.
- **FAB / "+":** Floating action button on Home and Group detail navigates to the Add Expense route. Always one tap away.

### 6.3 Routes (hash router)

```
/                       Dashboard (Home)
/setup                  First-run profile creation
/groups                 Groups list
/groups/:id             Group detail
/friends                Friends list
/friends/:id            Friend detail
/expenses/new           Add expense
/expenses/:id           Expense detail
/expenses/:id/edit      Edit expense
/settle                 Settle up
/recurring              Recurring list
/recurring/new          Create recurring
/recurring/:id/edit     Edit recurring
/search                 Search & filter
/dashboard              Charts & monthly breakdown
/more                   Profile, categories, backup, settings
/settings/categories    Category manager
/settings/backup        Export/import
```

### 6.4 Key Screens

1. **Dashboard (Home)** — Total "you owe" / "you are owed" summary cards. Monthly spending line chart (Recharts). Recent expenses (last 10) with quick-add. Empty state with CTA when no expenses.

2. **Groups list** — Cards: name, type icon, member count, your net balance (colored). FAB to create. Tap → group detail.

3. **Group detail** — Header with name + balance summary. Tabs: **Expenses** (chronological, settlements flagged), **Balances** (per-member + simplified view with toggle), **Members** (add/remove). FAB → add expense scoped to this group.

4. **Add Expense** — Full-screen route on mobile (`/expenses/new`), centered modal on desktop. Amount (big input), description, category picker (horizontal chips), date, paid-by selector, split-method toggle (Equal/Exact/Percent/Shares), per-member split rows with auto-calculated amounts. "Settlement" checkbox → settle-up mode (amount, from→to, date). Save returns to previous screen.

5. **Friends list** — Avatar + name + net balance (colored). Tap → friend detail (shared expenses, balance history, settle up).

6. **Search** — Text input + filter chips (category, group, date range). Results list.

7. **More** — Profile settings, category manager, recurring expenses, backup (export JSON / import JSON / export CSV), about.

### 6.5 Onboarding

First launch → `/setup`. Fields: first name, last name, email, default currency (dropdown of common ISO 4217 codes). Avatar color auto-assigned from a palette. After setup, redirect to `/` with an empty-state Home prompting the first expense or group creation.

### 6.6 Toasts

Lightweight Zustand toast store. Auto-dismiss after 3s. Variants: success, error, info. Used for: expense added/edited/deleted/restored, group created/deleted, export complete, import errors, quota warnings.

## 7. Error Handling

- **Data layer:** All Dexie operations wrapped in a `dbResult` helper returning `{ok, data} | {error}`. Mutations surface inline validation errors; unexpected DB errors become a toast with retry. IndexedDB quota errors prompt export + cleanup.
- **Form validation:** Inline, on blur and submit. Submit disabled until valid:
  - Amount > 0
  - `percent`: splits sum to 100
  - `exact`: splits sum to `amount`
  - `shares`: all ≥ 0, at least one non-zero
  - Required fields non-empty (description, paid-by, at least one split)
- **Import validation:** JSON schema-validated against a versioned shape `{ schemaVersion, profiles, contacts, groups, expenses, recurring, categories }`. Unknown fields ignored; missing required fields reject with an explanatory toast. Imported ids re-mapped to fresh ids; internal references (`groupId`, `paidBy`, `splits[].userId`, `recurringId`) rewritten.
- **Routing:** Unknown routes → NotFound screen with link home.
- **Unsaved-changes guard:** Add/Edit Expense and Recurring forms track dirty state; router navigation prompts a confirm dialog.

## 8. Testing

- **Runner:** Vitest (Vite-native).
- **Domain logic (full unit coverage):**
  - Split calculations for all four methods (equal, exact, percent, shares), including cent-remainder distribution.
  - Balance computation (per-pair, group-scoped, friend-scoped).
  - Simplify-debts greedy algorithm (verified against known cases).
  - Currency formatting via `Intl.NumberFormat`.
  - Recurring date generation (weekly/monthly/yearly, edge dates).
  - Import id remapping.
- **Component tests (smoke, React Testing Library):**
  - Add Expense (validation + successful save)
  - Group detail balances view + simplify toggle
  - Settle Up flow
  - Setup wizard
  - Uses `fake-indexeddb` for an in-memory Dexie per test.
- **E2E:** Out of scope for v1; manual smoke testing against the deployed page. Noted as a follow-up.
- **Coverage target:** Domain logic 100% (small surface), components smoke-level.

## 9. Non-Functional Requirements

- **Performance:** `useLiveQuery` scopes re-renders to changed tables. List virtualization (`react-window`) kicks in for groups/friends lists >100 entries and expense lists >200. Balance/simplify computations memoized per-query.
- **Offline:** Entire app works offline by definition (IndexedDB + static bundle). PWA manifest + service worker via `vite-plugin-pwa` is a **stretch goal** for installability and shell caching.
- **Accessibility:** Semantic HTML, keyboard-navigable modals (focus trap, Escape to close), ARIA labels on icon buttons, color contrast ≥4.5:1 in the dark theme. Charts include aria summaries.
- **i18n:** English only for v1. Strings centralized in `lib/strings.ts` for future drop-in i18n.
- **Data integrity:** All mutations set `updatedAt`. Forward-only migrations on startup. Soft-deletes auto-purged after 30 days by a startup sweep.
- **Deploy:** `npm run build` → `dist/`. `gh-pages` script pushes `dist/` to `gh-pages` branch. `vite.config.ts` reads `base` from `VITE_BASE_PATH` env or `package.json` field (handles project pages like `user.github.io/splitai`). Hash router ensures deep links work without server config.

## 10. Open Questions

None at spec time. All clarifications resolved during brainstorming.
