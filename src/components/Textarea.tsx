import { TextareaHTMLAttributes, forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-xl bg-bg-dark border border-border-strong px-3.5 py-3 text-text-primary placeholder-text-muted transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...rest}
      />
    );
  }
);
