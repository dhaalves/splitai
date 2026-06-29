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

// Category icon background colors — maps common category ids to accent tints
const catColors: Record<string, string> = {
  food: 'rgba(16,185,129,0.12)',
  transport: 'rgba(6,182,212,0.12)',
  rent: 'rgba(139,92,246,0.12)',
  entertainment: 'rgba(234,179,8,0.12)',
  health: 'rgba(239,68,68,0.12)',
  groceries: 'rgba(52,211,153,0.12)',
  travel: 'rgba(251,113,133,0.12)',
  general: 'rgba(148,163,184,0.12)',
};

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
  const catColor = catColors[expense.category] ?? 'rgba(148,163,184,0.12)';

  return (
    <li>
      <Link
        to={`/expenses/${expense.id}`}
        className="flex items-center gap-3 p-3 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong hover:bg-bg-elevated/50 transition-all group"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: catColor }}
          aria-hidden
        >
          {category?.icon ?? '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{expense.description || '(no description)'}</div>
          <div className="text-xs text-text-secondary mt-0.5">
            {new Date(expense.date).toLocaleDateString()} · {youPaid ? 'you paid' : 'they paid'}
          </div>
        </div>
        <div className="text-right shrink-0">
          <Money cents={expense.amount} currency={expense.currency} className="font-bold font-display" />
          {expense.isSettlement ? (
            <div className="text-xs text-text-muted">settlement</div>
          ) : (
            <div className={`text-xs font-semibold mt-0.5 ${net > 0 ? 'text-owed' : net < 0 ? 'text-owe' : 'text-text-muted'}`}>
              {net > 0 ? `+${net / 100}` : net < 0 ? `−${-net / 100}` : 'even'}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}