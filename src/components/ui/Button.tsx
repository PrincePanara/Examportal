import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:translate-y-px';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-raised hover:bg-primary-dark',
  secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-alt',
  ghost: 'text-muted hover:bg-surface-alt hover:text-ink',
  danger: 'border border-primary-border bg-primary-soft text-primary-dark hover:bg-primary hover:text-white hover:border-primary',
  soft: 'bg-primary-soft text-primary-dark hover:bg-primary-border/60'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm'
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}>
      
      {loading && <Loader2Icon aria-hidden className="h-4 w-4 animate-spin" />}
      {children}
    </button>);

}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {label: string;}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted transition-[background-color,color,border-color] duration-150 ease-swift hover:bg-surface-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-40',
        className
      )}
      {...rest}>
      
      {children}
    </button>);

}