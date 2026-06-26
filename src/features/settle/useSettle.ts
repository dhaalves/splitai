import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { pairBalance, groupBalances } from '../../domain/balances';
import { simplifyDebts } from '../../domain/simplify';
import { useProfile } from '../auth/useProfile';
import type { ExpenseInput } from '../expenses/useExpenses';
import { createExpense } from '../expenses/useExpenses';

export interface SettleSuggestion {
  from: string;
  to: string;
  amount: number;
  groupId: string | null;
  label: string;
}

export function useSettleSuggestions(): SettleSuggestion[] {
  const profile = useProfile();
  const data = useLiveQuery(async () => {
    const [expenses, groups, contacts] = await Promise.all([
      getDb().expenses.toArray(),
      getDb().groups.toArray(),
      getDb().contacts.toArray(),
    ]);
    return { expenses, groups, contacts };
  }, []);
  if (!profile || !data) return [];
  const { expenses, groups, contacts } = data;
  const liveGroups = groups.filter((g) => g.deletedAt === null);
  const liveExpenses = expenses.filter((e) => e.deletedAt === null);
  const suggestions: SettleSuggestion[] = [];

  function nameOf(id: string): string {
    if (id === profile!.id) return 'you';
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  }

  for (const g of liveGroups) {
    const net = groupBalances(liveExpenses, g.id);
    const transfers = simplifyDebts(net);
    for (const t of transfers) {
      suggestions.push({
        from: t.from,
        to: t.to,
        amount: t.amount,
        groupId: g.id,
        label: `${nameOf(t.from)} → ${nameOf(t.to)} (${g.name})`,
      });
    }
  }
  for (const c of contacts) {
    const bal = pairBalance(liveExpenses, profile!.id, c.id, null);
    if (bal.amount > 0) {
      suggestions.push({
        from: bal.from,
        to: bal.to,
        amount: bal.amount,
        groupId: null,
        label: `${nameOf(bal.from)} → ${nameOf(bal.to)}`,
      });
    }
  }
  return suggestions;
}

export async function recordSettlement(input: {
  from: string;
  to: string;
  amount: number;
  currency: string;
  groupId: string | null;
  date: number;
}): Promise<void> {
  const e: ExpenseInput = {
    amount: input.amount,
    currency: input.currency,
    description: 'Settle up',
    category: 'general',
    date: input.date,
    groupId: input.groupId,
    paidBy: input.from,
    splitMethod: 'exact',
    splits: [
      { userId: input.from, share: 0 },
      { userId: input.to, share: input.amount },
    ],
    isSettlement: true,
  };
  await createExpense(e);
}
