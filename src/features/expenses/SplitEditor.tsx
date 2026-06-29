import type { SplitEntry, SplitMethod } from '../../db/schema';
import { computeOwed } from '../../domain/splits';
import { formatMoney } from '../../lib/currency';
import { Avatar } from '../../components/Avatar';

interface Participant {
  id: string;
  name: string;
  color: string;
}

interface SplitEditorProps {
  amount: number;
  currency: string;
  method: SplitMethod;
  splits: SplitEntry[];
  participants: Participant[];
  onMethodChange: (method: SplitMethod) => void;
  onShareChange: (userId: string, share: number) => void;
}

const methods: SplitMethod[] = ['equal', 'exact', 'percent', 'shares'];

export function SplitEditor({
  amount, currency, method, splits, participants, onMethodChange, onShareChange,
}: SplitEditorProps) {
  const owed = computeOwed({ amount, method, splits });
  const shareOf = (userId: string) => splits.find((s) => s.userId === userId)?.share ?? 0;

  return (
    <div className="space-y-3">
      <div>
        <span className="text-sm font-medium text-text-secondary">Split method</span>
        <div className="flex gap-2 mt-1.5 p-1 rounded-xl bg-bg-dark border border-border-color">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => onMethodChange(m)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                method === m ? 'bg-accent-500 text-white shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-2">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-card border border-border-color">
            <Avatar name={p.name} color={p.color} size="sm" />
            <div className="flex-1 text-sm font-medium">{p.name}</div>
            {method === 'equal' ? (
              <div className="text-sm font-display font-semibold text-text-secondary">{formatMoney(owed[p.id] ?? 0, currency)}</div>
            ) : (
              <>
                <input
                  type="number"
                  inputMode="decimal"
                  value={shareOf(p.id) || ''}
                  onChange={(e) => onShareChange(p.id, Number(e.target.value))}
                  className="w-20 rounded-lg bg-bg-dark border border-border-strong px-2.5 py-1.5 text-right text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  aria-label={`${p.name} share`}
                />
                <span className="text-xs text-text-muted w-24 font-mono">
                  {formatMoney(owed[p.id] ?? 0, currency)}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}