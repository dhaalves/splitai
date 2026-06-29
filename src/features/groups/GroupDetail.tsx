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

const groupTypeIcons: Record<string, string> = {
  home: '🏠',
  trip: '✈️',
  couple: '💕',
  other: '📦',
};

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
  const icon = groupTypeIcons[group.type] ?? '📦';

  async function doDelete() {
    await softDeleteGroup(group!.id);
    push('Group deleted (restorable for 30 days)', 'success');
    navigate('/groups');
  }

  return (
    <div>
      <Header
        title={group.name}
        action={<Link to="/groups"><Button size="sm" variant="ghost">← Back</Button></Link>}
      />
      <div className="p-4 space-y-4">
        {/* Hero card */}
        <div
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            background: yourNet >= 0
              ? 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(6,182,212,0.05))'
              : 'linear-gradient(135deg, rgba(251,113,133,0.10), rgba(239,68,68,0.05))',
            borderColor: yourNet >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(251,113,133,0.25)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted font-semibold capitalize">
                <span className="text-base">{icon}</span> {group.type}
              </div>
              <div className={`text-2xl font-bold font-display mt-1 ${yourNet > 0 ? 'text-owed' : yourNet < 0 ? 'text-owe' : 'text-text-secondary'}`}>
                {yourNet === 0 ? 'settled up' : yourNet > 0
                  ? `you are owed ${formatMoney(yourNet, profile.defaultCurrency)}`
                  : `you owe ${formatMoney(-yourNet, profile.defaultCurrency)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-bg-dark border border-border-color">
          {(['expenses', 'balances', 'members'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-accent-500 text-white shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'expenses' && <ExpenseList groupId={group.id} />}
        {tab === 'balances' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-text-primary">Balances</h3>
              <button
                onClick={() => setSimplified((s) => !s)}
                className="text-xs px-3 py-1.5 rounded-lg bg-bg-card border border-border-color text-text-secondary hover:border-border-strong transition-all font-medium"
              >
                {simplified ? 'Show raw' : 'Simplify'}
              </button>
            </div>
            {!simplified ? (
              <div className="rounded-2xl bg-bg-card border border-border-color p-4 space-y-2.5 text-sm">
                {group.memberIds.map((uid) => {
                  const n = net[uid] ?? 0;
                  return (
                    <div key={uid} className="flex justify-between items-center">
                      <span className="text-text-secondary">{nameOf(uid)}</span>
                      <div className="flex items-center gap-2">
                        <Avatar name={nameOf(uid)} color={colorOf(uid)} size="sm" />
                        <span className={`font-semibold font-display ${n > 0 ? 'text-owed' : n < 0 ? 'text-owe' : 'text-text-muted'}`}>
                          {n === 0 ? 'settled' : formatMoney(n, profile.defaultCurrency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : transfers.length === 0 ? (
              <div className="rounded-2xl bg-bg-card border border-border-color p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-text-secondary text-sm">All settled up.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-bg-card border border-border-color p-4 space-y-2 text-sm">
                {transfers.map((t, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-text-secondary">{nameOf(t.from)} → {nameOf(t.to)}</span>
                    <span className="font-semibold font-display">{formatMoney(t.amount, profile.defaultCurrency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'members' && (
          <div className="space-y-2">
            {group.memberIds.map((uid) => (
              <div key={uid} className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-color">
                <Avatar name={nameOf(uid)} color={colorOf(uid)} size="sm" />
                <div className="flex-1 font-medium">{nameOf(uid)}</div>
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