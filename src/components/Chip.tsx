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
          ? 'bg-accent text-white border-accent'
          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  );
}
