import { Link } from 'react-router-dom';
import type { Expense } from '../../db/schema';
import { Money } from '../../components/Money';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { useProfile } from '../auth/useProfile';
import { computeOwed } from '../../domain/splits';

interface ExpenseRowProps {
  expense: Expense;
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
  const profile = useProfile();
  const category = useLiveQuery(
    async () => getDb().categories.get(expense.category),
    [expense.category]
  );
  if (!profile) return null;
  const owed = computeOwed({
    amount: expense.amount,
    method: expense.splitMethod,
    splits: expense.splits,
  });
  const yourShare = owed[profile.id] ?? 0;
  const youPaid = expense.paidBy === profile.id;
  const net = (youPaid ? expense.amount : 0) - yourShare;

  return (
    <li>
      <Link
        to={`/expenses/${expense.id}`}
        className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-border-color hover:bg-text-secondary/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl" aria-hidden>{category?.icon ?? '📦'}</span>
          <div className="min-w-0">
            <div className="font-medium truncate">{expense.description || '(no description)'}</div>
            <div className="text-xs text-text-secondary">
              {new Date(expense.date).toLocaleDateString()} · {youPaid ? 'you paid' : 'they paid'}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <Money cents={expense.amount} currency={expense.currency} className="font-semibold" />
          {expense.isSettlement ? (
            <div className="text-xs text-text-muted">settlement</div>
          ) : (
            <div className={`text-xs ${net > 0 ? 'text-owed' : net < 0 ? 'text-owe' : 'text-text-muted'}`}>
              {net > 0 ? `you lent ${net / 100}` : net < 0 ? `you owe ${-net / 100}` : 'even'}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
