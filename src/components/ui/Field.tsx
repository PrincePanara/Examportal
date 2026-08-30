import React, { useId } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/format';

const controlBase =
'w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] duration-150 ease-swift focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/12 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {id: string;describedBy?: string;invalid: boolean;}) => React.ReactNode;
  className?: string;
}

export function Field({ label, hint, error, required, children, className }: FieldShellProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-center gap-1 text-[13px] font-medium text-ink">
        {label}
        {required &&
        <span aria-hidden className="text-primary">
            *
          </span>
        }
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error &&
      <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      }
      {error &&
      <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <AlertCircleIcon aria-hidden className="h-3.5 w-3.5" />
          {error}
        </p>
      }
    </div>);

}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function TextInput({ invalid, leading, trailing, className, ...rest }: TextInputProps) {
  return (
    <div className="relative">
      {leading &&
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {leading}
        </span>
      }
      <input
        className={cn(
          controlBase,
          'h-10',
          invalid ? 'border-primary' : 'border-line',
          leading && 'pl-9',
          trailing && 'pr-10',
          className
        )}
        aria-invalid={invalid || undefined}
        {...rest} />
      
      {trailing && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>);

}

export function TextArea({
  invalid,
  className,
  rows = 4,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {invalid?: boolean;}) {
  return (
    <textarea
      rows={rows}
      className={cn(controlBase, 'py-2.5 leading-relaxed', invalid ? 'border-primary' : 'border-line', className)}
      aria-invalid={invalid || undefined}
      {...rest} />);


}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {invalid?: boolean;}) {
  return (
    <select
      className={cn(controlBase, 'h-10 appearance-none pr-8', invalid ? 'border-primary' : 'border-line', className)}
      style={{
        backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.6rem center',
        backgroundSize: '1rem'
      }}
      {...rest}>
      
      {children}
    </select>);

}