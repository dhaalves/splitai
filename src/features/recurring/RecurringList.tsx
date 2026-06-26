import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { Money } from '../../components/Money';
import { useRecurringAll } from './useRecurring';
import { useProfile } from '../auth/useProfile';
import { RecurringForm } from './RecurringForm';
import { formatDate } from '../../lib/dates';

export function RecurringList() {
  const all = useRecurringAll();
  const profile = useProfile();
  const [showForm, setShowForm] = useState(false);

  if (!profile) return null;

  return (
    <div>
      <Header title="Recurring" />
      <div className="p-4">
        {!all || all.length === 0 ? (
          <EmptyState
            icon="🔁"
            title="No recurring expenses"
            description="Set up a recurring expense for rent, subscriptions, and more."
            action={<Button onClick={() => setShowForm(true)}>New recurring</Button>}
          />
        ) : (
          <ul className="space-y-2">
            {all.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/recurring/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/60"
                >
                  <div>
                    <div className="font-medium">{r.description}</div>
                    <div className="text-xs text-slate-400 capitalize">
                      {r.frequency} · next: {formatDate(r.nextDate)} · {r.active ? 'active' : 'paused'}
                    </div>
                  </div>
                  <Money cents={r.amount} currency={profile.defaultCurrency} className="font-semibold" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FAB onClick={() => setShowForm(true)} label="+" />
      <RecurringForm open={showForm} onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
    </div>
  );
}
