import { TextareaHTMLAttributes, forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-xl bg-bg-card border border-border-color px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent ${className}`}
        {...rest}
      />
    );
  }
);
