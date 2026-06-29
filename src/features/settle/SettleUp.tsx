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
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-color transition-all hover:border-border-strong"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg shrink-0">
                  💸
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{s.label}</div>
                  <Money cents={s.amount} currency={profile.defaultCurrency} className="text-text-secondary text-sm font-display" />
                </div>
                <Button size="sm" onClick={() => settle(s)}>Settle</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
