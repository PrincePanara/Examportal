import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, SaveIcon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { ExamStatusBadge } from '../../components/ui/Badge';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { Stepper, builderSteps, type BuilderStepId } from '../../components/admin/builder/Stepper';
import { DetailsStep } from '../../components/admin/builder/DetailsStep';
import { QuestionsStep } from '../../components/admin/builder/QuestionsStep';
import { RulesStep } from '../../components/admin/builder/RulesStep';
import { SecurityStep } from '../../components/admin/builder/SecurityStep';
import { PreviewStep } from '../../components/admin/builder/PreviewStep';
import { PublishStep } from '../../components/admin/builder/PublishStep';
import { useData } from '../../contexts/DataContext';
import type { Exam } from '../../types';

export function ExamBuilder() {
  const { examId } = useParams<{examId: string;}>();
  const navigate = useNavigate();
  const { exams, loading, loadError, reload, updateExam } = useData();

  const exam = exams.find((item) => item.id === examId);
  const [draft, setDraft] = useState<Exam | null>(exam ?? null);
  const [step, setStep] = useState<BuilderStepId>('details');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!exam) return;
    setDraft((current) =>
    current && current.id === exam.id ? { ...current, status: exam.status } : JSON.parse(JSON.stringify(exam))
    );
  }, [exam]);

  const dirty = useMemo(() => {
    if (!exam || !draft) return false;
    return JSON.stringify(exam) !== JSON.stringify(draft);
  }, [exam, draft]);

  const update = useCallback((patch: Partial<Exam>) => {
    setDraft((current) => current ? { ...current, ...patch } : current);
  }, []);

  const save = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    await updateExam(draft.id, draft);
    setSaving(false);
  }, [draft, updateExam]);

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  if (loading && !draft) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 lg:grid-cols-[210px_1fr]">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>);

  }

  if (!exam || !draft) {
    return (
      <ErrorState
        title="Examination not found"
        description="This examination may have been deleted. Return to the exams list to continue."
        onRetry={() => navigate('/admin/exams')} />);


  }

  const completed: BuilderStepId[] = [
  ...(draft.name.trim() ? ['details'] as BuilderStepId[] : []),
  ...(draft.questions.length > 0 ? ['questions', 'preview'] as BuilderStepId[] : []),
  ...(['rules'] as BuilderStepId[]),
  ...(draft.credentials.enabled ? ['security'] as BuilderStepId[] : []),
  ...(draft.status === 'published' ? ['publish'] as BuilderStepId[] : [])];


  const stepIndex = builderSteps.findIndex((item) => item.id === step);

  return (
    <>
      <PageHeader
        title={draft.name.trim() || 'Untitled examination'}
        description={`Exam ID ${draft.credentials.examId} · ${draft.questions.length} questions · ${draft.rules.durationMinutes} minutes`}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Exams', to: '/admin/exams' }, { label: 'Builder' }]}
        eyebrow={
        <div className="mb-2 flex items-center gap-2">
            <ExamStatusBadge status={draft.status} />
            {dirty && <span className="text-xs font-medium text-warning">Unsaved changes</span>}
          </div>
        }
        actions={
        <>
            <Link to={`/admin/preview/${draft.id}`} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <ExternalLinkIcon aria-hidden className="h-4 w-4" />
                Student preview
              </Button>
            </Link>
            <Button variant="primary" disabled={!dirty} loading={saving} onClick={() => void save()}>
              <SaveIcon aria-hidden className="h-4 w-4" />
              Save changes
            </Button>
          </>
        } />
      

      <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-2 shadow-card">
            <Stepper current={step} onSelect={setStep} completed={completed} />
          </div>
        </div>

        <div className="min-w-0">
          {step === 'details' && <DetailsStep draft={draft} update={update} />}
          {step === 'questions' && <QuestionsStep draft={draft} update={update} />}
          {step === 'rules' && <RulesStep draft={draft} update={update} />}
          {step === 'security' && <SecurityStep draft={draft} update={update} />}
          {step === 'preview' && <PreviewStep draft={draft} />}
          {step === 'publish' && <PublishStep draft={draft} dirty={dirty} onSave={save} />}

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-card">
            <Button
              variant="secondary"
              disabled={stepIndex === 0}
              onClick={() => setStep(builderSteps[Math.max(0, stepIndex - 1)].id)}>
              
              <ChevronLeftIcon aria-hidden className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {dirty &&
              <Button variant="ghost" loading={saving} onClick={() => void save()}>
                  Save
                </Button>
              }
              <Button
                variant="primary"
                disabled={stepIndex === builderSteps.length - 1}
                onClick={() => setStep(builderSteps[Math.min(builderSteps.length - 1, stepIndex + 1)].id)}>
                
                Continue
                <ChevronRightIcon aria-hidden className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>);

}