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

const freqIcons: Record<string, string> = {
  weekly: '📅',
  monthly: '🗓️',
  yearly: '🎉',
};

const freqColors: Record<string, string> = {
  weekly: 'rgba(6,182,212,0.12)',
  monthly: 'rgba(139,92,246,0.12)',
  yearly: 'rgba(234,179,8,0.12)',
};

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
          <div className="space-y-2.5">
            {all.map((r) => {
              const icon = freqIcons[r.frequency] ?? '🔁';
              const color = freqColors[r.frequency] ?? 'rgba(148,163,184,0.12)';
              return (
                <Link
                  key={r.id}
                  to={`/recurring/${r.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-border-color hover:border-border-strong hover:bg-bg-elevated/50 transition-all"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{r.description}</div>
                    <div className="text-xs text-text-secondary mt-0.5 capitalize">
                      {r.frequency} · next: {formatDate(r.nextDate)}
                    </div>
                    {r.active && (
                      <div className="inline-flex items-center gap-1 mt-1 text-xs text-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        active
                      </div>
                    )}
                  </div>
                  <Money cents={r.amount} currency={profile.defaultCurrency} className="font-bold font-display" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <FAB onClick={() => setShowForm(true)} label="+" />
      <RecurringForm open={showForm} onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
    </div>
  );
}