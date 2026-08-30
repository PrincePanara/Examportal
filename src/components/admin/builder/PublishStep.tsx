import React, { useState } from 'react';
import { AlertCircleIcon, ArchiveIcon, CheckIcon, CopyIcon, UploadCloudIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Panel, PanelHeader } from '../../ui/States';
import { ExamStatusBadge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/Modal';
import { useData } from '../../../contexts/DataContext';
import type { Exam } from '../../../types';
import { formatDateTime } from '../../../utils/format';

interface PublishStepProps {
  draft: Exam;
  dirty: boolean;
  onSave: () => Promise<void>;
}

export function PublishStep({ draft, dirty, onSave }: PublishStepProps) {
  const { setExamStatus, duplicateExam } = useData();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'publish' | 'unpublish' | 'archive' | null>(null);

  const totalMarks = Number(draft.questions.reduce((sum, question) => sum + question.marks, 0).toFixed(2));

  const checks = [
  { label: 'Exam name provided', ok: draft.name.trim().length > 0 },
  { label: 'At least one question added', ok: draft.questions.length > 0 },
  { label: 'Every question has a correct answer', ok: draft.questions.every((q) => q.type === 'short' || q.correctOptionIds.length > 0) },
  { label: 'Duration set', ok: draft.rules.durationMinutes > 0 },
  { label: 'Availability window valid', ok: new Date(draft.endAt).getTime() > new Date(draft.startAt).getTime() },
  { label: 'Credentials enabled for candidates', ok: draft.credentials.enabled },
  { label: 'No unsaved changes', ok: !dirty }];

  const ready = checks.every((check) => check.ok);

  const run = async (next: 'published' | 'draft' | 'archived') => {
    setBusy(true);
    if (dirty) await onSave();
    await setExamStatus(draft.id, next);
    setBusy(false);
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Publication readiness"
          description="Everything below must pass before candidates can enter"
          action={<ExamStatusBadge status={draft.status} />} />
        
        <ul className="divide-y divide-line">
          {checks.map((check) =>
          <li key={check.label} className="flex items-center gap-3 px-5 py-3">
              <span
              aria-hidden
              className={
              check.ok ?
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success-soft text-success' :
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary-border bg-primary-soft text-primary'
              }>
              
                {check.ok ? <CheckIcon className="h-3 w-3" /> : <AlertCircleIcon className="h-3 w-3" />}
              </span>
              <p className="text-sm text-ink">{check.label}</p>
              <span className={check.ok ? 'ml-auto text-2xs font-semibold uppercase tracking-wide text-success' : 'ml-auto text-2xs font-semibold uppercase tracking-wide text-primary'}>
                {check.ok ? 'Ready' : 'Action needed'}
              </span>
            </li>
          )}
        </ul>
      </Panel>

      <Panel>
        <PanelHeader title="Summary" description="What candidates will receive" />
        <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
          ['Exam ID', draft.credentials.examId],
          ['Questions', `${draft.questions.length}`],
          ['Total marks', `${totalMarks}`],
          ['Duration', `${draft.rules.durationMinutes} minutes`],
          ['Passing score', `${draft.rules.passingScore}%`],
          ['Attempts', `${draft.rules.attempts}`],
          ['Negative marking', draft.rules.negativeMarking ? 'Enabled' : 'Disabled'],
          ['Result visibility', draft.rules.showResultImmediately ? 'Immediate' : 'Published by admin'],
          ['Opens', formatDateTime(draft.startAt)],
          ['Closes', formatDateTime(draft.endAt)]].
          map(([label, value]) =>
          <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
            </div>
          )}
        </dl>
      </Panel>

      <Panel>
        <PanelHeader title="Actions" description="Control availability for this examination" />
        <div className="flex flex-wrap gap-2 p-5">
          {draft.status === 'published' ?
          <Button variant="secondary" loading={busy} onClick={() => setConfirm('unpublish')}>
              <UploadCloudIcon aria-hidden className="h-4 w-4" />
              Unpublish
            </Button> :

          <Button variant="primary" disabled={!ready} loading={busy} onClick={() => setConfirm('publish')}>
              <UploadCloudIcon aria-hidden className="h-4 w-4" />
              Publish examination
            </Button>
          }
          <Button variant="secondary" onClick={() => void duplicateExam(draft.id)}>
            <CopyIcon aria-hidden className="h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="danger" onClick={() => setConfirm('archive')}>
            <ArchiveIcon aria-hidden className="h-4 w-4" />
            Archive
          </Button>
        </div>
        {!ready && draft.status !== 'published' &&
        <p className="border-t border-line px-5 py-3.5 text-xs text-muted">
            Resolve the outstanding items above to enable publishing.
          </p>
        }
      </Panel>

      <ConfirmDialog
        open={confirm !== null}
        title={
        confirm === 'publish' ?
        'Publish this examination?' :
        confirm === 'unpublish' ?
        'Unpublish this examination?' :
        'Archive this examination?'
        }
        description={
        confirm === 'publish' ?
        'Candidates holding the Exam ID and password will be able to start the examination inside its availability window.' :
        confirm === 'unpublish' ?
        'New sessions will be blocked immediately. In-progress sessions continue until they are submitted.' :
        'The examination becomes read-only and is hidden from candidates. Results remain available for reporting.'
        }
        confirmLabel={confirm === 'publish' ? 'Publish' : confirm === 'unpublish' ? 'Unpublish' : 'Archive'}
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void run(confirm === 'publish' ? 'published' : confirm === 'unpublish' ? 'draft' : 'archived')} />
      
    </div>);

}