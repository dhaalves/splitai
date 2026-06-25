import type { SplitAIDb } from './db';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

/**
 * Permanently delete expenses and groups that were soft-deleted more than
 * 30 days ago. Returns the number of records purged.
 */
export async function runPurgeSweep(db: SplitAIDb, now = Date.now()): Promise<number> {
  const cutoff = now - THIRTY_DAYS;
  const oldExpenses = (await db.expenses.where('deletedAt').below(cutoff + 1).toArray())
    .filter((e) => e.deletedAt !== null);
  const oldGroups = (await db.groups.where('deletedAt').below(cutoff + 1).toArray())
    .filter((g) => g.deletedAt !== null);
  let purged = 0;
  if (oldExpenses.length > 0) {
    await db.expenses.bulkDelete(oldExpenses.map((e) => e.id));
    purged += oldExpenses.length;
  }
  if (oldGroups.length > 0) {
    await db.groups.bulkDelete(oldGroups.map((g) => g.id));
    purged += oldGroups.length;
  }
  return purged;
}
