import { SelectHTMLAttributes, forwardRef } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl bg-bg-card border border-border-color px-3 py-2 text-text-primary focus:outline-none focus:border-accent ${className}`}
        {...rest}
      >
        {children}
      </select>
    );
  }
);
