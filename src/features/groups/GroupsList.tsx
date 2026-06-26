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
          <ul className="space-y-2">
            {groups.map((g) => {
              const net = groupBalances(expenses ?? [], g.id)[profile.id] ?? 0;
              return (
                <li key={g.id}>
                  <Link
                    to={`/groups/${g.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/60"
                  >
                    <div>
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{g.type} · {g.memberIds.length} members</div>
                    </div>
                    <div className={`text-sm ${net > 0 ? 'text-owed' : net < 0 ? 'text-owe' : 'text-slate-500'}`}>
                      {net === 0 ? 'settled' : formatMoney(net, profile.defaultCurrency)}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
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
