import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useFriends } from './useFriends';
import { useProfile } from '../auth/useProfile';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { FriendForm } from './FriendForm';
import { EmptyState } from '../../components/EmptyState';
import { BalanceBadge } from '../../components/BalanceBadge';
import { pairBalance } from '../../domain/balances';
import { getDb } from '../../db/db';

export function FriendsList() {
  const friends = useFriends();
  const profile = useProfile();
  const expenses = useLiveQuery(() => getDb().expenses.toArray(), []);
  const [showForm, setShowForm] = useState(false);

  if (!profile) return null;

  return (
    <div>
      <Header title="Friends" action={<Button size="sm" onClick={() => setShowForm(true)}>+ Add</Button>} />
      <div className="p-4">
        {!friends || friends.length === 0 ? (
          <EmptyState
            icon="🤝"
            title="No friends yet"
            description="Add a friend to start tracking shared expenses."
            action={<Button onClick={() => setShowForm(true)}>Add a friend</Button>}
          />
        ) : (
          <div className="space-y-2.5">
            {friends.map((f) => {
              const bal = pairBalance(expenses ?? [], profile.id, f.id);
              const youOwe = bal.from === profile.id && bal.amount > 0;
              const youAreOwed = bal.to === profile.id && bal.amount > 0;
              const signed = youOwe ? -bal.amount : youAreOwed ? bal.amount : 0;
              return (
                <Link
                  key={f.id}
                  to={`/friends/${f.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong hover:bg-bg-elevated/50 transition-all"
                >
                  <Avatar name={`${f.firstName} ${f.lastName}`} color={f.avatarColor} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{f.firstName} {f.lastName}</div>
                    <BalanceBadge cents={signed} currency={profile.defaultCurrency} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <FriendForm open={showForm} onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
    </div>
  );
}