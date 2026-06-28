import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Money } from '../../components/Money';
import { useProfile } from '../auth/useProfile';
import { useSettleSuggestions, recordSettlement } from './useSettle';
import { useToasts } from '../../stores/toasts';

export function SettleUp() {
  const profile = useProfile();
  const suggestions = useSettleSuggestions();
  const push = useToasts((s) => s.push);

  if (!profile) return null;

  async function settle(s: { from: string; to: string; amount: number; groupId: string | null }) {
    if (!profile) return;
    await recordSettlement({
      from: s.from,
      to: s.to,
      amount: s.amount,
      currency: profile.defaultCurrency,
      groupId: s.groupId,
      date: Date.now(),
    });
    push('Settlement recorded', 'success');
  }

  return (
    <div>
      <Header title="Settle up" />
      <div className="p-4">
        {suggestions.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All settled up"
            description="No outstanding balances to settle."
          />
        ) : (
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-border-color">
                <div>
                  <div className="font-medium">{s.label}</div>
                  <Money cents={s.amount} currency={profile.defaultCurrency} className="text-text-secondary text-sm" />
                </div>
                <Button size="sm" onClick={() => settle(s)}>Settle</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
