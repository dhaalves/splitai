import { formatMoney } from '../lib/currency';

interface BalanceBadgeProps {
  cents: number;
  currency: string;
}

export function BalanceBadge({ cents, currency }: BalanceBadgeProps) {
  if (cents === 0) {
    return <span className="text-slate-500 text-sm">settled up</span>;
  }
  const positive = cents > 0;
  return (
    <span className={positive ? 'text-owed' : 'text-owe'}>
      {positive ? 'you are owed ' : 'you owe '}
      {formatMoney(Math.abs(cents), currency)}
    </span>
  );
}
