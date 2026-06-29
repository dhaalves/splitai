import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { useProfile } from '../auth/useProfile';
import { computeNetBalances } from '../../domain/balances';
import { formatMoney } from '../../lib/currency';

export function SummaryCards() {
  const profile = useProfile();
  const expenses = useLiveQuery(() => getDb().expenses.toArray(), []);
  if (!profile || !expenses) return null;
  const net = computeNetBalances(expenses.filter((e) => e.deletedAt === null));
  const youOwe = -Math.min(0, net[profile.id] ?? 0);
  const youAreOwed = Math.max(0, net[profile.id] ?? 0);
  const total = youAreOwed - youOwe;

  return (
    <div className="space-y-3">
      {/* Net balance hero card */}
      <div className="relative overflow-hidden rounded-2xl border p-5"
        style={{
          background: total >= 0
            ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.06) 100%)'
            : 'linear-gradient(135deg, rgba(251,113,133,0.12) 0%, rgba(239,68,68,0.06) 100%)',
          borderColor: total >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(251,113,133,0.25)',
        }}
      >
        <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">Net balance</div>
        <div className={`text-3xl font-bold font-display mt-1 ${total >= 0 ? 'text-owed' : 'text-owe'}`}>
          {total >= 0 ? '+' : '−'}{formatMoney(Math.abs(total), profile.defaultCurrency)}
        </div>
        <div className="text-xs text-text-secondary mt-1">
          {total > 0 ? 'You are in credit' : total < 0 ? 'You are in debt' : 'All settled up'}
        </div>
      </div>

      {/* Owe / Owed pair */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-xl border border-owe/20 p-4 bg-owe/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-owe/15 flex items-center justify-center text-sm">↓</div>
            <div className="text-xs uppercase tracking-wide text-text-muted font-medium">You owe</div>
          </div>
          <div className="text-xl font-bold font-display text-owe">{formatMoney(youOwe, profile.defaultCurrency)}</div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-owed/20 p-4 bg-owed/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-owed/15 flex items-center justify-center text-sm">↑</div>
            <div className="text-xs uppercase tracking-wide text-text-muted font-medium">You are owed</div>
          </div>
          <div className="text-xl font-bold font-display text-owed">{formatMoney(youAreOwed, profile.defaultCurrency)}</div>
        </div>
      </div>
    </div>
  );
}