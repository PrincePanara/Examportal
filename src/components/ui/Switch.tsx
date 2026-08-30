import React, { useId } from 'react';
import { cn } from '../../utils/format';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40',
          checked ? 'border-primary bg-primary' : 'border-line-strong bg-surface-alt'
        )}>
        
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-swift',
            checked ? 'translate-x-[1.15rem]' : 'translate-x-0.5'
          )} />
        
      </button>
    </div>);

}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: {value: T;label: string;}[];
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
  className
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-line bg-surface-alt p-1',
        className
      )}>
      
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md font-medium transition-[background-color,color,box-shadow] duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]',
              active ? 'bg-surface text-ink shadow-raised' : 'text-muted hover:text-ink'
            )}>
            
            {option.label}
          </button>);

      })}
    </div>);

}