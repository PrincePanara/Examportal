import React from 'react';
import { CheckIcon, CloudOffIcon, LoaderIcon, LockIcon, TimerIcon } from 'lucide-react';
import { cn, formatClock, initials } from '../../utils/format';
import type { SaveState } from '../../contexts/ExamSessionContext';

export function SaveIndicator({ state }: {state: SaveState;}) {
  if (state === 'idle') return null;
  const map: Record<Exclude<SaveState, 'idle'>, {icon: React.ReactNode;label: string;className: string;}> = {
    saving: {
      icon: <LoaderIcon aria-hidden className="h-3.5 w-3.5 animate-spin" />,
      label: 'Saving…',
      className: 'text-muted'
    },
    saved: {
      icon: <CheckIcon aria-hidden className="h-3.5 w-3.5" />,
      label: 'Answer saved',
      className: 'text-success'
    },
    offline: {
      icon: <CloudOffIcon aria-hidden className="h-3.5 w-3.5" />,
      label: 'Retrying…',
      className: 'text-warning'
    }
  };
  const config = map[state];
  return (
    <span
      aria-live="polite"
      className={cn('flex items-center gap-1.5 text-xs font-medium', config.className)}>
      
      {config.icon}
      {config.label}
    </span>);

}

type TimerTone = 'normal' | 'warning' | 'critical';

export function timerTone(secondsLeft: number, totalSeconds: number): TimerTone {
  if (secondsLeft <= 60) return 'critical';
  if (secondsLeft <= Math.min(300, totalSeconds * 0.1)) return 'warning';
  return 'normal';
}

interface ExamHeaderProps {
  examName: string;
  candidateName: string;
  questionIndex: number;
  questionTotal: number;
  answeredCount: number;
  secondsLeft: number;
  totalSeconds: number;
  saveState: SaveState;
  secure: boolean;
  previewBanner?: boolean;
}

export function ExamHeader({
  examName,
  candidateName,
  questionIndex,
  questionTotal,
  answeredCount,
  secondsLeft,
  totalSeconds,
  saveState,
  secure,
  previewBanner = false
}: ExamHeaderProps) {
  const tone = timerTone(secondsLeft, totalSeconds);
  const progress = questionTotal > 0 ? answeredCount / questionTotal * 100 : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      {previewBanner &&
      <div className="flex items-center justify-center gap-2 bg-ink px-4 py-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-surface">
          Student preview · answers are not recorded
        </div>
      }
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {secure &&
          <span className="flex items-center gap-1.5 rounded-md border border-primary-border bg-primary-soft px-2 py-1 text-2xs font-bold uppercase tracking-wide text-primary-dark">
              <LockIcon aria-hidden className="h-3 w-3" />
              <span className="hidden sm:inline">Secure mode</span>
            </span>
          }
          <p className="truncate text-[13px] font-semibold text-ink sm:text-sm">{examName}</p>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <div className="hidden text-right sm:block">
            <p className="tabular text-[13px] font-semibold text-ink">
              Question {questionIndex + 1} <span className="text-muted">/ {questionTotal}</span>
            </p>
            <p className="text-2xs text-muted">{answeredCount} answered</p>
          </div>

          <SaveIndicator state={saveState} />

          <div
            aria-live="off"
            className={cn(
              'flex items-center gap-2 rounded-lg border px-2.5 py-1.5',
              tone === 'critical' && 'border-primary bg-primary text-white',
              tone === 'warning' && 'border-warning/40 bg-warning-soft text-warning',
              tone === 'normal' && 'border-line bg-surface-alt text-ink'
            )}>
            
            <TimerIcon aria-hidden className="h-4 w-4" />
            <span className="tabular text-[15px] font-semibold tracking-tight">{formatClock(secondsLeft)}</span>
            <span className="sr-only">remaining</span>
          </div>

          <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-surface sm:flex">
            {initials(candidateName)}
          </span>
        </div>
      </div>
      <div className="h-0.5 w-full bg-surface-alt">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-swift"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Examination progress" />
        
      </div>
    </header>);

}