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
        action={<Link to="/"><Button size="sm" variant="ghost">Back</Button></Link>}
      />
      <div className="p-4 space-y-4">
        <div className="rounded-xl bg-bg-card border border-border-color p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                <Money cents={expense.amount} currency={expense.currency} />
              </div>
              <div className="text-text-secondary">{expense.description || '(no description)'}</div>
            </div>
            <span className="text-3xl" aria-hidden>{category?.icon ?? '📦'}</span>
          </div>
          <dl className="mt-4 text-sm space-y-1">
            <div className="flex justify-between"><dt className="text-text-secondary">Date</dt><dd>{formatDate(expense.date)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Category</dt><dd>{category?.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Paid by</dt><dd>{nameOf(expense.paidBy)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Method</dt><dd className="capitalize">{expense.splitMethod}</dd></div>
            {expense.isSettlement && <div className="flex justify-between"><dt className="text-text-secondary">Type</dt><dd>Settlement</dd></div>}
          </dl>
        </div>
        {!expense.isSettlement && (
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <h3 className="text-sm uppercase text-text-muted mb-2">Splits</h3>
            <ul className="space-y-1 text-sm">
              {expense.splits.map((s) => (
                <li key={s.userId} className="flex justify-between">
                  <span>{nameOf(s.userId)}</span>
                  <span>{formatMoney(owed[s.userId] ?? 0, expense.currency)}</span>
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
