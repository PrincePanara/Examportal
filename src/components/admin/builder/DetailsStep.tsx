import React from 'react';
import { Field, Select, TextArea, TextInput } from '../../ui/Field';
import { Panel, PanelHeader } from '../../ui/States';
import { questionCategories } from '../../../data/questionBank';
import type { Exam } from '../../../types';

interface StepProps {
  draft: Exam;
  update: (patch: Partial<Exam>) => void;
}

const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function DetailsStep({ draft, update }: StepProps) {
  const rules = draft.rules;
  const nameError = draft.name.trim().length === 0 ? 'An exam name is required before publishing.' : undefined;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader title="Exam details" description="Shown to candidates before the examination begins" />
        <div className="space-y-4 p-5">
          <Field label="Exam name" required error={nameError}>
            {({ id, describedBy, invalid }) =>
            <TextInput
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={draft.name}
              placeholder="React Fundamentals Assessment"
              onChange={(event) => update({ name: event.target.value })} />

            }
          </Field>

          <Field label="Description" hint="A short summary candidates see on the instructions screen.">
            {({ id, describedBy }) =>
            <TextArea
              id={id}
              aria-describedby={describedBy}
              rows={2}
              value={draft.description}
              placeholder="Test your understanding of React fundamentals."
              onChange={(event) => update({ description: event.target.value })} />

            }
          </Field>

          <Field label="Instructions" hint="Displayed in full on the instruction screen before the timer starts.">
            {({ id, describedBy }) =>
            <TextArea
              id={id}
              aria-describedby={describedBy}
              rows={4}
              value={draft.instructions}
              onChange={(event) => update({ instructions: event.target.value })} />

            }
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category">
              {({ id }) =>
              <Select id={id} value={draft.category} onChange={(event) => update({ category: event.target.value })}>
                  {questionCategories.map((category) =>
                <option key={category} value={category}>
                      {category}
                    </option>
                )}
                </Select>
              }
            </Field>
            <Field label="Duration (minutes)">
              {({ id }) =>
              <TextInput
                id={id}
                type="number"
                min={1}
                max={480}
                value={rules.durationMinutes}
                onChange={(event) =>
                update({ rules: { ...rules, durationMinutes: Math.max(1, Number(event.target.value) || 1) } })
                } />

              }
            </Field>
            <Field label="Maximum attempts">
              {({ id }) =>
              <TextInput
                id={id}
                type="number"
                min={1}
                max={10}
                value={rules.attempts}
                onChange={(event) =>
                update({ rules: { ...rules, attempts: Math.max(1, Number(event.target.value) || 1) } })
                } />

              }
            </Field>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Availability window" description="Candidates can only start the exam inside this window" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Opens">
            {({ id }) =>
            <TextInput
              id={id}
              type="datetime-local"
              value={toLocalInput(draft.startAt)}
              onChange={(event) => update({ startAt: new Date(event.target.value).toISOString() })} />

            }
          </Field>
          <Field label="Closes">
            {({ id }) =>
            <TextInput
              id={id}
              type="datetime-local"
              value={toLocalInput(draft.endAt)}
              onChange={(event) => update({ endAt: new Date(event.target.value).toISOString() })} />

            }
          </Field>
        </div>
      </Panel>
    </div>);

}