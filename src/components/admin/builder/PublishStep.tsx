import React, { useState } from 'react';
import {
  AlertCircleIcon, ArchiveIcon, CheckIcon, CopyIcon,
  EyeIcon, EyeOffIcon, KeyIcon, RefreshCwIcon,
  ShieldCheckIcon, UploadCloudIcon
} from 'lucide-react';
import { toast } from 'sonner';
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

function CredentialField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-canvas p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <code className="flex-1 truncate font-mono text-[15px] font-bold tracking-wide text-ink">
          {secret && !revealed ? '••••••••••' : value}
        </code>
        <div className="flex shrink-0 items-center gap-1">
          {secret && (
            <button
              type="button"
              onClick={() => setRevealed(r => !r)}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
              title={revealed ? 'Hide' : 'Reveal'}
            >
              {revealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
            title="Copy to clipboard"
          >
            {copied
              ? <CheckIcon className="h-4 w-4 text-green-500" />
              : <CopyIcon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export function PublishStep({ draft, dirty, onSave }: PublishStepProps) {
  const { setExamStatus, duplicateExam, regenerateCredentials, updateExam } = useData();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'publish' | 'unpublish' | 'archive' | 'regen-password' | 'regen-all' | null>(null);

  const totalMarks = Number(draft.questions.reduce((sum, q) => sum + q.marks, 0).toFixed(2));

  const checks = [
    { label: 'Exam name provided', ok: draft.name.trim().length > 0 },
    { label: 'At least one question added', ok: draft.questions.length > 0 },
    { label: 'Every question has a correct answer', ok: draft.questions.every(q => q.type === 'short' || q.correctOptionIds.length > 0) },
    { label: 'Duration set', ok: draft.rules.durationMinutes > 0 },
    { label: 'Availability window valid', ok: new Date(draft.endAt).getTime() > new Date(draft.startAt).getTime() },
    { label: 'Credentials enabled for candidates', ok: draft.credentials.enabled },
    { label: 'No unsaved changes', ok: !dirty },
  ];

  const ready = checks.every(c => c.ok);

  const run = async (next: 'published' | 'draft' | 'archived') => {
    setBusy(true);
    if (dirty) await onSave();
    await setExamStatus(draft.id, next);
    setBusy(false);
    setConfirm(null);
  };

  const handleRegen = async (regenId: boolean) => {
    setBusy(true);
    const updated = await regenerateCredentials(draft.id, regenId);
    if (updated) {
      // Keep local draft credentials in sync
      updateExam(draft.id, { credentials: updated.credentials }, { silent: true });
    }
    setBusy(false);
    setConfirm(null);
  };

  const enableCredentials = () => {
    updateExam(draft.id, {
      credentials: { ...draft.credentials, enabled: true }
    }, { silent: true });
  };

  return (
    <div className="space-y-4">

      {/* ── Exam Credentials ─────────────────────────────────── */}
      <Panel>
        <PanelHeader
          title="Exam Credentials"
          description="Share these with candidates — they need both to enter the exam"
          action={
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              draft.credentials.enabled
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-surface-alt text-muted'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${draft.credentials.enabled ? 'bg-green-500' : 'bg-line-strong'}`} />
              {draft.credentials.enabled ? 'Active' : 'Disabled'}
            </span>
          }
        />
        <div className="space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <CredentialField label="Exam ID" value={draft.credentials.examId} />
            <CredentialField label="Exam Password" value={draft.credentials.password} secret />
          </div>

          {/* Copy-all button */}
          <button
            type="button"
            onClick={async () => {
              const text = `Exam ID: ${draft.credentials.examId}\nPassword: ${draft.credentials.password}`;
              try {
                await navigator.clipboard.writeText(text);
                toast.success('Credentials copied to clipboard');
              } catch {
                toast.error("Couldn't copy credentials");
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <KeyIcon className="h-4 w-4" />
            Copy both credentials
          </button>

          {/* Regen + enable buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setConfirm('regen-password')}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              New password
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirm('regen-all')}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              New Exam ID + Password
            </Button>
            {!draft.credentials.enabled && (
              <Button variant="primary" size="sm" onClick={enableCredentials}>
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Enable credentials
              </Button>
            )}
          </div>

          {!draft.credentials.enabled && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
              ⚠ Credentials are currently <strong>disabled</strong>. Candidates cannot enter the exam. Enable credentials above or in the Security step.
            </p>
          )}
        </div>
      </Panel>

      {/* ── Publication readiness ─────────────────────────────── */}
      <Panel>
        <PanelHeader
          title="Publication readiness"
          description="Everything below must pass before candidates can enter"
          action={<ExamStatusBadge status={draft.status} />}
        />
        <ul className="divide-y divide-line">
          {checks.map(check => (
            <li key={check.label} className="flex items-center gap-3 px-5 py-3">
              <span
                aria-hidden
                className={
                  check.ok
                    ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success-soft text-success'
                    : 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary-border bg-primary-soft text-primary'
                }
              >
                {check.ok ? <CheckIcon className="h-3 w-3" /> : <AlertCircleIcon className="h-3 w-3" />}
              </span>
              <p className="text-sm text-ink">{check.label}</p>
              <span className={check.ok ? 'ml-auto text-2xs font-semibold uppercase tracking-wide text-success' : 'ml-auto text-2xs font-semibold uppercase tracking-wide text-primary'}>
                {check.ok ? 'Ready' : 'Action needed'}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* ── Summary ──────────────────────────────────────────── */}
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
            ['Closes', formatDateTime(draft.endAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* ── Actions ──────────────────────────────────────────── */}
      <Panel>
        <PanelHeader title="Actions" description="Control availability for this examination" />
        <div className="flex flex-wrap gap-2 p-5">
          {draft.status === 'published' ? (
            <Button variant="secondary" loading={busy} onClick={() => setConfirm('unpublish')}>
              <UploadCloudIcon aria-hidden className="h-4 w-4" />
              Unpublish
            </Button>
          ) : (
            <Button variant="primary" disabled={!ready} loading={busy} onClick={() => setConfirm('publish')}>
              <UploadCloudIcon aria-hidden className="h-4 w-4" />
              Publish examination
            </Button>
          )}
          <Button variant="secondary" onClick={() => void duplicateExam(draft.id)}>
            <CopyIcon aria-hidden className="h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="danger" onClick={() => setConfirm('archive')}>
            <ArchiveIcon aria-hidden className="h-4 w-4" />
            Archive
          </Button>
        </div>
        {!ready && draft.status !== 'published' && (
          <p className="border-t border-line px-5 py-3.5 text-xs text-muted">
            Resolve the outstanding items above to enable publishing.
          </p>
        )}
      </Panel>

      {/* ── Dialogs ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirm === 'publish' || confirm === 'unpublish' || confirm === 'archive'}
        title={
          confirm === 'publish' ? 'Publish this examination?' :
          confirm === 'unpublish' ? 'Unpublish this examination?' :
          'Archive this examination?'
        }
        description={
          confirm === 'publish' ? 'Candidates holding the Exam ID and password will be able to start the examination inside its availability window.' :
          confirm === 'unpublish' ? 'New sessions will be blocked immediately. In-progress sessions continue until they are submitted.' :
          'The examination becomes read-only and is hidden from candidates. Results remain available for reporting.'
        }
        confirmLabel={confirm === 'publish' ? 'Publish' : confirm === 'unpublish' ? 'Unpublish' : 'Archive'}
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void run(confirm === 'publish' ? 'published' : confirm === 'unpublish' ? 'draft' : 'archived')}
      />

      <ConfirmDialog
        open={confirm === 'regen-password' || confirm === 'regen-all'}
        title={confirm === 'regen-all' ? 'Regenerate Exam ID & Password?' : 'Regenerate exam password?'}
        description={
          confirm === 'regen-all'
            ? 'Candidates holding the old Exam ID will no longer be able to enter. In-progress sessions are unaffected.'
            : 'The current password stops working immediately. In-progress sessions are unaffected.'
        }
        confirmLabel="Regenerate"
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void handleRegen(confirm === 'regen-all')}
      />
    </div>
  );
}