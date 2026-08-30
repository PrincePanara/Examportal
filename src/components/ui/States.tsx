import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { cn } from '../../utils/format';
import { Button } from './Button';

export function Panel({
  children,
  className,
  as: Tag = 'section'




}: {children: React.ReactNode;className?: string;as?: 'section' | 'div' | 'article';}) {
  return (
    <Tag className={cn('rounded-xl border border-line bg-surface shadow-card', className)}>{children}</Tag>);

}

export function PanelHeader({
  title,
  description,
  action,
  className





}: {title: string;description?: string;action?: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      {action}
    </div>);

}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className






}: {icon: React.ComponentType<{className?: string;}>;title: string;description: string;action?: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-alt text-muted">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>);

}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry




}: {title?: string;description: string;onRetry?: () => void;}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
        <AlertTriangleIcon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {onRetry &&
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RefreshCwIcon aria-hidden className="h-4 w-4" />
          Try again
        </Button>
      }
    </div>);

}

export function Skeleton({ className }: {className?: string;}) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-surface-alt', className)} />;
}

export function TableSkeleton({ rows = 5, columns = 5 }: {rows?: number;columns?: number;}) {
  return (
    <div className="divide-y divide-line" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) =>
      <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, colIndex) =>
        <Skeleton
          key={colIndex}
          className={cn('h-3.5', colIndex === 0 ? 'w-1/3' : 'flex-1')} />

        )}
        </div>
      )}
    </div>);

}

export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-16" />
    </div>);

}