import { ReactNode } from 'react';

type ChipVariant = 'default' | 'accent' | 'owed' | 'owe' | 'warn';

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  variant?: ChipVariant;
  children: ReactNode;
}

const variantStyles: Record<ChipVariant, string> = {
  default: 'bg-bg-elevated text-text-secondary border-border-color',
  accent: 'bg-accent/12 text-accent border-accent/30',
  owed: 'bg-owed/12 text-owed border-owed/30',
  owe: 'bg-owe/12 text-owe border-owe/30',
  warn: 'bg-accent-secondary/12 text-accent-secondary border-accent-secondary/30',
};

export function Chip({ selected, onClick, variant, children }: ChipProps) {
  const v = variant ?? (selected ? 'accent' : 'default');
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${variantStyles[v]} ${onClick ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}`}
    >
      {children}
    </button>
  );
}
