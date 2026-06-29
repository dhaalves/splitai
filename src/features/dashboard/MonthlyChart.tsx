import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import { useProfile } from '../auth/useProfile';
import { monthKey } from '../../lib/dates';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  // Last bar gets full accent, previous bars are muted
  const barColors = data.map((_, i) =>
    i === data.length - 1 ? '#10b981' : i === data.length - 2 ? '#059669' : 'rgba(16,185,129,0.4)'
  );

  return (
    <div className="rounded-2xl bg-bg-card border border-border-color p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold font-display text-text-primary">Monthly spending</div>
        <div className="text-xs text-text-muted font-mono">last 6 months</div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              backgroundColor: '#0f1626',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 12,
              fontSize: 13,
            }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#10b981' }}
            formatter={(v: number) => [`${profile.defaultCurrency} ${v}`, 'Spent']}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill={barColors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}