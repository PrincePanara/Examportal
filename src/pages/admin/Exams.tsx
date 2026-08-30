import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArchiveIcon,
  CopyIcon,
  EyeIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
  UploadCloudIcon } from
'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { ExamStatusBadge } from '../../components/ui/Badge';
import { Select, TextInput } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Panel, TableSkeleton } from '../../components/ui/States';
import { TBody, TD, TH, THead, TR, TableWrap } from '../../components/ui/Table';
import { SegmentedControl } from '../../components/ui/Switch';
import { useData } from '../../contexts/DataContext';
import type { Exam, ExamStatus } from '../../types';
import { formatDate } from '../../utils/format';

type StatusFilter = 'all' | ExamStatus;
type SortKey = 'recent' | 'name' | 'participants';

function RowMenu({ exam }: {exam: Exam;}) {
  const { duplicateExam, setExamStatus, deleteExam } = useData();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const item =
  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink transition-colors duration-150 ease-swift hover:bg-surface-alt';

  return (
    <div ref={ref} className="relative">
      <IconButton label={`Actions for ${exam.name}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <MoreHorizontalIcon aria-hidden className="h-4 w-4" />
      </IconButton>
      {open &&
      <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1 text-left shadow-pop">
          <button
          type="button"
          className={item}
          onClick={() => {
            setOpen(false);
            void duplicateExam(exam.id);
          }}>
          
            <CopyIcon aria-hidden className="h-4 w-4 text-muted" />
            Duplicate
          </button>
          {exam.status === 'published' ?
        <button
          type="button"
          className={item}
          onClick={() => {
            setOpen(false);
            void setExamStatus(exam.id, 'draft');
          }}>
          
              <UploadCloudIcon aria-hidden className="h-4 w-4 text-muted" />
              Unpublish
            </button> :

        <button
          type="button"
          className={item}
          disabled={exam.questions.length === 0}
          onClick={() => {
            setOpen(false);
            void setExamStatus(exam.id, 'published');
          }}>
          
              <UploadCloudIcon aria-hidden className="h-4 w-4 text-muted" />
              Publish
            </button>
        }
          <button
          type="button"
          className={item}
          onClick={() => {
            setOpen(false);
            void setExamStatus(exam.id, 'archived');
          }}>
          
            <ArchiveIcon aria-hidden className="h-4 w-4 text-muted" />
            Archive
          </button>
          <div className="my-1 h-px bg-line" />
          <button
          type="button"
          className={`${item} text-primary`}
          onClick={() => {
            setOpen(false);
            setConfirmDelete(true);
          }}>
          
            <Trash2Icon aria-hidden className="h-4 w-4" />
            Delete
          </button>
        </div>
      }

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this examination?"
        description={`“${exam.name}” and its questions will be permanently removed. Existing results are retained for reporting.`}
        confirmLabel="Delete exam"
        destructive
        loading={busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setBusy(true);
          await deleteExam(exam.id);
          setBusy(false);
          setConfirmDelete(false);
        }} />
      
    </div>);

}

export function Exams() {
  const navigate = useNavigate();
  const { exams, loading, loadError, reload, createExam } = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = exams.filter((exam) => {
      const matchesTerm =
      !term ||
      exam.name.toLowerCase().includes(term) ||
      exam.credentials.examId.toLowerCase().includes(term) ||
      exam.category.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || exam.status === status;
      return matchesTerm && matchesStatus;
    });
    return list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'participants') return b.participants - a.participants;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [exams, query, status, sort]);

  const onCreate = async () => {
    setCreating(true);
    const exam = await createExam();
    setCreating(false);
    if (exam) navigate(`/admin/exams/${exam.id}`);
  };

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeader
        title="Examinations"
        description="Author, publish, and control availability for every assessment."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Exams' }]}
        actions={
        <Button variant="primary" loading={creating} onClick={onCreate}>
            <PlusIcon aria-hidden className="h-4 w-4" />
            Create new exam
          </Button>
        } />
      

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] flex-1">
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, exam ID, or category"
            aria-label="Search examinations"
            leading={<SearchIcon aria-hidden className="h-4 w-4" />} />
          
        </div>
        <SegmentedControl
          label="Filter by status"
          size="sm"
          value={status}
          onChange={setStatus}
          options={[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'draft', label: 'Drafts' },
          { value: 'archived', label: 'Archived' }]
          }
          className="hidden md:inline-flex" />
        
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="w-40 md:hidden">
          
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          aria-label="Sort exams"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="w-44">
          
          <option value="recent">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="participants">Most participants</option>
        </Select>
      </div>

      <Panel className="overflow-hidden">
        {loading ?
        <TableSkeleton rows={6} columns={6} /> :
        filtered.length === 0 ?
        exams.length === 0 ?
        <EmptyState
          icon={FileTextIcon}
          title="No examinations yet"
          description="Create your first examination to start managing assessments."
          action={
          <Button variant="primary" loading={creating} onClick={onCreate}>
                  <PlusIcon aria-hidden className="h-4 w-4" />
                  Create examination
                </Button>
          } /> :


        <EmptyState
          icon={SearchXIcon}
          title="No exams match your filters"
          description="Try a different search term or clear the status filter to see everything."
          action={
          <Button
            variant="secondary"
            onClick={() => {
              setQuery('');
              setStatus('all');
            }}>
            
                  Clear filters
                </Button>
          } /> :



        <>
            <TableWrap className="hidden md:block">
              <THead>
                <TH>Exam</TH>
                <TH>Category</TH>
                <TH>Status</TH>
                <TH align="right">Questions</TH>
                <TH align="right">Duration</TH>
                <TH align="right">Participants</TH>
                <TH>Created</TH>
                <TH align="right">Actions</TH>
              </THead>
              <TBody>
                {filtered.map((exam) =>
              <TR key={exam.id}>
                    <TD>
                      <Link
                    to={`/admin/exams/${exam.id}`}
                    className="font-medium leading-tight text-ink transition-colors duration-150 ease-swift hover:text-primary">
                    
                        {exam.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-muted">{exam.credentials.examId}</p>
                    </TD>
                    <TD className="text-muted">{exam.category}</TD>
                    <TD>
                      <ExamStatusBadge status={exam.status} />
                    </TD>
                    <TD align="right" className="tabular text-muted">
                      {exam.questions.length}
                    </TD>
                    <TD align="right" className="tabular text-muted">
                      {exam.rules.durationMinutes} min
                    </TD>
                    <TD align="right" className="tabular text-muted">
                      {exam.participants.toLocaleString()}
                    </TD>
                    <TD className="whitespace-nowrap text-muted">{formatDate(exam.createdAt)}</TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/admin/preview/${exam.id}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost">
                            <EyeIcon aria-hidden className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                        </Link>
                        <Link to={`/admin/exams/${exam.id}`}>
                          <Button size="sm" variant="secondary">
                            Manage
                          </Button>
                        </Link>
                        <RowMenu exam={exam} />
                      </div>
                    </TD>
                  </TR>
              )}
              </TBody>
            </TableWrap>

            <ul className="divide-y divide-line md:hidden">
              {filtered.map((exam) =>
            <li key={exam.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{exam.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted">{exam.credentials.examId}</p>
                    </div>
                    <ExamStatusBadge status={exam.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {exam.questions.length} questions · {exam.rules.durationMinutes} minutes ·{' '}
                    {exam.participants.toLocaleString()} participants
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link to={`/admin/preview/${exam.id}`} className="flex-1" target="_blank" rel="noreferrer">
                      <Button size="sm" variant="secondary" fullWidth>
                        Preview
                      </Button>
                    </Link>
                    <Link to={`/admin/exams/${exam.id}`} className="flex-1">
                      <Button size="sm" variant="primary" fullWidth>
                        Manage
                      </Button>
                    </Link>
                    <RowMenu exam={exam} />
                  </div>
                </li>
            )}
            </ul>
          </>
        }
      </Panel>
    </>);

}