import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  LibraryIcon,
  ListChecksIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon } from
'lucide-react';
import { Button, IconButton } from '../../ui/Button';
import { Select, TextInput } from '../../ui/Field';
import { EmptyState, Panel, PanelHeader } from '../../ui/States';
import { DifficultyBadge, QuestionTypeBadge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/Modal';
import { QuestionEditor } from './QuestionEditor';
import { BankPickerModal } from './BankPickerModal';
import { useData } from '../../../contexts/DataContext';
import type { Difficulty, Exam, Question } from '../../../types';
import { uid } from '../../../utils/format';

interface StepProps {
  draft: Exam;
  update: (patch: Partial<Exam>) => void;
}

export function QuestionsStep({ draft, update }: StepProps) {
  const { saveBankQuestion } = useData();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');

  const questions = draft.questions;
  const totalMarks = useMemo(
    () => Number(questions.reduce((sum, question) => sum + question.marks, 0).toFixed(2)),
    [questions]
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return questions.
    map((question, index) => ({ question, index })).
    filter(({ question }) => {
      const matchesTerm = !term || question.prompt.toLowerCase().includes(term);
      const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty;
      return matchesTerm && matchesDifficulty;
    });
  }, [questions, query, difficulty]);

  const setQuestions = (next: Question[]) => update({ questions: next });

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setQuestions(next);
  };

  const onSave = (question: Question, saveToBank: boolean) => {
    const exists = questions.some((item) => item.id === question.id);
    setQuestions(exists ? questions.map((item) => item.id === question.id ? question : item) : [...questions, question]);
    if (saveToBank) void saveBankQuestion({ ...question, id: uid('qb') });
    setEditorOpen(false);
    setEditing(null);
    toast.success(exists ? 'Question updated' : 'Question added');
  };

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Questions"
          description={`${questions.length} ${questions.length === 1 ? 'question' : 'questions'} · ${totalMarks} total marks`}
          action={
          <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setBankOpen(true)}>
                <LibraryIcon aria-hidden className="h-4 w-4" />
                Add from bank
              </Button>
              <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}>
              
                <PlusIcon aria-hidden className="h-4 w-4" />
                Add question
              </Button>
            </div>
          } />
        

        {questions.length > 0 &&
        <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
            <div className="min-w-[200px] flex-1">
              <TextInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions in this exam"
              aria-label="Search questions"
              leading={<SearchIcon aria-hidden className="h-4 w-4" />} />
            
            </div>
            <Select
            aria-label="Filter by difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as 'all' | Difficulty)}
            className="w-36">
            
              <option value="all">Any level</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
        }

        {questions.length === 0 ?
        <EmptyState
          icon={ListChecksIcon}
          title="No questions yet"
          description="Add your first question, or pull ready-made questions from the shared question bank."
          action={
          <div className="flex flex-wrap justify-center gap-2">
                <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}>
              
                  <PlusIcon aria-hidden className="h-4 w-4" />
                  Add question
                </Button>
                <Button variant="secondary" onClick={() => setBankOpen(true)}>
                  <LibraryIcon aria-hidden className="h-4 w-4" />
                  Add from bank
                </Button>
              </div>
          } /> :

        visible.length === 0 ?
        <EmptyState
          icon={SearchIcon}
          title="No matching questions"
          description="Clear the search or difficulty filter to see every question in this exam."
          action={
          <Button
            variant="secondary"
            onClick={() => {
              setQuery('');
              setDifficulty('all');
            }}>
            
                Clear filters
              </Button>
          } /> :


        <ol className="divide-y divide-line">
            {visible.map(({ question, index }) =>
          <li key={question.id} className="flex gap-4 px-5 py-4">
                <span className="tabular mt-0.5 w-7 shrink-0 text-[13px] font-semibold text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-ink">{question.prompt || 'Untitled question'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <QuestionTypeBadge type={question.type} />
                    <DifficultyBadge difficulty={question.difficulty} />
                    <span className="text-xs text-muted">
                      {question.category} · {question.marks} marks
                      {question.negativeMarks > 0 ? ` · −${question.negativeMarks}` : ''}
                    </span>
                  </div>
                  {question.type !== 'short' &&
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      {question.options.map((option) =>
                <li
                  key={option.id}
                  className={
                  question.correctOptionIds.includes(option.id) ?
                  'font-medium text-success' :
                  undefined
                  }>
                  
                          {question.correctOptionIds.includes(option.id) ? '✓ ' : '· '}
                          {option.text}
                        </li>
                )}
                    </ul>
              }
                </div>
                <div className="flex shrink-0 items-start gap-0.5">
                  <IconButton label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                    <ChevronUpIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                label={`Move question ${index + 1} down`}
                disabled={index === questions.length - 1}
                onClick={() => move(index, 1)}>
                
                    <ChevronDownIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                label={`Duplicate question ${index + 1}`}
                onClick={() => {
                  const copy: Question = {
                    ...JSON.parse(JSON.stringify(question)),
                    id: uid('q')
                  };
                  const next = [...questions];
                  next.splice(index + 1, 0, copy);
                  setQuestions(next);
                  toast.success('Question duplicated');
                }}>
                
                    <CopyIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                label={`Edit question ${index + 1}`}
                onClick={() => {
                  setEditing(question);
                  setEditorOpen(true);
                }}>
                
                    <PencilIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                label={`Delete question ${index + 1}`}
                className="hover:text-primary"
                onClick={() => setConfirmId(question.id)}>
                
                    <Trash2Icon aria-hidden className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
          )}
          </ol>
        }
      </Panel>

      <QuestionEditor
        open={editorOpen}
        initial={editing}
        defaultCategory={draft.category}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSave={onSave} />
      

      <BankPickerModal
        open={bankOpen}
        existingPrompts={questions.map((question) => question.prompt)}
        onClose={() => setBankOpen(false)}
        onAdd={(picked) => {
          setQuestions([...questions, ...picked]);
          setBankOpen(false);
          toast.success(`${picked.length} ${picked.length === 1 ? 'question' : 'questions'} added`);
        }} />
      

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete this question?"
        description="The question is removed from this examination. Questions saved in the bank are unaffected."
        confirmLabel="Delete question"
        destructive
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          setQuestions(questions.filter((question) => question.id !== confirmId));
          setConfirmId(null);
          toast.success('Question deleted');
        }} />
      
    </div>);

}