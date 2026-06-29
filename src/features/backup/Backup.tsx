import { useRef } from 'react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useToasts } from '../../stores/toasts';
import { getDb, CURRENT_SCHEMA_VERSION } from '../../db/db';
import { validateAndRemap, type BackupFile } from './importValidate';
import { toCsv } from '../../lib/csv';

const actions = [
  {
    icon: '📦',
    title: 'Export JSON',
    desc: 'Full backup — all data including profile, contacts, groups, expenses.',
    color: 'rgba(16,185,129,0.12)',
    variant: 'primary' as const,
  },
  {
    icon: '📋',
    title: 'Export CSV',
    desc: 'Expenses only — for spreadsheet analysis.',
    color: 'rgba(6,182,212,0.12)',
    variant: 'secondary' as const,
  },
  {
    icon: '📥',
    title: 'Import JSON',
    desc: 'Restore from a previous backup file.',
    color: 'rgba(234,179,8,0.12)',
    variant: 'secondary' as const,
  },
];

export function Backup() {
  const fileRef = useRef<HTMLInputElement>(null);
  const push = useToasts((s) => s.push);

  async function exportJson() {
    const db = getDb();
    const [profiles, contacts, groups, expenses, recurring, categories] = await Promise.all([
      db.profiles.toArray(), db.contacts.toArray(), db.groups.toArray(),
      db.expenses.toArray(), db.recurring.toArray(), db.categories.toArray(),
    ]);
    const file: BackupFile = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profile: profiles[0],
      contacts, groups, expenses, recurring, categories,
    };
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push('Exported JSON', 'success');
  }

  async function exportCsv() {
    const db = getDb();
    const expenses = await db.expenses.toArray();
    const rows = expenses.map((e) => ({
      id: e.id, date: new Date(e.date).toISOString(), description: e.description,
      amount: e.amount, currency: e.currency, category: e.category,
      paidBy: e.paidBy, method: e.splitMethod, groupId: e.groupId ?? '',
      settlement: e.isSettlement ? 'yes' : 'no',
    }));
    const csv = toCsv(['id', 'date', 'description', 'amount', 'currency', 'category', 'paidBy', 'method', 'groupId', 'settlement'], rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitai-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push('Exported CSV', 'success');
  }

  async function importJson(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupFile;
      const r = validateAndRemap(parsed);
      if (!r.ok) { push(`Import failed: ${r.error}`, 'error'); return; }
      const db = getDb();
      const { profile, contacts, groups, expenses, recurring, categories } = r.data;
      await db.transaction('rw', [db.profiles, db.contacts, db.groups, db.expenses, db.recurring, db.categories], async () => {
        if (profile) await db.profiles.put(profile);
        if (contacts.length) await db.contacts.bulkAdd(contacts);
        if (groups.length) await db.groups.bulkAdd(groups);
        if (expenses.length) await db.expenses.bulkAdd(expenses);
        if (recurring.length) await db.recurring.bulkAdd(recurring);
        if (categories.length) await db.categories.bulkAdd(categories);
      });
      push('Import complete', 'success');
    } catch (e) {
      push(e instanceof Error ? e.message : String(e), 'error');
    }
  }

  return (
    <div>
      <Header title="Backup & Data" />
      <div className="p-4 space-y-3">
        {/* Export JSON */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-bg-card border border-border-color">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: actions[0].color }}>
            {actions[0].icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{actions[0].title}</div>
            <div className="text-xs text-text-secondary mt-0.5">{actions[0].desc}</div>
          </div>
          <Button size="sm" onClick={exportJson}>Export</Button>
        </div>

        {/* Export CSV */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-bg-card border border-border-color">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: actions[1].color }}>
            {actions[1].icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{actions[1].title}</div>
            <div className="text-xs text-text-secondary mt-0.5">{actions[1].desc}</div>
          </div>
          <Button size="sm" variant="secondary" onClick={exportCsv}>Export</Button>
        </div>

        {/* Import JSON */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-bg-card border border-border-color">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: actions[2].color }}>
            {actions[2].icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{actions[2].title}</div>
            <div className="text-xs text-text-secondary mt-0.5">{actions[2].desc}</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>Import</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }}
          />
        </div>

        <p className="text-xs text-text-muted mt-2 px-1">
          Importing adds data alongside existing records (ids are remapped to avoid collisions).
          To fully replace, clear data from your browser first.
        </p>
      </div>
    </div>
  );
}