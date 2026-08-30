import React, { useEffect, useMemo, useState } from 'react';
import { CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button, IconButton } from '../../ui/Button';
import { Field, Select, TextArea, TextInput } from '../../ui/Field';
import { questionCategories } from '../../../data/questionBank';
import type { Difficulty, Question, QuestionType } from '../../../types';
import { cn, uid } from '../../../utils/format';

interface QuestionEditorProps {
  open: boolean;
  initial: Question | null;
  defaultCategory: string;
  onClose: () => void;
  onSave: (question: Question, saveToBank: boolean) => void;
}

const emptyQuestion = (category: string): Question => ({
  id: uid('q'),
  type: 'single',
  prompt: '',
  options: [
  { id: uid('o'), text: '' },
  { id: uid('o'), text: '' },
  { id: uid('o'), text: '' },
  { id: uid('o'), text: '' }],

  correctOptionIds: [],
  marks: 2,
  negativeMarks: 0.5,
  difficulty: 'medium',
  category
});

const booleanOptions = () => [
{ id: uid('o'), text: 'True' },
{ id: uid('o'), text: 'False' }];


export function QuestionEditor({ open, initial, defaultCategory, onClose, onSave }: QuestionEditorProps) {
  const [draft, setDraft] = useState<Question>(() => initial ?? emptyQuestion(defaultCategory));
  const [saveToBank, setSaveToBank] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(initial ? JSON.parse(JSON.stringify(initial)) : emptyQuestion(defaultCategory));
      setSaveToBank(false);
      setShowErrors(false);
    }
  }, [open, initial, defaultCategory]);

  const errors = useMemo(() => {
    const list: Record<string, string> = {};
    if (!draft.prompt.trim()) list.prompt = 'Enter the question text.';
    if (draft.type !== 'short') {
      const filled = draft.options.filter((option) => option.text.trim());
      if (filled.length < 2) list.options = 'Provide at least two answer options.';
      if (draft.correctOptionIds.length === 0) list.correct = 'Select the correct answer.';
      if (draft.type === 'single' || draft.type === 'boolean') {
        if (draft.correctOptionIds.length > 1) list.correct = 'This question type allows only one correct answer.';
      }
    } else if (!draft.expectedAnswer?.trim()) {
      list.expected = 'Enter the expected answer used for review.';
    }
    if (draft.marks <= 0) list.marks = 'Marks must be greater than zero.';
    return list;
  }, [draft]);

  const changeType = (type: QuestionType) => {
    setDraft((current) => {
      if (type === 'boolean') {
        const options = booleanOptions();
        return { ...current, type, options, correctOptionIds: [] };
      }
      if (type === 'short') {
        return { ...current, type, options: [], correctOptionIds: [] };
      }
      const options =
      current.options.length >= 2 ?
      current.options :
      [
      { id: uid('o'), text: '' },
      { id: uid('o'), text: '' }];

      return {
        ...current,
        type,
        options,
        correctOptionIds: type === 'single' ? current.correctOptionIds.slice(0, 1) : current.correctOptionIds
      };
    });
  };

  const toggleCorrect = (optionId: string) => {
    setDraft((current) => {
      if (current.type === 'multiple') {
        const next = current.correctOptionIds.includes(optionId) ?
        current.correctOptionIds.filter((id) => id !== optionId) :
        [...current.correctOptionIds, optionId];
        return { ...current, correctOptionIds: next };
      }
      return { ...current, correctOptionIds: [optionId] };
    });
  };

  const submit = () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    const cleaned: Question = {
      ...draft,
      prompt: draft.prompt.trim(),
      options: draft.options.
      filter((option) => option.text.trim()).
      map((option) => ({ ...option, text: option.text.trim() }))
    };
    onSave(cleaned, saveToBank);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit question' : 'Add question'}
      description="Define the prompt, options, correct answer, and marking for this question."
      size="lg"
      footer={
      <>
          <label className="mr-auto flex items-center gap-2 text-[13px] text-muted">
            <input
            type="checkbox"
            checked={saveToBank}
            onChange={(event) => setSaveToBank(event.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-primary focus:ring-primary/40" />
          
            Also save to question bank
          </label>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Save question
          </Button>
        </>
      }>
      
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Question type">
            {({ id }) =>
            <Select id={id} value={draft.type} onChange={(event) => changeType(event.target.value as QuestionType)}>
                <option value="single">Single answer MCQ</option>
                <option value="multiple">Multiple answer MCQ</option>
                <option value="boolean">True / False</option>
                <option value="short">Short answer</option>
              </Select>
            }
          </Field>
          <Field label="Category">
            {({ id }) =>
            <Select
              id={id}
              value={draft.category}
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
              
                {questionCategories.map((category) =>
              <option key={category} value={category}>
                    {category}
                  </option>
              )}
              </Select>
            }
          </Field>
        </div>

        <Field label="Question" required error={showErrors ? errors.prompt : undefined}>
          {({ id, describedBy, invalid }) =>
          <TextArea
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            rows={3}
            value={draft.prompt}
            placeholder="What hook is used to manage state in React?"
            onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))} />

          }
        </Field>

        {draft.type === 'short' ?
        <Field
          label="Expected answer"
          required
          hint="Used by reviewers when grading short answers. Short answers are always reviewed manually."
          error={showErrors ? errors.expected : undefined}>
          
            {({ id, describedBy, invalid }) =>
          <TextInput
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            value={draft.expectedAnswer ?? ''}
            onChange={(event) => setDraft((current) => ({ ...current, expectedAnswer: event.target.value }))} />

          }
          </Field> :

        <div>
            <p className="mb-2 flex items-center gap-1 text-[13px] font-medium text-ink">
              Options &amp; correct answer
              <span aria-hidden className="text-primary">
                *
              </span>
            </p>
            <div className="space-y-2">
              {draft.options.map((option, index) => {
              const correct = draft.correctOptionIds.includes(option.id);
              return (
                <div key={option.id} className="flex items-center gap-2">
                    <button
                    type="button"
                    role={draft.type === 'multiple' ? 'checkbox' : 'radio'}
                    aria-checked={correct}
                    aria-label={`Mark option ${index + 1} as correct`}
                    onClick={() => toggleCorrect(option.id)}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center border text-xs font-semibold transition-colors duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      draft.type === 'multiple' ? 'rounded-md' : 'rounded-full',
                      correct ?
                      'border-success bg-success-soft text-success' :
                      'border-line text-muted hover:border-line-strong'
                    )}>
                    
                      {correct ? <CheckIcon aria-hidden className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                    </button>
                    <TextInput
                    value={option.text}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    aria-label={`Option ${index + 1} text`}
                    disabled={draft.type === 'boolean'}
                    onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      options: current.options.map((item) =>
                      item.id === option.id ? { ...item, text: event.target.value } : item
                      )
                    }))
                    } />
                  
                    {draft.type !== 'boolean' && draft.options.length > 2 &&
                  <IconButton
                    label={`Remove option ${index + 1}`}
                    onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      options: current.options.filter((item) => item.id !== option.id),
                      correctOptionIds: current.correctOptionIds.filter((id) => id !== option.id)
                    }))
                    }>
                    
                        <Trash2Icon aria-hidden className="h-4 w-4" />
                      </IconButton>
                  }
                  </div>);

            })}
            </div>
            {draft.type !== 'boolean' && draft.options.length < 6 &&
          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            onClick={() =>
            setDraft((current) => ({
              ...current,
              options: [...current.options, { id: uid('o'), text: '' }]
            }))
            }>
            
                <PlusIcon aria-hidden className="h-4 w-4" />
                Add option
              </Button>
          }
            {showErrors && (errors.options || errors.correct) &&
          <p className="mt-2 text-xs font-medium text-primary">{errors.options ?? errors.correct}</p>
          }
          </div>
        }

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Marks" error={showErrors ? errors.marks : undefined}>
            {({ id }) =>
            <TextInput
              id={id}
              type="number"
              min={0.25}
              step={0.25}
              value={draft.marks}
              onChange={(event) => setDraft((current) => ({ ...current, marks: Number(event.target.value) || 0 }))} />

            }
          </Field>
          <Field label="Negative marks">
            {({ id }) =>
            <TextInput
              id={id}
              type="number"
              min={0}
              step={0.25}
              value={draft.negativeMarks}
              onChange={(event) =>
              setDraft((current) => ({ ...current, negativeMarks: Math.max(0, Number(event.target.value) || 0) }))
              } />

            }
          </Field>
          <Field label="Difficulty">
            {({ id }) =>
            <Select
              id={id}
              value={draft.difficulty}
              onChange={(event) =>
              setDraft((current) => ({ ...current, difficulty: event.target.value as Difficulty }))
              }>
              
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            }
          </Field>
        </div>
      </div>
    </Modal>);

}