import { SelectHTMLAttributes, forwardRef } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl bg-bg-dark border border-border-strong px-3.5 py-3 text-text-primary transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...rest}
      >
        {children}
      </select>
    );
  }
);
