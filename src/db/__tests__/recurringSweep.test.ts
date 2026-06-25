import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '../db';
import { seedCategories } from '../seed';
import { runRecurringSweep } from '../recurringSweep';
import type { Recurring } from '../schema';
import { uid } from '../../lib/id';

async function makeRecurring(over: Partial<Recurring>): Promise<Recurring> {
  const db = getDb();
  const r: Recurring = {
    id: 'r-' + uid(),
    description: 'rent',
    amount: 100000,
    category: 'rent',
    groupId: null,
    paidBy: 'u-you',
    splitMethod: 'equal',
    splits: [{ userId: 'u-you', share: 0 }, { userId: 'u-ada', share: 0 }],
    frequency: 'monthly',
    startDate: new Date(2026, 0, 1).getTime(),
    nextDate: new Date(2026, 0, 1).getTime(),
    lastGenerated: null,
    active: true,
    createdAt: Date.now(),
    ...over,
  };
  await db.recurring.add(r);
  return r;
}

describe('runRecurringSweep', () => {
  beforeEach(() => resetDb());

  it('does nothing when no recurring expenses are overdue', async () => {
    await seedCategories(getDb());
    const now = Date.now();
    await makeRecurring({ nextDate: now + 100000 });
    const created = await runRecurringSweep(getDb(), now);
    expect(created).toEqual([]);
    const all = await getDb().expenses.toArray();
    expect(all).toHaveLength(0);
  });

  it('generates one expense when one instance is overdue', async () => {
    await seedCategories(getDb());
    const due = new Date(2026, 2, 1).getTime();
    const now = new Date(2026, 2, 5).getTime();
    const r = await makeRecurring({ nextDate: due });
    const created = await runRecurringSweep(getDb(), now);
    expect(created).toHaveLength(1);
    const e = created[0];
    expect(e.description).toBe('rent');
    expect(e.amount).toBe(100000);
    expect(e.recurringId).toBe(r.id);
    expect(e.date).toBe(due);

    const updated = await getDb().recurring.get(r.id);
    expect(updated?.nextDate).toBe(new Date(2026, 3, 1).getTime());
    expect(updated?.lastGenerated).toBe(now);
  });

  it('generates multiple expenses when several intervals are overdue', async () => {
    await seedCategories(getDb());
    const due = new Date(2026, 0, 1).getTime();
    const now = new Date(2026, 2, 15).getTime();
    const r = await makeRecurring({ nextDate: due });
    const created = await runRecurringSweep(getDb(), now);
    expect(created).toHaveLength(3);
    expect(created[0].date).toBe(new Date(2026, 0, 1).getTime());
    expect(created[1].date).toBe(new Date(2026, 1, 1).getTime());
    expect(created[2].date).toBe(new Date(2026, 2, 1).getTime());
    const updated = await getDb().recurring.get(r.id);
    expect(updated?.nextDate).toBe(new Date(2026, 3, 1).getTime());
  });

  it('skips inactive recurring templates', async () => {
    await seedCategories(getDb());
    const due = new Date(2026, 0, 1).getTime();
    const now = new Date(2026, 0, 5).getTime();
    await makeRecurring({ nextDate: due, active: false });
    const created = await runRecurringSweep(getDb(), now);
    expect(created).toEqual([]);
  });

  it('caps generation at 12 instances to avoid runaway loops', async () => {
    await seedCategories(getDb());
    const due = new Date(2018, 0, 1).getTime();
    const now = new Date(2026, 5, 25).getTime();
    await makeRecurring({ nextDate: due });
    const created = await runRecurringSweep(getDb(), now);
    expect(created.length).toBeLessThanOrEqual(12);
  });
});
