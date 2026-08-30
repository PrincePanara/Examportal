import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface SubmitDialogProps {
  open: boolean;
  answered: number;
  marked: number;
  unanswered: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitDialog({
  open,
  answered,
  marked,
  unanswered,
  loading,
  onCancel,
  onConfirm
}: SubmitDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Submit examination?"
      description="Once submitted, you cannot change your answers."
      size="sm"
      dismissible={!loading}
      footer={
      <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Continue exam
          </Button>
          <Button variant="primary" loading={loading} onClick={onConfirm}>
            Submit exam
          </Button>
        </>
      }>
      
      <dl className="divide-y divide-line overflow-hidden rounded-lg border border-line">
        {[
        { label: 'Answered', value: answered },
        { label: 'Marked for review', value: marked },
        { label: 'Not answered', value: unanswered }].
        map((row) =>
        <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="tabular text-sm font-semibold text-ink">{row.value}</dd>
          </div>
        )}
      </dl>
      {unanswered > 0 &&
      <p className="mt-3 rounded-lg border border-warning/30 bg-warning-soft px-3.5 py-2.5 text-[13px] font-medium text-warning">
          {unanswered} {unanswered === 1 ? 'question is' : 'questions are'} still unanswered.
        </p>
      }
    </Modal>);

}