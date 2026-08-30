import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ClipboardListIcon, DownloadIcon, SearchIcon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select, TextInput } from '../../components/ui/Field';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState, ErrorState, Panel, StatSkeleton, TableSkeleton } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { TBody, TD, TH, THead, TR, TableWrap } from '../../components/ui/Table';
import { useData } from '../../contexts/DataContext';
import type { ResultRecord } from '../../types';
import { formatDateTime, formatDuration } from '../../utils/format';

type SortKey = 'recent' | 'score-desc' | 'score-asc' | 'name';

export function Results() {
  const { results, exams, loading, loadError, reload } = useData();
  const [query, setQuery] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [outcome, setOutcome] = useState<'all' | 'pass' | 'fail'>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [viewing, setViewing] = useState<ResultRecord | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = results.filter((result) => {
      const matchesTerm =
      !term ||
      result.candidateName.toLowerCase().includes(term) ||
      result.candidateEmail.toLowerCase().includes(term) ||
      result.examName.toLowerCase().includes(term);
      const matchesExam = examFilter === 'all' || result.examId === examFilter;
      const matchesOutcome = outcome === 'all' || (outcome === 'pass' ? result.passed : !result.passed);
      return matchesTerm && matchesExam && matchesOutcome;
    });
    return list.sort((a, b) => {
      if (sort === 'score-desc') return b.percentage - a.percentage;
      if (sort === 'score-asc') return a.percentage - b.percentage;
      if (sort === 'name') return a.candidateName.localeCompare(b.candidateName);
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [results, query, examFilter, outcome, sort]);

  const stats = useMemo(() => {
    if (filtered.length === 0) {
      return { participants: 0, completed: 0, average: 0, passRate: 0, highest: 0 };
    }
    const unique = new Set(filtered.map((result) => result.candidateId)).size;
    const average = filtered.reduce((sum, result) => sum + result.percentage, 0) / filtered.length;
    const passRate = filtered.filter((result) => result.passed).length / filtered.length * 100;
    const highest = Math.max(...filtered.map((result) => result.percentage));
    return {
      participants: unique,
      completed: filtered.length,
      average: Number(average.toFixed(1)),
      passRate: Math.round(passRate),
      highest
    };
  }, [filtered]);

  const exportCsv = () => {
    const header = ['User', 'Email', 'Exam', 'Score', 'Total', 'Percentage', 'Outcome', 'Time taken', 'Submitted at'];
    const rows = filtered.map((result) => [
    result.candidateName,
    result.candidateEmail,
    result.examName,
    result.score,
    result.totalMarks,
    `${result.percentage}%`,
    result.passed ? 'Pass' : 'Fail',
    formatDuration(result.timeTakenSeconds),
    result.submittedAt]
    );
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examly-results-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`);
  };

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeader
        title="Results"
        description="Review submissions, outcomes, and performance across every examination."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Results' }]}
        actions={
        <Button variant="secondary" disabled={filtered.length === 0} onClick={exportCsv}>
            <DownloadIcon aria-hidden className="h-4 w-4" />
            Export CSV
          </Button>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading ?
        Array.from({ length: 5 }).map((_, index) => <StatSkeleton key={index} />) :

        <>
            <StatCard label="Participants" value={stats.participants} />
            <StatCard label="Completed" value={stats.completed} />
            <StatCard label="Average score" value={`${stats.average}%`} emphasis progress={stats.average} />
            <StatCard label="Pass rate" value={`${stats.passRate}%`} progress={stats.passRate} />
            <StatCard label="Highest score" value={`${stats.highest}%`} />
          </>
        }
      </div>

      <div className="my-4 flex flex-wrap gap-2">
        <div className="min-w-[220px] flex-1">
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by candidate or exam"
            aria-label="Search results"
            leading={<SearchIcon aria-hidden className="h-4 w-4" />} />
          
        </div>
        <Select aria-label="Filter by exam" value={examFilter} onChange={(event) => setExamFilter(event.target.value)} className="w-52">
          <option value="all">All exams</option>
          {exams.map((exam) =>
          <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          )}
        </Select>
        <Select
          aria-label="Filter by outcome"
          value={outcome}
          onChange={(event) => setOutcome(event.target.value as 'all' | 'pass' | 'fail')}
          className="w-36">
          
          <option value="all">All outcomes</option>
          <option value="pass">Passed</option>
          <option value="fail">Not passed</option>
        </Select>
        <Select aria-label="Sort results" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="w-44">
          <option value="recent">Most recent</option>
          <option value="score-desc">Highest score</option>
          <option value="score-asc">Lowest score</option>
          <option value="name">Candidate A–Z</option>
        </Select>
      </div>

      <Panel className="overflow-hidden">
        {loading ?
        <TableSkeleton rows={7} columns={6} /> :
        filtered.length === 0 ?
        results.length === 0 ?
        <EmptyState
          icon={ClipboardListIcon}
          title="No results yet"
          description="Once candidates submit an examination, their results appear here." /> :


        <EmptyState
          icon={SearchIcon}
          title="No results match your filters"
          description="Try a different search term, exam, or outcome."
          action={
          <Button
            variant="secondary"
            onClick={() => {
              setQuery('');
              setExamFilter('all');
              setOutcome('all');
            }}>
            
                  Clear filters
                </Button>
          } /> :



        <TableWrap>
            <THead>
              <TH>Candidate</TH>
              <TH>Exam</TH>
              <TH align="right">Score</TH>
              <TH align="right">Percentage</TH>
              <TH>Outcome</TH>
              <TH align="right">Time taken</TH>
              <TH>Submitted</TH>
              <TH align="right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((result) =>
            <TR key={result.id}>
                  <TD>
                    <p className="font-medium text-ink">{result.candidateName}</p>
                    <p className="text-xs text-muted">{result.candidateEmail}</p>
                  </TD>
                  <TD className="text-muted">{result.examName}</TD>
                  <TD align="right" className="tabular text-muted">
                    {result.score}/{result.totalMarks}
                  </TD>
                  <TD align="right" className="tabular font-semibold text-ink">
                    {result.percentage}%
                  </TD>
                  <TD>
                    <Badge tone={result.passed ? 'success' : 'primary'} dot>
                      {result.passed ? 'Pass' : 'Fail'}
                    </Badge>
                  </TD>
                  <TD align="right" className="tabular whitespace-nowrap text-muted">
                    {formatDuration(result.timeTakenSeconds)}
                  </TD>
                  <TD className="whitespace-nowrap text-muted">{formatDateTime(result.submittedAt)}</TD>
                  <TD align="right">
                    <Button size="sm" variant="secondary" onClick={() => setViewing(result)}>
                      View
                    </Button>
                  </TD>
                </TR>
            )}
            </TBody>
          </TableWrap>
        }
      </Panel>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.candidateName} — ${viewing.examName}` : 'Result'}
        description={viewing ? `Submitted ${formatDateTime(viewing.submittedAt)}` : undefined}>
        
        {viewing &&
        <>
            <div className="rounded-xl border border-line bg-surface-alt/50 p-5 text-center">
              <p className="tabular text-[40px] font-semibold leading-none tracking-[-0.04em] text-ink">
                {viewing.percentage}%
              </p>
              <p className="tabular mt-2 text-sm text-muted">
                {viewing.score} of {viewing.totalMarks} marks
              </p>
              <div className="mt-3 flex justify-center">
                <Badge tone={viewing.passed ? 'success' : 'primary'} dot>
                  {viewing.passed ? 'Passed' : 'Not passed'}
                </Badge>
              </div>
            </div>
            <dl className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
              {[
            ['Candidate', viewing.candidateName],
            ['Email', viewing.candidateEmail],
            ['Examination', viewing.examName],
            ['Time taken', formatDuration(viewing.timeTakenSeconds)],
            ['Submitted at', formatDateTime(viewing.submittedAt)]].
            map(([label, value]) =>
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="truncate text-sm font-medium text-ink">{value}</dd>
                </div>
            )}
            </dl>
          </>
        }
      </Modal>
    </>);

}