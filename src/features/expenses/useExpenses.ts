import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { Expense, SplitEntry, SplitMethod } from '../../db/schema';
import { uid } from '../../lib/id';

export function useExpenses() {
  return useLiveQuery(() => getDb().expenses.orderBy('date').reverse().toArray(), []);
}

export function useExpense(id: string | undefined) {
  return useLiveQuery(async () => (id ? getDb().expenses.get(id) : undefined), [id]);
}

export interface ExpenseInput {
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: number;
  groupId: string | null;
  paidBy: string;
  splitMethod: SplitMethod;
  splits: SplitEntry[];
  isSettlement: boolean;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const e: Expense = {
    id: uid(),
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    recurringId: null,
    deletedAt: null,
  };
  await getDb().expenses.add(e);
  return e;
}

export async function updateExpense(id: string, patch: Partial<ExpenseInput>): Promise<void> {
  await getDb().expenses.update(id, { ...patch, updatedAt: Date.now() });
}

export async function softDeleteExpense(id: string): Promise<void> {
  await getDb().expenses.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
}

export async function restoreExpense(id: string): Promise<void> {
  await getDb().expenses.update(id, { deletedAt: null, updatedAt: Date.now() });
}
