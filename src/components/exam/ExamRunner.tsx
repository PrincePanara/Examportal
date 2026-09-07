import React, { useCallback, useMemo, useState } from 'react';
import { AlertTriangleIcon, BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, SendIcon } from 'lucide-react';
import { ExamHeader } from './ExamHeader';
import { QuestionCard } from './QuestionCard';
import { QuestionNavigator } from './QuestionNavigator';
import { SubmitDialog } from './SubmitDialog';
import { Button } from '../ui/Button';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { useCountdown } from '../../hooks/useCountdown';
import { useExamLockdown } from '../../hooks/useExamLockdown';
import { cn } from '../../utils/format';

export function ExamRunner() {
  const {
    session,
    answers,
    marked,
    currentIndex,
    saveState,
    isPreview,
    isSubmitting,
    selectAnswer,
    toggleMark,
    goToIndex,
    submit
  } = useExamSession();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const exam = session?.exam ?? null;
  const questions = exam?.questions ?? [];
  const question = questions[currentIndex];

  const onExpire = useCallback(() => {
    if (!session) return;
    if (exam?.rules.autoSubmitOnTimeout) {
      setConfirmOpen(false);
      void submit('timeout');
    }
  }, [session, exam, submit]);

  const secondsLeft = useCountdown(session?.expiresAt ?? null, onExpire);
  useExamLockdown(exam?.security ?? null, Boolean(session) && !isPreview);

  React.useEffect(() => {
    // Push dummy state to intercept first Back navigation
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isPreview) return;
      void submit('manual');
    };

    const handleBeforeUnload = () => {
      if (isPreview) return;
      void submit('manual');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPreview, submit]);

  const counts = useMemo(() => {
    const answered = questions.filter((q) => (answers[q.id] ?? []).length > 0).length;
    return { answered, unanswered: questions.length - answered, marked: marked.length };
  }, [questions, answers, marked]);

  if (!session || !exam || !question) return null;

  const rules = exam.rules;
  const timeUp = secondsLeft === 0;
  const locked = timeUp || isSubmitting;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ExamHeader
        examName={exam.name}
        candidateName={session.candidateName}
        questionIndex={currentIndex}
        questionTotal={questions.length}
        answeredCount={counts.answered}
        secondsLeft={secondsLeft}
        totalSeconds={rules.durationMinutes * 60}
        saveState={saveState}
        secure={exam.security.blockCopy || exam.security.blockPaste || exam.security.blockSelection}
        previewBanner={isPreview} />
      

      {saveState === 'offline' &&
      <div
        role="status"
        className="border-b border-warning/30 bg-warning-soft px-4 py-2.5 text-center text-[13px] font-medium text-warning sm:px-6">
        
          <AlertTriangleIcon aria-hidden className="mr-1.5 inline h-4 w-4 align-[-2px]" />
          Connection interrupted. Your current answer is retained on this device and we’ll retry automatically.
        </div>
      }

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="order-2 space-y-4 lg:order-1">
            <div
              className={cn(
                'rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7',
                locked && 'pointer-events-none opacity-60'
              )}
              aria-disabled={locked || undefined}>
              
              <QuestionCard
                question={question}
                index={currentIndex}
                total={questions.length}
                selected={answers[question.id] ?? []}
                marked={marked.includes(question.id)}
                allowChange={rules.allowChangeAnswers}
                onSelect={(optionIds) => selectAnswer(question.id, optionIds)} />
              
            </div>

            <div className="hidden items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-card lg:flex">
              <Button
                variant={marked.includes(question.id) ? 'soft' : 'secondary'}
                onClick={() => toggleMark(question.id)}
                disabled={locked || !rules.allowReview}>
                
                <BookmarkIcon aria-hidden className="h-4 w-4" />
                {marked.includes(question.id) ? 'Unmark' : 'Mark for review'}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => goToIndex(Math.max(0, currentIndex - 1))}
                  disabled={locked || currentIndex === 0 || !rules.allowPrevious}>
                  
                  <ChevronLeftIcon aria-hidden className="h-4 w-4" />
                  Previous
                </Button>
                {isLast ?
                <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={locked}>
                    <SendIcon aria-hidden className="h-4 w-4" />
                    Submit exam
                  </Button> :

                <Button variant="primary" onClick={() => goToIndex(currentIndex + 1)} disabled={locked}>
                    Save &amp; next
                    <ChevronRightIcon aria-hidden className="h-4 w-4" />
                  </Button>
                }
              </div>
            </div>
          </div>

          <div className="order-1 space-y-4 lg:order-2">
            <QuestionNavigator
              questions={questions}
              answers={answers}
              marked={marked}
              currentIndex={currentIndex}
              allowJump={rules.allowJump && !locked}
              onJump={goToIndex} />
            

            <section
              aria-label="Secure exam mode"
              className="hidden rounded-xl border border-line bg-surface p-4 shadow-card lg:block">
              
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                Secure exam mode
              </h2>
              <dl className="space-y-1.5 text-xs">
                {[
                ['Copy', exam.security.blockCopy],
                ['Paste', exam.security.blockPaste],
                ['Text selection', exam.security.blockSelection],
                ['Context menu', exam.security.blockContextMenu]].
                map(([label, blocked]) =>
                <div key={String(label)} className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className={blocked ? 'font-semibold text-primary' : 'text-muted'}>
                      {blocked ? 'Disabled' : 'Allowed'}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
                Timing, authorisation, and submission are validated on the server.
              </p>
            </section>

            {rules.manualSubmit &&
            <Button
              variant="secondary"
              fullWidth
              className="hidden lg:flex"
              onClick={() => setConfirmOpen(true)}
              disabled={locked}>
              
                <SendIcon aria-hidden className="h-4 w-4" />
                Submit examination
              </Button>
            }
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant={marked.includes(question.id) ? 'soft' : 'secondary'}
            onClick={() => toggleMark(question.id)}
            disabled={locked || !rules.allowReview}
            className="h-11 px-3"
            aria-label="Mark for review">
            
            <BookmarkIcon aria-hidden className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToIndex(Math.max(0, currentIndex - 1))}
            disabled={locked || currentIndex === 0 || !rules.allowPrevious}
            className="h-11 flex-1">
            
            <ChevronLeftIcon aria-hidden className="h-4 w-4" />
            Previous
          </Button>
          {isLast ?
          <Button variant="primary" className="h-11 flex-1" onClick={() => setConfirmOpen(true)} disabled={locked}>
              Submit
            </Button> :

          <Button
            variant="primary"
            className="h-11 flex-1"
            onClick={() => goToIndex(currentIndex + 1)}
            disabled={locked}>
            
              Save &amp; next
              <ChevronRightIcon aria-hidden className="h-4 w-4" />
            </Button>
          }
        </div>
      </div>

      <SubmitDialog
        open={confirmOpen}
        answered={counts.answered}
        marked={counts.marked}
        unanswered={counts.unanswered}
        loading={isSubmitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void submit('manual')} />
      
    </div>);

}