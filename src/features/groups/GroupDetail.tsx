import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { ExpenseList } from '../expenses/ExpenseList';
import { useGroup, softDeleteGroup, removeMember } from './useGroups';
import { useProfile } from '../auth/useProfile';
import { getDb } from '../../db/db';
import { groupBalances } from '../../domain/balances';
import { simplifyDebts } from '../../domain/simplify';
import { formatMoney } from '../../lib/currency';
import { useToasts } from '../../stores/toasts';
import type { Contact } from '../../db/schema';

type Tab = 'expenses' | 'balances' | 'members';

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const group = useGroup(id);
  const profile = useProfile();
  const expenses = useLiveQuery(() => getDb().expenses.toArray(), []);
  const contacts = useLiveQuery(() => getDb().contacts.toArray(), []);
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const [tab, setTab] = useState<Tab>('expenses');
  const [simplified, setSimplified] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!group || !profile) return null;

  const net = groupBalances(expenses ?? [], group.id);
  const yourNet = net[profile.id] ?? 0;

  function nameOf(userId: string): string {
    if (profile && userId === profile.id) return 'You';
    const c = (contacts ?? []).find((x) => x.id === userId) as Contact | undefined;
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  }
  function colorOf(userId: string): string {
    if (profile && userId === profile.id) return profile.avatarColor;
    const c = (contacts ?? []).find((x) => x.id === userId) as Contact | undefined;
    return c?.avatarColor ?? '#64748b';
  }

  const transfers = simplified ? simplifyDebts(net) : [];

  async function doDelete() {
    await softDeleteGroup(group!.id);
    push('Group deleted (restorable for 30 days)', 'success');
    navigate('/groups');
  }

  return (
    <div>
      <Header
        title={group.name}
        action={<Link to="/groups"><Button size="sm" variant="ghost">Back</Button></Link>}
      />
      <div className="p-4 space-y-4">
        <div className="rounded-xl bg-bg-card border border-border-color p-4">
          <div className="text-xs uppercase text-text-muted capitalize">{group.type}</div>
          <div className={`text-xl font-bold ${yourNet > 0 ? 'text-owed' : yourNet < 0 ? 'text-owe' : 'text-text-secondary'}`}>
            {yourNet === 0 ? 'settled up' : yourNet > 0
              ? `you are owed ${formatMoney(yourNet, profile.defaultCurrency)}`
              : `you owe ${formatMoney(-yourNet, profile.defaultCurrency)}`}
          </div>
        </div>
        <div className="flex gap-2">
          {(['expenses', 'balances', 'members'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-sm capitalize ${tab === t ? 'bg-accent-500 text-white' : 'bg-bg-card text-text-secondary'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 'expenses' && <ExpenseList groupId={group.id} />}
        {tab === 'balances' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase text-text-muted">Balances</h3>
              <button
                onClick={() => setSimplified((s) => !s)}
                className="text-xs px-2 py-1 rounded-lg bg-bg-card text-text-secondary"
              >
                {simplified ? 'Show raw' : 'Simplify'}
              </button>
            </div>
            {!simplified ? (
              <ul className="space-y-1 text-sm">
                {group.memberIds.map((uid) => {
                  const n = net[uid] ?? 0;
                  return (
                    <li key={uid} className="flex justify-between">
                      <span>{nameOf(uid)}</span>
                      <span className={n > 0 ? 'text-owed' : n < 0 ? 'text-owe' : 'text-text-muted'}>
                        {n === 0 ? 'settled' : formatMoney(n, profile.defaultCurrency)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : transfers.length === 0 ? (
              <p className="text-text-secondary text-sm">All settled up.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {transfers.map((t, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{nameOf(t.from)} owes {nameOf(t.to)}</span>
                    <span>{formatMoney(t.amount, profile.defaultCurrency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === 'members' && (
          <div className="space-y-2">
            {group.memberIds.map((uid) => (
              <div key={uid} className="flex items-center gap-3 p-2 rounded-lg bg-bg-card border border-border-color">
                <Avatar name={nameOf(uid)} color={colorOf(uid)} size="sm" />
                <div className="flex-1">{nameOf(uid)}</div>
                {uid !== profile.id && (
                  <Button size="sm" variant="ghost" onClick={async () => {
                    await removeMember(group.id, uid);
                    push('Member removed', 'success');
                  }}>Remove</Button>
                )}
              </div>
            ))}
            {group.memberIds.length === 1 && (
              <EmptyState title="Only you" description="Add friends first, then add them as members." />
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>Delete group</Button>
        </div>
      </div>
      <FAB to={`/expenses/new?group=${group.id}`} />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete group?"
        message="Soft-deleted for 30 days. Expenses remain but are unscoped."
        confirmLabel="Delete"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
