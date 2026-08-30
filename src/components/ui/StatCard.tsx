import React from 'react';
import { cn } from '../../utils/format';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{className?: string;}>;
  emphasis?: boolean;
  progress?: number;
}

export function StatCard({ label, value, sub, icon: Icon, emphasis = false, progress }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-surface p-5 shadow-card transition-colors duration-150 ease-swift',
        emphasis ? 'border-primary-border' : 'border-line'
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        {Icon &&
        <span
          className={cn(
            'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            emphasis ? 'bg-primary-soft text-primary' : 'bg-surface-alt text-muted'
          )}>
          
            <Icon aria-hidden className="h-4 w-4" />
          </span>
        }
      </div>
      <p
        className={cn(
          'tabular mt-3 text-[28px] font-semibold leading-none tracking-[-0.03em]',
          emphasis ? 'text-primary' : 'text-ink'
        )}>
        
        {value}
      </p>
      {typeof progress === 'number' &&
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-alt">
          <div
          className={cn('h-full rounded-full transition-[width] duration-300 ease-swift', emphasis ? 'bg-primary' : 'bg-ink/70')}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        
        </div>
      }
      {sub && <p className="mt-2.5 text-xs text-muted">{sub}</p>}
    </div>);

}