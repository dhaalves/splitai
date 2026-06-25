import type { Expense } from './schema';
import type { SplitAIDb } from './db';
import { uid } from '../lib/id';
import { nextDueDate } from '../domain/recurring';

const MAX_GENERATE = 12;

/**
 * On startup, generate expense rows for any active recurring templates
 * whose nextDate has passed. Advances nextDate by frequency each time.
 * Multiple overdue instances generate multiple expenses (capped at 12).
 */
export async function runRecurringSweep(db: SplitAIDb, now = Date.now()): Promise<Expense[]> {
  const all = await db.recurring.toArray();
  const active = all.filter((r) => r.active);
  const created: Expense[] = [];

  for (const r of active) {
    let count = 0;
    let nextDate = r.nextDate;
    while (nextDate <= now && count < MAX_GENERATE) {
      const expense: Expense = {
        id: uid(),
        amount: r.amount,
        currency: 'USD',
        description: r.description,
        category: r.category,
        date: nextDate,
        createdAt: now,
        updatedAt: now,
        groupId: r.groupId,
        paidBy: r.paidBy,
        splitMethod: r.splitMethod,
        splits: r.splits,
        isSettlement: false,
        recurringId: r.id,
        deletedAt: null,
      };
      await db.expenses.add(expense);
      created.push(expense);
      nextDate = nextDueDate(nextDate, r.frequency);
      count += 1;
    }
    if (count > 0) {
      await db.recurring.update(r.id, { nextDate, lastGenerated: now });
    }
  }
  return created;
}
