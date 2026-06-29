import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  action?: ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-bg-darker/95 backdrop-blur-md border-b border-border-color px-4 py-3.5 flex items-center justify-between z-30">
      <h1 className="text-xl font-bold font-display text-text-primary">{title}</h1>
      {action}
    </header>
  );
}
