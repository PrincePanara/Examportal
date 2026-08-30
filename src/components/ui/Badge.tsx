import React from 'react';
import { cn } from '../../utils/format';
import type { Difficulty, ExamStatus, QuestionType, UserStatus } from '../../types';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'muted';

const tones: Record<Tone, string> = {
  neutral: 'border-line bg-surface-alt text-ink',
  primary: 'border-primary-border bg-primary-soft text-primary-dark',
  success: 'border-success/25 bg-success-soft text-success',
  warning: 'border-warning/25 bg-warning-soft text-warning',
  muted: 'border-line bg-transparent text-muted'
};

export function Badge({
  tone = 'neutral',
  children,
  className,
  dot = false





}: {tone?: Tone;children: React.ReactNode;className?: string;dot?: boolean;}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide',
        tones[tone],
        className
      )}>
      
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>);

}

const examStatusTone: Record<ExamStatus, Tone> = {
  draft: 'muted',
  scheduled: 'warning',
  published: 'success',
  completed: 'neutral',
  archived: 'muted'
};

export function ExamStatusBadge({ status }: {status: ExamStatus;}) {
  return (
    <Badge tone={examStatusTone[status]} dot>
      {status}
    </Badge>);

}

const userStatusTone: Record<UserStatus, Tone> = {
  active: 'success',
  disabled: 'primary',
  invited: 'warning'
};

export function UserStatusBadge({ status }: {status: UserStatus;}) {
  return (
    <Badge tone={userStatusTone[status]} dot>
      {status}
    </Badge>);

}

const difficultyLabel: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const difficultyTone: Record<Difficulty, Tone> = { easy: 'success', medium: 'warning', hard: 'primary' };

export function DifficultyBadge({ difficulty }: {difficulty: Difficulty;}) {
  return <Badge tone={difficultyTone[difficulty]}>{difficultyLabel[difficulty]}</Badge>;
}

export const questionTypeLabel: Record<QuestionType, string> = {
  single: 'Single answer',
  multiple: 'Multiple answer',
  boolean: 'True / False',
  short: 'Short answer'
};

export function QuestionTypeBadge({ type }: {type: QuestionType;}) {
  return <Badge tone="neutral">{questionTypeLabel[type]}</Badge>;
}