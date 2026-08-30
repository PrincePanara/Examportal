import React, { useMemo, useState } from 'react';
import { LibraryIcon, SearchIcon } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Select, TextInput } from '../../ui/Field';
import { EmptyState, TableSkeleton } from '../../ui/States';
import { DifficultyBadge, QuestionTypeBadge } from '../../ui/Badge';
import { useData } from '../../../contexts/DataContext';
import { questionCategories } from '../../../data/questionBank';
import type { Difficulty, Question, QuestionType } from '../../../types';
import { cn, uid } from '../../../utils/format';

interface BankPickerProps {
  open: boolean;
  existingPrompts: string[];
  onClose: () => void;
  onAdd: (questions: Question[]) => void;
}

export function BankPickerModal({ open, existingPrompts, onClose, onAdd }: BankPickerProps) {
  const { bank, loading } = useData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [type, setType] = useState<'all' | QuestionType>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return bank.filter((question) => {
      const matchesTerm = !term || question.prompt.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || question.category === category;
      const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty;
      const matchesType = type === 'all' || question.type === type;
      return matchesTerm && matchesCategory && matchesDifficulty && matchesType;
    });
  }, [bank, query, category, difficulty, type]);

  const add = () => {
    const picked = bank.
    filter((question) => selected.includes(question.id)).
    map((question) => ({
      ...JSON.parse(JSON.stringify(question)),
      id: uid('q')
    })) as Question[];
    onAdd(picked);
    setSelected([]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add from question bank"
      description="Reuse existing questions instead of recreating them."
      size="xl"
      footer={
      <>
          <span className="mr-auto text-[13px] text-muted">{selected.length} selected</span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={selected.length === 0} onClick={add}>
            Add {selected.length > 0 ? `${selected.length} ` : ''}
            {selected.length === 1 ? 'question' : 'questions'}
          </Button>
        </>
      }>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[180px] flex-1">
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions"
            aria-label="Search the question bank"
            leading={<SearchIcon aria-hidden className="h-4 w-4" />} />
          
        </div>
        <Select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-36">
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
          className="w-32">
          
          <option value="all">Any level</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <Select
          aria-label="Filter by type"
          value={type}
          onChange={(event) => setType(event.target.value as 'all' | QuestionType)}
          className="w-40">
          
          <option value="all">Any type</option>
          <option value="single">Single answer</option>
          <option value="multiple">Multiple answer</option>
          <option value="boolean">True / False</option>
        </Select>
      </div>

      {loading ?
      <TableSkeleton rows={5} columns={2} /> :
      filtered.length === 0 ?
      <EmptyState
        icon={LibraryIcon}
        title="No questions match"
        description="Adjust your filters, or create a new question directly in this exam." /> :


      <ul className="space-y-2">
          {filtered.map((question) => {
          const checked = selected.includes(question.id);
          const alreadyUsed = existingPrompts.includes(question.prompt);
          return (
            <li key={question.id}>
                <label
                className={cn(
                  'flex cursor-pointer gap-3 rounded-lg border p-3.5 transition-[border-color,background-color] duration-150 ease-swift',
                  checked ? 'border-primary bg-primary-soft/60' : 'border-line hover:border-line-strong'
                )}>
                
                  <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                  setSelected((current) =>
                  current.includes(question.id) ?
                  current.filter((id) => id !== question.id) :
                  [...current, question.id]
                  )
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong text-primary focus:ring-primary/40" />
                
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-ink">{question.prompt}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <QuestionTypeBadge type={question.type} />
                      <DifficultyBadge difficulty={question.difficulty} />
                      <span className="text-xs text-muted">
                        {question.category} · {question.marks} marks
                      </span>
                      {alreadyUsed && <span className="text-xs font-medium text-warning">Already in this exam</span>}
                    </div>
                  </div>
                </label>
              </li>);

        })}
        </ul>
      }
    </Modal>);

}