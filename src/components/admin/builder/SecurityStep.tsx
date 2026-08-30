import React, { useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, EyeIcon, EyeOffIcon, InfoIcon, RefreshCwIcon } from 'lucide-react';
import { Button, IconButton } from '../../ui/Button';
import { Panel, PanelHeader } from '../../ui/States';
import { Switch } from '../../ui/Switch';
import { ConfirmDialog } from '../../ui/Modal';
import { ExamStatusBadge } from '../../ui/Badge';
import { useData } from '../../../contexts/DataContext';
import type { Exam } from '../../../types';

interface StepProps {
  draft: Exam;
  update: (patch: Partial<Exam>) => void;
}

export function SecurityStep({ draft, update }: StepProps) {
  const { regenerateCredentials } = useData();
  const [reveal, setReveal] = useState(false);
  const [confirm, setConfirm] = useState<'password' | 'id' | null>(null);
  const [busy, setBusy] = useState(false);

  const security = draft.security;
  const setSecurity = <K extends keyof Exam['security'],>(key: K, value: Exam['security'][K]) =>
  update({ security: { ...security, [key]: value } });

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`We couldn't copy the ${label.toLowerCase()}.`);
    }
  };

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Exam credentials"
          description="Candidates need both values to enter the examination"
          action={<ExamStatusBadge status={draft.status} />} />
        
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface-alt/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Exam ID</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate font-mono text-[15px] font-semibold text-ink">{draft.credentials.examId}</p>
                <IconButton label="Copy exam ID" onClick={() => void copy('Exam ID', draft.credentials.examId)}>
                  <CopyIcon aria-hidden className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            <div className="rounded-lg border border-line bg-surface-alt/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Exam password</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate font-mono text-[15px] font-semibold text-ink">
                  {reveal ? draft.credentials.password : '••••••••••••'}
                </p>
                <span className="flex shrink-0 items-center">
                  <IconButton label={reveal ? 'Hide password' : 'Reveal password'} onClick={() => setReveal((r) => !r)}>
                    {reveal ? <EyeOffIcon aria-hidden className="h-4 w-4" /> : <EyeIcon aria-hidden className="h-4 w-4" />}
                  </IconButton>
                  <IconButton label="Copy exam password" onClick={() => void copy('Password', draft.credentials.password)}>
                    <CopyIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setConfirm('password')}>
              <RefreshCwIcon aria-hidden className="h-4 w-4" />
              Regenerate password
            </Button>
            <Button variant="secondary" onClick={() => setConfirm('id')}>
              <RefreshCwIcon aria-hidden className="h-4 w-4" />
              Regenerate exam ID
            </Button>
          </div>

          <div className="divide-y divide-line border-t border-line">
            <Switch
              label="Credentials enabled"
              description="Disable to block all new sessions without unpublishing the examination."
              checked={draft.credentials.enabled}
              onChange={(value) => update({ credentials: { ...draft.credentials, enabled: value } })} />
            
          </div>

          <p className="flex gap-2.5 rounded-lg border border-line bg-surface-alt/50 p-3.5 text-xs leading-relaxed text-muted">
            <InfoIcon aria-hidden className="mt-px h-4 w-4 shrink-0" />
            Passwords are stored hashed and never displayed unless explicitly revealed. The Exam ID and password
            authorise a session — they are not the only security layer, as every request is also authorised and
            rate-limited server-side.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Controlled exam mode" description="Browser-level deterrents applied during the session" />
        <div className="divide-y divide-line px-5">
          <Switch
            label="Disable copying"
            description="Blocks copy and cut inside the examination workspace."
            checked={security.blockCopy}
            onChange={(value) => setSecurity('blockCopy', value)} />
          
          <Switch
            label="Disable pasting"
            checked={security.blockPaste}
            onChange={(value) => setSecurity('blockPaste', value)} />
          
          <Switch
            label="Disable text selection"
            checked={security.blockSelection}
            onChange={(value) => setSecurity('blockSelection', value)} />
          
          <Switch
            label="Disable the right-click menu"
            checked={security.blockContextMenu}
            onChange={(value) => setSecurity('blockContextMenu', value)} />
          
          <Switch
            label="Warn before leaving the exam"
            description="Prompts the candidate if they try to close or reload the tab."
            checked={security.lockNavigation}
            onChange={(value) => setSecurity('lockNavigation', value)} />
          
        </div>
        <p className="border-t border-line px-5 py-4 text-xs leading-relaxed text-muted">
          These restrictions are deterrents, not guarantees — they can be bypassed by a determined candidate.
          Authorisation, session timing, answer persistence, grading, and duplicate-submission prevention are all
          enforced server-side.
        </p>
      </Panel>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'id' ? 'Regenerate the exam ID?' : 'Regenerate the exam password?'}
        description={
        confirm === 'id' ?
        'Candidates holding the old Exam ID will no longer be able to enter. Any in-progress sessions continue uninterrupted.' :
        'The current password stops working immediately. Any in-progress sessions continue uninterrupted.'
        }
        confirmLabel="Regenerate"
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          setBusy(true);
          const updated = await regenerateCredentials(draft.id, confirm === 'id');
          if (updated) update({ credentials: updated.credentials });
          setBusy(false);
          setConfirm(null);
          setReveal(false);
        }} />
      
    </div>);

}