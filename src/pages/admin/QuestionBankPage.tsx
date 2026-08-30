import React, { useMemo, useState } from 'react';
import { CopyIcon, LibraryIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Select, TextInput } from '../../components/ui/Field';
import { DifficultyBadge, QuestionTypeBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, Panel, TableSkeleton } from '../../components/ui/States';
import { ConfirmDialog } from '../../components/ui/Modal';
import { QuestionEditor } from '../../components/admin/builder/QuestionEditor';
import { useData } from '../../contexts/DataContext';
import { questionCategories } from '../../data/questionBank';
import type { Difficulty, Question, QuestionType } from '../../types';
import { uid } from '../../utils/format';

export function QuestionBankPage() {
  const { bank, loading, loadError, reload, saveBankQuestion, deleteBankQuestion } = useData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [type, setType] = useState<'all' | QuestionType>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return bank.filter((question) => {
      const matchesTerm =
      !term || question.prompt.toLowerCase().includes(term) || question.category.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || question.category === category;
      const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty;
      const matchesType = type === 'all' || question.type === type;
      return matchesTerm && matchesCategory && matchesDifficulty && matchesType;
    });
  }, [bank, query, category, difficulty, type]);

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeader
        title="Question bank"
        description="A reusable library of questions that can be pulled into any examination."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Question bank' }]}
        actions={
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}>
          
            <PlusIcon aria-hidden className="h-4 w-4" />
            New question
          </Button>
        } />
      

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[220px] flex-1">
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions"
            aria-label="Search questions"
            leading={<SearchIcon aria-hidden className="h-4 w-4" />} />
          
        </div>
        <Select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-40">
          <option value="all">All categories</option>
          {questionCategories.map((item) =>
          <option key={item} value={item}>
              {item}
            </option>
          )}
        </Select>
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
        <Select
          aria-label="Filter by question type"
          value={type}
          onChange={(event) => setType(event.target.value as 'all' | QuestionType)}
          className="w-44">
          
          <option value="all">Any type</option>
          <option value="single">Single answer</option>
          <option value="multiple">Multiple answer</option>
          <option value="boolean">True / False</option>
          <option value="short">Short answer</option>
        </Select>
      </div>

      <Panel className="overflow-hidden">
        {loading ?
        <TableSkeleton rows={6} columns={3} /> :
        filtered.length === 0 ?
        bank.length === 0 ?
        <EmptyState
          icon={LibraryIcon}
          title="No questions yet"
          description="Save questions here once and reuse them across every examination you build."
          action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}>
            
                  <PlusIcon aria-hidden className="h-4 w-4" />
                  New question
                </Button>
          } /> :


        <EmptyState
          icon={SearchIcon}
          title="No questions match your filters"
          description="Try a different search term or reset the filters to browse the whole bank."
          action={
          <Button
            variant="secondary"
            onClick={() => {
              setQuery('');
              setCategory('all');
              setDifficulty('all');
              setType('all');
            }}>
            
                  Clear filters
                </Button>
          } /> :



        <ul className="divide-y divide-line">
            {filtered.map((question) =>
          <li key={question.id} className="flex gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-ink">{question.prompt}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <QuestionTypeBadge type={question.type} />
                    <DifficultyBadge difficulty={question.difficulty} />
                    <span className="text-xs text-muted">
                      {question.category} · {question.marks} marks
                      {question.negativeMarks > 0 ? ` · −${question.negativeMarks}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-start gap-0.5">
                  <IconButton
                label={`Duplicate: ${question.prompt}`}
                onClick={() =>
                void saveBankQuestion({
                  ...JSON.parse(JSON.stringify(question)),
                  id: uid('qb'),
                  prompt: `${question.prompt} (copy)`
                })
                }>
                
                    <CopyIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                label={`Edit: ${question.prompt}`}
                onClick={() => {
                  setEditing(question);
                  setEditorOpen(true);
                }}>
                
                    <PencilIcon aria-hidden className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                label={`Delete: ${question.prompt}`}
                className="hover:text-primary"
                onClick={() => setConfirmId(question.id)}>
                
                    <Trash2Icon aria-hidden className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
          )}
          </ul>
        }
      </Panel>

      <QuestionEditor
        open={editorOpen}
        initial={editing}
        defaultCategory="React"
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSave={(question) => {
          void saveBankQuestion(editing ? question : { ...question, id: uid('qb') });
          setEditorOpen(false);
          setEditing(null);
        }} />
      

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete this question?"
        description="It is removed from the bank. Exams that already include a copy of it are unaffected."
        confirmLabel="Delete question"
        destructive
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          if (confirmId) await deleteBankQuestion(confirmId);
          setConfirmId(null);
        }} />
      
    </>);

}