import { InputHTMLAttributes } from 'react';
import { Input } from './Input';
import { parseAmountToCents, centsToMajor } from '../lib/currency';

interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'inputMode'> {
  valueCents: number;
  onChange: (cents: number) => void;
  currency: string;
  placeholder?: string;
}

export function AmountInput({ valueCents, onChange, currency, placeholder, className = '', ...rest }: AmountInputProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">{currency}</span>
      <Input
        type="text"
        inputMode="decimal"
        value={valueCents === 0 ? '' : String(centsToMajor(valueCents))}
        onChange={(e) => onChange(parseAmountToCents(e.target.value))}
        placeholder={placeholder ?? '0.00'}
        className="pl-12 text-lg font-semibold"
        {...rest}
      />
    </div>
  );
}
