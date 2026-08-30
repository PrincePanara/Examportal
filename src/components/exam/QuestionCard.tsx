import React from 'react';
import { motion } from 'framer-motion';
import { BookmarkIcon, CheckIcon } from 'lucide-react';
import { cn } from '../../utils/format';
import { Badge, questionTypeLabel } from '../ui/Badge';
import type { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selected: string[];
  marked: boolean;
  allowChange: boolean;
  onSelect: (optionIds: string[]) => void;
}

const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionCard({
  question,
  index,
  total,
  selected,
  marked,
  allowChange,
  onSelect
}: QuestionCardProps) {
  const multiple = question.type === 'multiple';

  const toggle = (optionId: string) => {
    if (!allowChange && selected.length > 0) return;
    if (multiple) {
      const next = selected.includes(optionId) ?
      selected.filter((id) => id !== optionId) :
      [...selected, optionId];
      onSelect(next);
    } else {
      onSelect(selected[0] === optionId ? [] : [optionId]);
    }
  };

  return (
    <motion.article
      key={question.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-label={`Question ${index + 1} of ${total}`}>
      
      <header className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">
          Question {index + 1}
          <span className="text-line-strong"> / {total}</span>
        </h2>
        <Badge tone="neutral">{questionTypeLabel[question.type]}</Badge>
        <Badge tone="muted">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </Badge>
        {question.negativeMarks > 0 && <Badge tone="muted">−{question.negativeMarks} if incorrect</Badge>}
        {marked &&
        <Badge tone="warning">
            <BookmarkIcon aria-hidden className="h-3 w-3" />
            Marked
          </Badge>
        }
      </header>

      <p className="mt-4 text-[19px] font-medium leading-snug tracking-[-0.01em] text-ink sm:text-xl">
        {question.prompt}
      </p>
      {multiple &&
      <p className="mt-2 text-[13px] text-muted">Select every option that applies.</p>
      }

      <div
        role={multiple ? 'group' : 'radiogroup'}
        aria-label="Answer options"
        className="mt-6 space-y-2.5">
        
        {question.options.map((option, optionIndex) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={active}
              onClick={() => toggle(option.id)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:py-4',
                active ?
                'border-primary bg-primary-soft shadow-raised' :
                'border-line bg-surface hover:border-line-strong hover:bg-surface-alt/60'
              )}>
              
              <span
                aria-hidden
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center border text-[13px] font-semibold transition-colors duration-150 ease-swift',
                  multiple ? 'rounded-md' : 'rounded-full',
                  active ?
                  'border-primary bg-primary text-white' :
                  'border-line-strong bg-surface text-muted'
                )}>
                
                {active ? <CheckIcon className="h-4 w-4" /> : letters[optionIndex] ?? optionIndex + 1}
              </span>
              <span className={cn('text-[15px] leading-relaxed', active ? 'font-medium text-ink' : 'text-ink')}>
                {option.text}
              </span>
            </button>);

        })}
      </div>
    </motion.article>);

}