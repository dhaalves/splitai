import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useExpense, softDeleteExpense, restoreExpense } from './useExpenses';
import { useProfile } from '../auth/useProfile';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Money } from '../../components/Money';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToasts } from '../../stores/toasts';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { computeOwed } from '../../domain/splits';
import { formatMoney } from '../../lib/currency';
import { formatDate } from '../../lib/dates';

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

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const expense = useExpense(id);
  const profile = useProfile();
  const contacts = useLiveQuery(() => getDb().contacts.toArray(), []);
  const category = useLiveQuery(
    async () => (expense ? getDb().categories.get(expense.category) : undefined),
    [expense?.category]
  );
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!expense || !profile) return null;
  const owed = computeOwed({ amount: expense.amount, method: expense.splitMethod, splits: expense.splits });
  const catColor = catColors[expense.category] ?? 'rgba(148,163,184,0.12)';

  function nameOf(userId: string): string {
    if (profile && userId === profile.id) return `${profile.firstName} ${profile.lastName}`;
    const c = (contacts ?? []).find((x) => x.id === userId);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  }

  async function doDelete() {
    await softDeleteExpense(expense!.id);
    push('Expense deleted (restorable for 30 days)', 'success');
    navigate(-1);
  }

  return (
    <div>
      <Header
        title="Expense"
        action={<Link to="/"><Button size="sm" variant="ghost">← Back</Button></Link>}
      />
      <div className="p-4 space-y-4">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl bg-bg-card border border-border-color p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold font-display">
                <Money cents={expense.amount} currency={expense.currency} />
              </div>
              <div className="text-text-secondary mt-1">{expense.description || '(no description)'}</div>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: catColor }}
            >
              {category?.icon ?? '📦'}
            </div>
          </div>
          <dl className="mt-4 text-sm space-y-2 border-t border-border-color pt-4">
            <div className="flex justify-between"><dt className="text-text-secondary">Date</dt><dd className="font-medium">{formatDate(expense.date)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Category</dt><dd className="font-medium">{category?.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Paid by</dt><dd className="font-medium">{nameOf(expense.paidBy)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Method</dt><dd className="font-medium capitalize">{expense.splitMethod}</dd></div>
            {expense.isSettlement && <div className="flex justify-between"><dt className="text-text-secondary">Type</dt><dd className="font-medium text-accent-secondary">Settlement</dd></div>}
          </dl>
        </div>

        {/* Splits */}
        {!expense.isSettlement && (
          <div className="rounded-2xl bg-bg-card border border-border-color p-5">
            <h3 className="text-sm font-bold font-display text-text-primary mb-3">Splits</h3>
            <ul className="space-y-2.5 text-sm">
              {expense.splits.map((s) => (
                <li key={s.userId} className="flex justify-between items-center">
                  <span className="text-text-secondary">{nameOf(s.userId)}</span>
                  <span className="font-semibold font-display">{formatMoney(owed[s.userId] ?? 0, expense.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Link to={`/expenses/${expense.id}/edit`}><Button size="sm">Edit</Button></Link>
          {expense.deletedAt === null ? (
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>Delete</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={async () => {
              await restoreExpense(expense.id);
              push('Expense restored', 'success');
            }}>Restore</Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete expense?"
        message="Soft-deleted for 30 days, then permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}