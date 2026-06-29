import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { GroupForm } from './GroupForm';
import { useGroups } from './useGroups';
import { useProfile } from '../auth/useProfile';
import { getDb } from '../../db/db';
import { groupBalances } from '../../domain/balances';
import { formatMoney } from '../../lib/currency';

const groupTypeIcons: Record<string, string> = {
  home: '🏠',
  trip: '✈️',
  couple: '💕',
  other: '📦',
};

export function GroupsList() {
  const groups = useGroups();
  const profile = useProfile();
  const expenses = useLiveQuery(() => getDb().expenses.toArray(), []);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <div>
      <Header title="Groups" />
      <div className="p-4">
        {!groups || groups.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No groups yet"
            description="Create a group for home, a trip, or any shared context."
            action={<Button onClick={() => setShowForm(true)}>Create group</Button>}
          />
        ) : (
          <div className="space-y-2.5">
            {groups.map((g) => {
              const net = groupBalances(expenses ?? [], g.id)[profile.id] ?? 0;
              const icon = groupTypeIcons[g.type] ?? '📦';
              return (
                <Link
                  key={g.id}
                  to={`/groups/${g.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong hover:bg-bg-elevated/50 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center text-lg shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{g.name}</div>
                    <div className="text-xs text-text-secondary capitalize mt-0.5">{g.type} · {g.memberIds.length} members</div>
                  </div>
                  <div className={`text-sm font-bold font-display ${net > 0 ? 'text-owed' : net < 0 ? 'text-owe' : 'text-text-muted'}`}>
                    {net === 0 ? 'settled' : formatMoney(net, profile.defaultCurrency)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <FAB onClick={() => setShowForm(true)} label="+" />
      <GroupForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={(id) => { setShowForm(false); navigate(`/groups/${id}`); }}
      />
    </div>
  );
}