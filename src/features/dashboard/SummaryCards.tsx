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
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-bg-card border border-border-color p-4">
        <div className="text-xs uppercase text-text-muted">You owe</div>
        <div className="text-xl font-bold text-owe">{formatMoney(youOwe, profile.defaultCurrency)}</div>
      </div>
      <div className="rounded-xl bg-bg-card border border-border-color p-4">
        <div className="text-xs uppercase text-text-muted">You are owed</div>
        <div className="text-xl font-bold text-owed">{formatMoney(youAreOwed, profile.defaultCurrency)}</div>
      </div>
    </div>
  );
}
