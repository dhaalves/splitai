import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl bg-bg-dark border border-border-strong px-3.5 py-3 text-text-primary placeholder-text-muted transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...rest}
      />
    );
  }
);
