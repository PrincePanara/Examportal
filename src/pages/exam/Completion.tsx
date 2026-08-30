import React from 'react';
import { CheckCircle2Icon, ClockIcon, InfoIcon } from 'lucide-react';
import { Wordmark } from '../../components/Brand';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/States';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { formatDateTime } from '../../utils/format';

export function Completion({ onExit, exitLabel = 'Return to portal' }: {onExit?: () => void;exitLabel?: string;}) {
  const { receipt, reset, session } = useExamSession();

  if (!receipt) return null;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <Wordmark subtitle="Exam portal" />
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12 sm:px-8">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-success/25 bg-success-soft text-success">
            <CheckCircle2Icon aria-hidden className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink">Examination submitted</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {session?.exam.name} has been submitted successfully. Thank you.
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ClockIcon aria-hidden className="h-3.5 w-3.5" />
            {formatDateTime(receipt.submittedAt)}
          </p>
        </div>

        <Panel className="mt-7 overflow-hidden">
          <dl className="divide-y divide-line">
            {[
            { label: 'Answered', value: receipt.answered },
            { label: 'Marked for review', value: receipt.marked },
            { label: 'Not answered', value: receipt.unanswered }].
            map((row) =>
            <div key={row.label} className="flex items-center justify-between px-5 py-3">
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="tabular text-sm font-semibold text-ink">{row.value}</dd>
              </div>
            )}
          </dl>
        </Panel>

        {receipt.resultVisible && receipt.percentage !== null ?
        <Panel className="mt-4 p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Your result</p>
            <p className="tabular mt-3 text-[44px] font-semibold leading-none tracking-[-0.04em] text-ink">
              {receipt.percentage}%
            </p>
            <p className="tabular mt-2 text-sm text-muted">
              {receipt.score} of {receipt.totalMarks} marks
            </p>
            <p
            className={
            receipt.passed ?
            'mt-4 inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success-soft px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-success' :
            'mt-4 inline-flex items-center gap-1.5 rounded-md border border-primary-border bg-primary-soft px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-primary-dark'
            }>
            
              {receipt.passed ? 'Passed' : 'Not passed'}
            </p>
          </Panel> :

        <div className="mt-4 flex gap-2.5 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-muted shadow-card">
            <InfoIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            Your result will be published by the administrator.
          </div>
        }

        <div className="mt-7 flex justify-center">
          <Button variant="primary" size="lg" onClick={onExit ?? reset}>
            {exitLabel}
          </Button>
        </div>
      </main>
    </div>);

}