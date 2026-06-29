import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-bg-card border border-border-color flex items-center justify-center text-4xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold font-display text-text-primary">{title}</h3>
      {description && <p className="text-text-secondary mt-1.5 max-w-xs text-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
