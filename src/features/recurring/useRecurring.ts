import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { Recurring, Frequency, SplitEntry, SplitMethod } from '../../db/schema';
import { uid } from '../../lib/id';
import { nextDueDate } from '../../domain/recurring';

export function useRecurringAll() {
  return useLiveQuery(() => getDb().recurring.toArray(), []);
}

export function useRecurring(id: string | undefined) {
  return useLiveQuery(async () => (id ? getDb().recurring.get(id) : undefined), [id]);
}

export interface RecurringInput {
  description: string;
  amount: number;
  category: string;
  groupId: string | null;
  paidBy: string;
  splitMethod: SplitMethod;
  splits: SplitEntry[];
  frequency: Frequency;
  startDate: number;
}

export async function createRecurring(input: RecurringInput): Promise<Recurring> {
  const r: Recurring = {
    id: uid(),
    description: input.description,
    amount: input.amount,
    category: input.category,
    groupId: input.groupId,
    paidBy: input.paidBy,
    splitMethod: input.splitMethod,
    splits: input.splits,
    frequency: input.frequency,
    startDate: input.startDate,
    nextDate: input.startDate,
    lastGenerated: null,
    active: true,
    createdAt: Date.now(),
  };
  await getDb().recurring.add(r);
  return r;
}

export async function updateRecurring(id: string, patch: Partial<Recurring>): Promise<void> {
  await getDb().recurring.update(id, patch);
}

export async function deleteRecurring(id: string): Promise<void> {
  await getDb().recurring.delete(id);
}

export async function generateNow(id: string): Promise<void> {
  const r = await getDb().recurring.get(id);
  if (!r || !r.active) return;
  const { createExpense } = await import('../expenses/useExpenses');
  await createExpense({
    amount: r.amount,
    currency: 'USD',
    description: r.description,
    category: r.category,
    date: r.nextDate,
    groupId: r.groupId,
    paidBy: r.paidBy,
    splitMethod: r.splitMethod,
    splits: r.splits,
    isSettlement: false,
  });
  const next = nextDueDate(r.nextDate, r.frequency);
  await getDb().recurring.update(id, { nextDate: next, lastGenerated: Date.now() });
}
