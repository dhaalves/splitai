import type {
  Profile, Contact, Group, Expense, Recurring, Category,
} from '../../db/schema';
import { uid } from '../../lib/id';
import type { DbResult } from '../../db/dbResult';

export interface BackupFile {
  schemaVersion: number;
  profile: Profile;
  contacts: Contact[];
  groups: Group[];
  expenses: Expense[];
  recurring: Recurring[];
  categories: Category[];
}

export interface RemappedBackup {
  profile: Profile;
  contacts: Contact[];
  groups: Group[];
  expenses: Expense[];
  recurring: Recurring[];
  categories: Category[];
}

export function validateAndRemap(file: BackupFile): DbResult<RemappedBackup> {
  if (!file || typeof file !== 'object') return { ok: false, error: 'Backup file is empty' };
  if (!file.profile || !file.profile.id) return { ok: false, error: 'Missing profile' };
  if (!Array.isArray(file.contacts)) return { ok: false, error: 'Missing contacts array' };
  if (!Array.isArray(file.groups)) return { ok: false, error: 'Missing groups array' };
  if (!Array.isArray(file.expenses)) return { ok: false, error: 'Missing expenses array' };

  const idMap = new Map<string, string>();
  idMap.set(file.profile.id, uid());
  for (const c of file.contacts) {
    if (!c.id) return { ok: false, error: 'Contact missing id' };
    idMap.set(c.id, uid());
  }
  for (const g of file.groups) {
    if (!g.id) return { ok: false, error: 'Group missing id' };
    idMap.set(g.id, uid());
  }
  for (const e of file.expenses) {
    if (!e.id) return { ok: false, error: 'Expense missing id' };
    idMap.set(e.id, uid());
  }
  for (const r of file.recurring ?? []) {
    if (!r.id) return { ok: false, error: 'Recurring missing id' };
    idMap.set(r.id, uid());
  }
  for (const c of file.categories ?? []) {
    if (!c.id) return { ok: false, error: 'Category missing id' };
    idMap.set(c.id, uid());
  }

  const remap = (id: string): string => {
    const m = idMap.get(id);
    if (!m) throw new Error(`Unknown id reference: ${id}`);
    return m;
  };

  const originalGroupIds = new Set(file.groups.map((g) => g.id));
  const originalUserIds = new Set<string>([file.profile.id, ...file.contacts.map((c) => c.id)]);
  const originalRecurringIds = new Set((file.recurring ?? []).map((r) => r.id));

  try {
    const profile: Profile = { ...file.profile, id: remap(file.profile.id) };
    const contacts = file.contacts.map((c) => ({ ...c, id: remap(c.id) }));
    const groups = file.groups.map((g) => ({
      ...g,
      id: remap(g.id),
      memberIds: g.memberIds.map(remap),
    }));

    const expenses = file.expenses.map((e) => {
      if (e.groupId !== null && !originalGroupIds.has(e.groupId)) {
        throw new Error(`Expense references unknown group: ${e.groupId}`);
      }
      if (!originalUserIds.has(e.paidBy)) {
        throw new Error(`Expense paidBy unknown user: ${e.paidBy}`);
      }
      for (const s of e.splits) {
        if (!originalUserIds.has(s.userId)) {
          throw new Error(`Expense split references unknown user: ${s.userId}`);
        }
      }
      if (e.recurringId !== null && !originalRecurringIds.has(e.recurringId)) {
        throw new Error(`Expense references unknown recurring: ${e.recurringId}`);
      }
      return {
        ...e,
        id: remap(e.id),
        groupId: e.groupId ? remap(e.groupId) : null,
        paidBy: remap(e.paidBy),
        splits: e.splits.map((s) => ({ userId: remap(s.userId), share: s.share })),
        recurringId: e.recurringId ? remap(e.recurringId) : null,
      };
    });

    const recurring = (file.recurring ?? []).map((r) => {
      if (r.groupId !== null && !originalGroupIds.has(r.groupId)) {
        throw new Error(`Recurring references unknown group: ${r.groupId}`);
      }
      if (!originalUserIds.has(r.paidBy)) {
        throw new Error(`Recurring paidBy unknown user: ${r.paidBy}`);
      }
      for (const s of r.splits) {
        if (!originalUserIds.has(s.userId)) {
          throw new Error(`Recurring split references unknown user: ${s.userId}`);
        }
      }
      return {
        ...r,
        id: remap(r.id),
        groupId: r.groupId ? remap(r.groupId) : null,
        paidBy: remap(r.paidBy),
        splits: r.splits.map((s) => ({ userId: remap(s.userId), share: s.share })),
      };
    });

    const categories = (file.categories ?? []).map((c) => ({ ...c, id: remap(c.id) }));

    return {
      ok: true,
      data: { profile, contacts, groups, expenses, recurring, categories },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
