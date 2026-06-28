import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { useProfile } from '../auth/useProfile';
import { monthKey } from '../../lib/dates';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function MonthlyChart() {
  const profile = useProfile();
  const expenses = useLiveQuery(() => getDb().expenses.toArray(), []);
  if (!profile || !expenses) return null;
  const byMonth = new Map<string, number>();
  for (const e of expenses) {
    if (e.deletedAt !== null || e.isSettlement) continue;
    const k = monthKey(e.date);
    byMonth.set(k, (byMonth.get(k) ?? 0) + e.amount);
  }
  const data = Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([k, v]) => ({ month: k.slice(5), total: v / 100 }));
  if (data.length === 0) return <p className="text-text-secondary text-sm">No spending data yet.</p>;
  return (
    <div className="rounded-xl bg-bg-card border border-border-color p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
