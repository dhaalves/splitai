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
      <div className="flex gap-2">
        {methods.map((m) => (
          <button
            key={m}
            onClick={() => onMethodChange(m)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              method === m ? 'bg-accent text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <Avatar name={p.name} color={p.color} size="sm" />
            <div className="flex-1 text-sm">{p.name}</div>
            {method === 'equal' ? (
              <div className="text-sm text-slate-300">{formatMoney(owed[p.id] ?? 0, currency)}</div>
            ) : (
              <>
                <input
                  type="number"
                  inputMode="decimal"
                  value={shareOf(p.id) || ''}
                  onChange={(e) => onShareChange(p.id, Number(e.target.value))}
                  className="w-20 rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-right text-sm"
                  aria-label={`${p.name} share`}
                />
                <span className="text-xs text-slate-400 w-24">
                  = {formatMoney(owed[p.id] ?? 0, currency)}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
