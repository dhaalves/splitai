import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  action?: ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-bg-darker/95 backdrop-blur border-b border-border-color px-4 py-3 flex items-center justify-between z-30">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      {action}
    </header>
  );
}
