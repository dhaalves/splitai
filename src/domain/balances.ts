import type { Expense } from '../db/schema';
import { computeOwed } from './splits';

/**
 * Net balance per user across the given expenses.
 * Positive = is owed money; negative = owes money.
 * Settlements and regular expenses are both included (a settlement is
 * just an expense where the payer paid another person to settle up).
 */
export function computeNetBalances(expenses: Expense[]): Record<string, number> {
  const net: Record<string, number> = {};
  for (const e of expenses) {
    if (e.deletedAt !== null) continue;
    const owed = computeOwed({ amount: e.amount, method: e.splitMethod, splits: e.splits });
    net[e.paidBy] = (net[e.paidBy] ?? 0) + e.amount;
    for (const [userId, cents] of Object.entries(owed)) {
      net[userId] = (net[userId] ?? 0) - cents;
    }
  }
  return net;
}

export interface DirectedDebt {
  from: string;
  to: string;
  amount: number;
}

/**
 * Compute the directed balance between two users, optionally scoped to a group.
 * Returns { from, to, amount } where amount is 0 if settled.
 */
export function pairBalance(
  expenses: Expense[],
  a: string,
  b: string,
  groupId: string | null = null
): DirectedDebt {
  const scoped = expenses.filter(
    (e) => e.deletedAt === null && (groupId === null || e.groupId === groupId)
  );
  const net = computeNetBalances(scoped);
  const na = net[a] ?? 0;
  const nb = net[b] ?? 0;
  if (na < 0 && nb > 0) {
    return { from: a, to: b, amount: Math.min(-na, nb) };
  }
  if (nb < 0 && na > 0) {
    return { from: b, to: a, amount: Math.min(-nb, na) };
  }
  return { from: a, to: b, amount: 0 };
}

/**
 * Net balance per member within a group.
 */
export function groupBalances(expenses: Expense[], groupId: string): Record<string, number> {
  const scoped = expenses.filter((e) => e.deletedAt === null && e.groupId === groupId);
  return computeNetBalances(scoped);
}
