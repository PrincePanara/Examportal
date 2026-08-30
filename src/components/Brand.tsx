import React from 'react';
import { cn } from '../utils/format';

export function BrandMark({ className }: {className?: string;}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-[8px] bg-primary text-white',
        className ?? 'h-8 w-8'
      )}>
      
      <svg viewBox="0 0 24 24" fill="none" className="h-[58%] w-[58%]" stroke="currentColor" strokeWidth={2.4}>
        <path d="M5 7h11" strokeLinecap="round" />
        <path d="M5 12h7" strokeLinecap="round" />
        <path d="m13.5 16.5 2.5 2.5 5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>);

}

export function Wordmark({
  subtitle,
  className,
  markClassName




}: {subtitle?: string;className?: string;markClassName?: string;}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark className={markClassName} />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-[-0.02em] text-ink">EXAMLY</span>
        {subtitle &&
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{subtitle}</span>
        }
      </span>
    </span>);

}