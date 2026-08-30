import React from 'react';
import { cn } from '../../utils/format';

export function TableWrap({ children, className }: {children: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] border-collapse text-sm">{children}</table>
    </div>);

}

export function THead({ children }: {children: React.ReactNode;}) {
  return (
    <thead className="bg-surface-alt/60">
      <tr>{children}</tr>
    </thead>);

}

export function TH({
  children,
  className,
  align = 'left',
  scope = 'col'





}: {children?: React.ReactNode;className?: string;align?: 'left' | 'right' | 'center';scope?: 'col' | 'row';}) {
  return (
    <th
      scope={scope}
      className={cn(
        'border-b border-line px-5 py-3 text-2xs font-semibold uppercase tracking-wider text-muted',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}>
      
      {children}
    </th>);

}

export function TBody({ children }: {children: React.ReactNode;}) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick




}: {children: React.ReactNode;className?: string;onClick?: () => void;}) {
  return (
    <tr
      className={cn(onClick && 'cursor-pointer transition-colors duration-150 ease-swift hover:bg-surface-alt/70', className)}
      onClick={onClick}>
      
      {children}
    </tr>);

}

export function TD({
  children,
  className,
  align = 'left'




}: {children?: React.ReactNode;className?: string;align?: 'left' | 'right' | 'center';}) {
  return (
    <td
      className={cn(
        'px-5 py-3.5 align-middle text-ink',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}>
      
      {children}
    </td>);

}