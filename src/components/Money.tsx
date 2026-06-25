import { formatMoney } from '../lib/currency';

interface MoneyProps {
  cents: number;
  currency: string;
  className?: string;
}

export function Money({ cents, currency, className = '' }: MoneyProps) {
  return <span className={className}>{formatMoney(cents, currency)}</span>;
}
