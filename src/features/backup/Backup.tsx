import { useRef } from 'react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useToasts } from '../../stores/toasts';
import { getDb, CURRENT_SCHEMA_VERSION } from '../../db/db';
import { validateAndRemap, type BackupFile } from './importValidate';
import { toCsv } from '../../lib/csv';

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
        <Button onClick={exportJson}>Export JSON (full backup)</Button>
        <Button variant="secondary" onClick={exportCsv}>Export CSV (expenses only)</Button>
        <div>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>Import JSON</Button>
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
        <p className="text-xs text-slate-500">
          Importing adds data alongside existing records (ids are remapped to avoid collisions).
          To fully replace, clear data from your browser first.
        </p>
      </div>
    </div>
  );
}
