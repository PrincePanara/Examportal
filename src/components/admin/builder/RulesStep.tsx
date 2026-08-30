import React from 'react';
import { Field, TextInput } from '../../ui/Field';
import { Panel, PanelHeader } from '../../ui/States';
import { SegmentedControl, Switch } from '../../ui/Switch';
import type { Exam } from '../../../types';

interface StepProps {
  draft: Exam;
  update: (patch: Partial<Exam>) => void;
}

export function RulesStep({ draft, update }: StepProps) {
  const rules = draft.rules;
  const setRule = <K extends keyof Exam['rules'],>(key: K, value: Exam['rules'][K]) =>
  update({ rules: { ...rules, [key]: value } });

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader title="General" description="Timing, attempts, and question order" />
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Duration (minutes)">
              {({ id }) =>
              <TextInput
                id={id}
                type="number"
                min={1}
                value={rules.durationMinutes}
                onChange={(event) => setRule('durationMinutes', Math.max(1, Number(event.target.value) || 1))} />

              }
            </Field>
            <Field label="Attempts allowed">
              {({ id }) =>
              <TextInput
                id={id}
                type="number"
                min={1}
                value={rules.attempts}
                onChange={(event) => setRule('attempts', Math.max(1, Number(event.target.value) || 1))} />

              }
            </Field>
            <Field label="Passing score (%)">
              {({ id }) =>
              <TextInput
                id={id}
                type="number"
                min={1}
                max={100}
                value={rules.passingScore}
                onChange={(event) =>
                setRule('passingScore', Math.min(100, Math.max(1, Number(event.target.value) || 1)))
                } />

              }
            </Field>
          </div>
          <div className="mt-2 divide-y divide-line border-t border-line">
            <Switch
              label="Randomise question order"
              description="Each candidate receives the questions in a different order."
              checked={rules.randomizeQuestions}
              onChange={(value) => setRule('randomizeQuestions', value)} />
            
            <Switch
              label="Randomise option order"
              description="Shuffles the answer options within every question."
              checked={rules.randomizeOptions}
              onChange={(value) => setRule('randomizeOptions', value)} />
            
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Marking" description="How answers are scored on the server" />
        <div className="divide-y divide-line px-5">
          <Switch
            label="Negative marking"
            description="Deduct the per-question negative marks for an incorrect answer."
            checked={rules.negativeMarking}
            onChange={(value) => setRule('negativeMarking', value)} />
          
          <Switch
            label="Partial marking for multiple-answer questions"
            description="Award proportional marks when some — but not all — correct options are selected."
            checked={rules.partialMarking}
            onChange={(value) => setRule('partialMarking', value)} />
          
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Navigation" description="What candidates can do while the timer runs" />
        <div className="divide-y divide-line px-5">
          <Switch
            label="Allow previous question"
            description="Candidates can move backwards through the paper."
            checked={rules.allowPrevious}
            onChange={(value) => setRule('allowPrevious', value)} />
          
          <Switch
            label="Allow marking for review"
            checked={rules.allowReview}
            description="Adds the mark-for-review control and highlights those questions in the navigator."
            onChange={(value) => setRule('allowReview', value)} />
          
          <Switch
            label="Allow changing answers"
            description="Once disabled, a selected answer is final."
            checked={rules.allowChangeAnswers}
            onChange={(value) => setRule('allowChangeAnswers', value)} />
          
          <Switch
            label="Allow jumping between questions"
            description="Enables direct navigation from the question navigator."
            checked={rules.allowJump}
            onChange={(value) => setRule('allowJump', value)} />
          
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Submission" description="How and when the session is closed" />
        <div className="divide-y divide-line px-5">
          <Switch
            label="Manual submission"
            description="Candidates can submit before the timer expires."
            checked={rules.manualSubmit}
            onChange={(value) => setRule('manualSubmit', value)} />
          
          <Switch
            label="Automatic submission on timeout"
            description="The server closes the session and grades it when the issued expiry time is reached."
            checked={rules.autoSubmitOnTimeout}
            onChange={(value) => setRule('autoSubmitOnTimeout', value)} />
          
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-ink">Result visibility</p>
              <p className="mt-0.5 text-xs text-muted">Choose whether candidates see their score immediately.</p>
            </div>
            <SegmentedControl
              label="Result visibility"
              value={rules.showResultImmediately ? 'immediate' : 'admin'}
              onChange={(value) => setRule('showResultImmediately', value === 'immediate')}
              options={[
              { value: 'immediate', label: 'Show immediately' },
              { value: 'admin', label: 'Publish later' }]
              } />
            
          </div>
        </div>
      </Panel>
    </div>);

}