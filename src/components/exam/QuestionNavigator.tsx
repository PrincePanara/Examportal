import React, { useState } from 'react';
import { BookmarkIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/format';
import type { AnswerMap, Question } from '../../types';

interface NavigatorProps {
  questions: Question[];
  answers: AnswerMap;
  marked: string[];
  currentIndex: number;
  allowJump: boolean;
  onJump: (index: number) => void;
}

function state(question: Question, answers: AnswerMap, marked: string[], isCurrent: boolean) {
  if (isCurrent) return 'current' as const;
  if (marked.includes(question.id)) return 'marked' as const;
  return (answers[question.id] ?? []).length > 0 ? 'answered' as const : 'unanswered' as const;
}

const cellStyles = {
  current: 'border-primary bg-primary text-white',
  answered: 'border-success/35 bg-success-soft text-success',
  marked: 'border-warning/40 bg-warning-soft text-warning',
  unanswered: 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink'
};

export function QuestionNavigator({
  questions,
  answers,
  marked,
  currentIndex,
  allowJump,
  onJump
}: NavigatorProps) {
  const [open, setOpen] = useState(false);

  const answeredCount = questions.filter((q) => (answers[q.id] ?? []).length > 0).length;

  const grid =
  <>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
        {questions.map((question, index) => {
        const cell = state(question, answers, marked, index === currentIndex);
        const isMarked = marked.includes(question.id);
        return (
          <button
            key={question.id}
            type="button"
            disabled={!allowJump && index !== currentIndex}
            onClick={() => {
              onJump(index);
              setOpen(false);
            }}
            aria-current={index === currentIndex ? 'true' : undefined}
            aria-label={`Question ${index + 1}${
            cell === 'answered' ? ', answered' : cell === 'marked' ? ', marked for review' : cell === 'unanswered' ? ', not answered' : ', current'}`
            }
            className={cn(
              'tabular relative flex h-9 items-center justify-center rounded-lg border text-[13px] font-semibold transition-[background-color,border-color,color] duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-45',
              cellStyles[cell]
            )}>
            
              {String(index + 1).padStart(2, '0')}
              {isMarked && index !== currentIndex &&
            <BookmarkIcon aria-hidden className="absolute -right-0.5 -top-0.5 h-3 w-3 fill-current" />
            }
            </button>);

      })}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-xs lg:grid-cols-1">
        {[
      { key: 'answered', label: `Answered · ${answeredCount}` },
      { key: 'unanswered', label: `Not answered · ${questions.length - answeredCount}` },
      { key: 'marked', label: `Marked for review · ${marked.length}` },
      { key: 'current', label: 'Current question' }].
      map((legend) =>
      <div key={legend.key} className="flex items-center gap-2">
            <span
          aria-hidden
          className={cn('h-3 w-3 shrink-0 rounded border', cellStyles[legend.key as keyof typeof cellStyles])} />
        
            <dt className="text-muted">{legend.label}</dt>
          </div>
      )}
      </dl>
    </>;


  return (
    <>
      <section
        aria-label="Question navigator"
        className="hidden rounded-xl border border-line bg-surface p-4 shadow-card lg:block">
        
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted">Questions</h2>
        {grid}
      </section>

      <section aria-label="Question navigator" className="rounded-xl border border-line bg-surface shadow-card lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
          
          <span className="text-[13px] font-semibold text-ink">
            Question navigator
            <span className="ml-2 font-normal text-muted">
              {answeredCount}/{questions.length} answered
            </span>
          </span>
          <ChevronDownIcon
            aria-hidden
            className={cn('h-4 w-4 text-muted transition-transform duration-150 ease-swift', open && 'rotate-180')} />
          
        </button>
        {open && <div className="border-t border-line p-4">{grid}</div>}
      </section>
    </>);

}