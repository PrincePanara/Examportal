import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, EyeIcon, LockIcon, TimerIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { EmptyState, Panel, PanelHeader } from '../../ui/States';
import { DifficultyBadge, QuestionTypeBadge } from '../../ui/Badge';
import { QuestionCard } from '../../exam/QuestionCard';
import type { Exam } from '../../../types';
import { formatClock } from '../../../utils/format';

interface PreviewStepProps {
  draft: Exam;
}

export function PreviewStep({ draft }: PreviewStepProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const questions = draft.questions;
  const question = questions[index];

  if (questions.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={EyeIcon}
          title="Nothing to preview yet"
          description="Add at least one question to see exactly what candidates will experience." />
        
      </Panel>);

  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={index === 0}
            onClick={() => setIndex((current) => Math.max(0, current - 1))}>
            
            <ChevronLeftIcon aria-hidden className="h-4 w-4" />
            Previous
          </Button>
          <span className="tabular text-[13px] font-medium text-muted">
            Question {index + 1} of {questions.length}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={index === questions.length - 1}
            onClick={() => setIndex((current) => Math.min(questions.length - 1, current + 1))}>
            
            Next
            <ChevronRightIcon aria-hidden className="h-4 w-4" />
          </Button>
        </div>
        <Link to={`/admin/preview/${draft.id}`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="primary">
            <ExternalLinkIcon aria-hidden className="h-4 w-4" />
            Launch full student preview
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Edit mode" description="Authoring view with the correct answer revealed" />
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-1.5">
              <QuestionTypeBadge type={question.type} />
              <DifficultyBadge difficulty={question.difficulty} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Question</p>
              <p className="mt-1.5 rounded-lg border border-line bg-surface-alt/50 px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                {question.prompt}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Options</p>
              <ul className="mt-1.5 space-y-1.5">
                {question.options.map((option, optionIndex) => {
                  const correct = question.correctOptionIds.includes(option.id);
                  return (
                    <li
                      key={option.id}
                      className={
                      correct ?
                      'flex items-center gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3.5 py-2.5 text-sm font-medium text-success' :
                      'flex items-center gap-2.5 rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink'
                      }>
                      
                      <span className="tabular w-4 shrink-0 text-xs font-semibold text-muted">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      {option.text}
                    </li>);

                })}
              </ul>
            </div>
            <dl className="grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Marks</dt>
                <dd className="tabular mt-1 font-semibold text-ink">{question.marks}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Negative</dt>
                <dd className="tabular mt-1 font-semibold text-ink">
                  {question.negativeMarks > 0 ? `−${question.negativeMarks}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Category</dt>
                <dd className="mt-1 font-semibold text-ink">{question.category}</dd>
              </div>
            </dl>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader title="Student preview" description="Exactly what the candidate sees" />
          <div className="border-b border-line bg-surface-alt/50 px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 rounded-md border border-primary-border bg-primary-soft px-2 py-1 text-2xs font-bold uppercase tracking-wide text-primary-dark">
                <LockIcon aria-hidden className="h-3 w-3" />
                Secure mode
              </span>
              <span className="tabular text-[13px] font-medium text-muted">
                Question {index + 1} / {questions.length}
              </span>
              <span className="tabular flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink">
                <TimerIcon aria-hidden className="h-3.5 w-3.5" />
                {formatClock(draft.rules.durationMinutes * 60)}
              </span>
            </div>
          </div>
          <div className="p-5">
            <QuestionCard
              question={question}
              index={index}
              total={questions.length}
              selected={answers[question.id] ?? []}
              marked={false}
              allowChange
              onSelect={(optionIds) => setAnswers((current) => ({ ...current, [question.id]: optionIds }))} />
            
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-alt/40 p-3">
            <Button
              size="sm"
              variant="secondary"
              disabled={index === 0 || !draft.rules.allowPrevious}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}>
              
              Previous
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={index === questions.length - 1}
              onClick={() => setIndex((current) => Math.min(questions.length - 1, current + 1))}>
              
              Save &amp; next
            </Button>
          </div>
        </Panel>
      </div>
    </div>);

}