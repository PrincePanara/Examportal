import React, { useCallback, useEffect, useState } from 'react';
import { CheckIcon, ClockIcon, FileTextIcon, LockIcon, TargetIcon } from 'lucide-react';
import { Wordmark } from '../../components/Brand';
import { Button } from '../../components/ui/Button';
import { ErrorState, Panel, Skeleton } from '../../components/ui/States';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { api, ApiError } from '../../services/examApi';

type Brief = Awaited<ReturnType<typeof api.examBrief>>;

export function Instructions() {
  const { authorizedExamId, startSession, isStarting, reset } = useExamSession();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const load = useCallback(async () => {
    if (!authorizedExamId) return;
    setError(null);
    setBrief(null);
    try {
      setBrief(await api.examBrief(authorizedExamId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not load the examination details.');
    }
  }, [authorizedExamId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <Wordmark subtitle="Exam portal" />
        <Button variant="ghost" size="sm" onClick={reset}>
          Exit
        </Button>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
        {error ?
        <Panel>
            <ErrorState description={error} onRetry={() => void load()} />
          </Panel> :
        !brief ?
        <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div> :

        <>
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">{brief.name}</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{brief.description}</p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
            { label: 'Duration', value: `${brief.durationMinutes} minutes`, icon: ClockIcon },
            { label: 'Questions', value: `${brief.questionCount}`, icon: FileTextIcon },
            { label: 'Total marks', value: `${brief.totalMarks}`, icon: TargetIcon }].
            map((item) =>
            <div key={item.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                    <item.icon aria-hidden className="h-3.5 w-3.5" />
                    {item.label}
                  </dt>
                  <dd className="tabular mt-2 text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">
                    {item.value}
                  </dd>
                </div>
            )}
            </dl>

            <Panel className="mt-5 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-ink">Before you begin</h2>
              <ul className="mt-3 space-y-2.5">
                {[
              'Read every question carefully before answering.',
              'Your answers are saved automatically as you go.',
              brief.allowReview ?
              'You can mark questions for review and return to them at any time.' :
              'Questions are presented in a fixed order and cannot be revisited.',
              brief.autoSubmitOnTimeout ?
              'The examination will submit automatically when the timer reaches zero.' :
              'You must submit manually before the timer reaches zero.',
              brief.showResultImmediately ?
              `Your result is shown immediately after submission. Passing score is ${brief.passingScore}%.` :
              'Your result will be published by the administrator after review.'].
              map((line) =>
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                    <CheckIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {line}
                  </li>
              )}
              </ul>

              <p className="mt-5 border-t border-line pt-5 text-sm leading-relaxed text-muted">{brief.instructions}</p>
            </Panel>

            <Panel className="mt-4 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <LockIcon aria-hidden className="h-4 w-4 text-primary" />
                Controlled examination environment
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                This session restricts a small number of browser actions to keep the assessment fair. Exam
                authorisation, timing, and submission are validated on our servers.
              </p>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
              ['Copying', brief.security.blockCopy],
              ['Pasting', brief.security.blockPaste],
              ['Text selection', brief.security.blockSelection],
              ['Right-click menu', brief.security.blockContextMenu]].
              map(([label, blocked]) =>
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-lg border border-line bg-surface-alt/50 px-3.5 py-2.5">
                
                    <dt className="text-[13px] text-ink">{label}</dt>
                    <dd className={blocked ? 'text-xs font-semibold uppercase text-primary' : 'text-xs font-semibold uppercase text-muted'}>
                      {blocked ? 'Disabled' : 'Allowed'}
                    </dd>
                  </div>
              )}
              </dl>
            </Panel>

            <div className="mt-5 rounded-xl border border-line bg-surface p-5 shadow-card">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong text-primary focus:ring-primary/40" />
              
                <span className="text-sm leading-relaxed text-ink">
                  I have read and understood the instructions and the rules of this controlled examination.
                </span>
              </label>
              <Button
              variant="primary"
              size="lg"
              className="mt-5 w-full sm:w-auto"
              disabled={!acknowledged}
              loading={isStarting}
              onClick={() => void startSession()}>
              
                {isStarting ? 'Starting examination' : 'Start examination'}
              </Button>
              {!acknowledged &&
            <p className="mt-2.5 text-xs text-muted">Acknowledge the instructions to enable the start button.</p>
            }
            </div>
          </>
        }
      </main>
    </div>);

}