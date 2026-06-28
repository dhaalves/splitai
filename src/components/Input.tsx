import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl bg-bg-card border border-border-color px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent ${className}`}
        {...rest}
      />
    );
  }
);
