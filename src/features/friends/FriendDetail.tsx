import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useFriend, deleteFriend } from './useFriends';
import { useProfile } from '../auth/useProfile';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { BalanceBadge } from '../../components/BalanceBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToasts } from '../../stores/toasts';
import { getDb } from '../../db/db';
import { pairBalance } from '../../domain/balances';
import { ExpenseRow } from '../expenses/ExpenseRow';

export function FriendDetail() {
  const { id } = useParams<{ id: string }>();
  const friend = useFriend(id);
  const profile = useProfile();
  const expenses = useLiveQuery(() => getDb().expenses.toArray(), []);
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!friend || !profile) return null;
  const shared = (expenses ?? []).filter(
    (e) =>
      e.deletedAt === null &&
      e.groupId === null &&
      e.splits.some((s) => s.userId === friend.id) &&
      (e.paidBy === profile.id || e.paidBy === friend.id)
  );
  const bal = pairBalance(expenses ?? [], profile.id, friend.id);
  const signed = bal.to === profile.id ? bal.amount : -bal.amount;

  async function doDelete() {
    try {
      await deleteFriend(friend!.id);
      push('Friend removed', 'success');
      navigate('/friends');
    } catch (e) {
      push(e instanceof Error ? e.message : String(e), 'error');
    }
  }

  return (
    <div>
      <Header
        title={`${friend.firstName} ${friend.lastName}`}
        action={<Link to="/friends"><Button size="sm" variant="ghost">Back</Button></Link>}
      />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={`${friend.firstName} ${friend.lastName}`} color={friend.avatarColor} size="lg" />
          <div>
            <div className="text-lg font-semibold">{friend.firstName} {friend.lastName}</div>
            <BalanceBadge cents={signed} currency={profile.defaultCurrency} />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Link to={`/expenses/new?friend=${friend.id}`}><Button size="sm">Add expense</Button></Link>
          <Link to={`/settle?friend=${friend.id}`}><Button size="sm" variant="secondary">Settle up</Button></Link>
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>Remove</Button>
        </div>
        <h3 className="text-sm uppercase text-slate-500 mb-2">Shared expenses</h3>
        {shared.length === 0 ? (
          <p className="text-slate-400">No expenses yet.</p>
        ) : (
          <ul className="space-y-2">
            {shared.sort((a, b) => b.date - a.date).map((e) => (
              <ExpenseRow key={e.id} expense={e} />
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Remove friend?"
        message="This cannot be undone."
        confirmLabel="Remove"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
