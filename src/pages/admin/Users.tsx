import React, { useMemo, useState } from 'react';
import { HistoryIcon, PencilIcon, PlusIcon, SearchIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Field, Select, TextInput } from '../../components/ui/Field';
import { UserStatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, Panel, TableSkeleton } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { TBody, TD, TH, THead, TR, TableWrap } from '../../components/ui/Table';
import { useData } from '../../contexts/DataContext';
import type { Candidate, UserStatus } from '../../types';
import { formatDate, formatDateTime, initials, uid } from '../../utils/format';

const emptyCandidate = (): Candidate => ({
  id: uid('usr'),
  name: '',
  email: '',
  status: 'invited',
  examsAttempted: 0,
  lastActivity: new Date().toISOString()
});

export function Users() {
  const { candidates, results, loading, loadError, reload, saveCandidate } = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | UserStatus>('all');
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [historyFor, setHistoryFor] = useState<Candidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesTerm =
      !term ||
      candidate.name.toLowerCase().includes(term) ||
      candidate.email.toLowerCase().includes(term) ||
      candidate.id.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || candidate.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [candidates, query, status]);

  const history = useMemo(
    () => historyFor ? results.filter((result) => result.candidateId === historyFor.id) : [],
    [results, historyFor]
  );

  const nameError = showErrors && !editing?.name.trim() ? 'Enter the user’s full name.' : undefined;
  const emailError =
  showErrors && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editing?.email ?? '') ? 'Enter a valid email address.' : undefined;

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage candidate accounts, access, and examination history."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Users' }]}
        actions={
        <Button
          variant="primary"
          onClick={() => {
            setEditing(emptyCandidate());
            setShowErrors(false);
          }}>
          
            <UserPlusIcon aria-hidden className="h-4 w-4" />
            Create user
          </Button>
        } />
      

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[220px] flex-1">
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or user ID"
            aria-label="Search users"
            leading={<SearchIcon aria-hidden className="h-4 w-4" />} />
          
        </div>
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value as 'all' | UserStatus)}
          className="w-40">
          
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
        </Select>
      </div>

      <Panel className="overflow-hidden">
        {loading ?
        <TableSkeleton rows={6} columns={5} /> :
        filtered.length === 0 ?
        candidates.length === 0 ?
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Create candidate accounts so they can be assigned to examinations."
          action={
          <Button variant="primary" onClick={() => setEditing(emptyCandidate())}>
                  <PlusIcon aria-hidden className="h-4 w-4" />
                  Create user
                </Button>
          } /> :


        <EmptyState
          icon={SearchIcon}
          title="No users match your filters"
          description="Try a different search term or reset the status filter."
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



        <TableWrap>
            <THead>
              <TH>User</TH>
              <TH>User ID</TH>
              <TH>Status</TH>
              <TH align="right">Exams attempted</TH>
              <TH>Last activity</TH>
              <TH align="right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((candidate) =>
            <TR key={candidate.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {candidate.photoURL ? (
                        <img src={candidate.photoURL} alt={candidate.name} className="h-8 w-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-[11px] font-semibold text-ink">
                          {initials(candidate.name)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{candidate.name}</p>
                        <p className="truncate text-xs text-muted">{candidate.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="font-mono text-xs text-muted">{candidate.id}</TD>
                  <TD>
                    <UserStatusBadge status={candidate.status} />
                  </TD>
                  <TD align="right" className="tabular text-muted">
                    {candidate.examsAttempted}
                  </TD>
                  <TD className="whitespace-nowrap text-muted">{formatDate(candidate.lastActivity)}</TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-0.5">
                      <IconButton label={`Exam history for ${candidate.name}`} onClick={() => setHistoryFor(candidate)}>
                        <HistoryIcon aria-hidden className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                    label={`Edit ${candidate.name}`}
                    onClick={() => {
                      setEditing(candidate);
                      setShowErrors(false);
                    }}>
                    
                        <PencilIcon aria-hidden className="h-4 w-4" />
                      </IconButton>
                      <Button
                    size="sm"
                    variant={candidate.status === 'disabled' ? 'secondary' : 'ghost'}
                    onClick={() =>
                    void saveCandidate({
                      ...candidate,
                      status: candidate.status === 'disabled' ? 'active' : 'disabled'
                    })
                    }>
                    
                        {candidate.status === 'disabled' ? 'Enable' : 'Disable'}
                      </Button>
                    </div>
                  </TD>
                </TR>
            )}
            </TBody>
          </TableWrap>
        }
      </Panel>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing && candidates.some((c) => c.id === editing.id) ? 'Edit user' : 'Create user'}
        description="Candidates sign in to an examination with the Exam ID and password you issue."
        footer={
        <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
            variant="primary"
            loading={saving}
            onClick={async () => {
              if (!editing) return;
              if (!editing.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editing.email)) {
                setShowErrors(true);
                return;
              }
              setSaving(true);
              await saveCandidate(editing);
              setSaving(false);
              setEditing(null);
            }}>
            
              Save user
            </Button>
          </>
        }>
        
        {editing &&
        <div className="space-y-4">
            <Field label="Full name" required error={nameError}>
              {({ id, invalid }) =>
            <TextInput
              id={id}
              invalid={invalid}
              value={editing.name}
              placeholder="Aditi Sharma"
              onChange={(event) => setEditing({ ...editing, name: event.target.value })} />

            }
            </Field>
            <Field label="Email / username" required error={emailError}>
              {({ id, invalid }) =>
            <TextInput
              id={id}
              invalid={invalid}
              type="email"
              value={editing.email}
              placeholder="aditi.sharma@northfield.edu"
              onChange={(event) => setEditing({ ...editing, email: event.target.value })} />

            }
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                {({ id }) =>
              <Select
                id={id}
                value={editing.status}
                onChange={(event) => setEditing({ ...editing, status: event.target.value as UserStatus })}>
                
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="disabled">Disabled</option>
                  </Select>
              }
              </Field>
              <Field label="User ID" hint="Generated automatically and used in reporting.">
                {({ id }) => <TextInput id={id} value={editing.id} disabled readOnly />}
              </Field>
            </div>
          </div>
        }
      </Modal>

      <Modal
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        title={historyFor ? `Examination history — ${historyFor.name}` : 'Examination history'}
        size="lg">
        
        {history.length === 0 ?
        <EmptyState
          icon={HistoryIcon}
          title="No examinations yet"
          description="Completed examinations for this user will appear here with their score and submission time." /> :


        <ul className="divide-y divide-line">
            {history.map((result) =>
          <li key={result.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{result.examName}</p>
                  <p className="text-xs text-muted">{formatDateTime(result.submittedAt)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular text-sm font-semibold text-ink">{result.percentage}%</p>
                  <p className={result.passed ? 'text-2xs font-semibold uppercase text-success' : 'text-2xs font-semibold uppercase text-primary'}>
                    {result.passed ? 'Pass' : 'Fail'}
                  </p>
                </div>
              </li>
          )}
          </ul>
        }
      </Modal>
    </>);

}