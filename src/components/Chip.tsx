import { ReactNode } from 'react';

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Chip({ selected, onClick, children }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap border ${
        selected
          ? 'bg-accent-500 text-white border-accent'
          : 'bg-bg-card text-text-secondary border-border-color hover:border-text-secondary'
      }`}
    >
      {children}
    </button>
  );
}
