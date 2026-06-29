import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-button-gradient text-white shadow-btn-primary hover:brightness-110 hover:-translate-y-0.5 hover:shadow-glow-sm',
  secondary: 'bg-bg-card text-text-primary border border-border-strong hover:bg-bg-elevated hover:border-accent',
  ghost: 'bg-transparent text-text-secondary hover:text-accent hover:bg-accent/10',
  danger: 'bg-accent-danger/15 text-accent-danger border border-accent-danger/30 hover:bg-accent-danger/25',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
}
