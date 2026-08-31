import React, { useEffect, useState, useMemo } from 'react';
import { UsersIcon, BarChart3Icon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Select } from '../../components/ui/Field';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, Panel, TableSkeleton } from '../../components/ui/States';
import { TBody, TD, TH, THead, TR, TableWrap } from '../../components/ui/Table';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/examApi';
import type { ExamAttempt } from '../../types';
import { formatDateTime } from '../../utils/format';

export function ExamAnalytics() {
  const { exams, loading: dataLoading, loadError, reload } = useData();
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedExamId === 'all') {
      setAttempts([]);
      return;
    }
    
    let active = true;
    setLoadingAttempts(true);
    setFetchError(null);
    
    api.getExamAttempts(selectedExamId)
      .then((data) => {
        if (active) {
          setAttempts(data);
          setLoadingAttempts(false);
        }
      })
      .catch((err) => {
        if (active) {
          setFetchError(err.message || 'Failed to fetch attempts');
          setLoadingAttempts(false);
        }
      });
      
    return () => { active = false; };
  }, [selectedExamId]);

  const stats = useMemo(() => {
    const totalJoined = attempts.length;
    const totalSubmitted = attempts.filter((a) => a.status === 'submitted').length;
    const totalInProgress = totalJoined - totalSubmitted;
    
    return {
      totalJoined,
      totalSubmitted,
      totalInProgress
    };
  }, [attempts]);

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeader
        title="Exam Participants & Analytics"
        description="Monitor who has joined, who is in progress, and who has submitted."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Exam Analytics' }]}
      />

      <div className="mb-6 max-w-md">
        <label htmlFor="exam-select" className="mb-1 block text-sm font-medium text-ink">Select Examination</label>
        <Select id="exam-select" aria-label="Select Exam" value={selectedExamId} onChange={(event) => setSelectedExamId(event.target.value)}>
          <option value="all">-- Please select an exam --</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </Select>
      </div>

      {selectedExamId !== 'all' && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Joined/Started" value={stats.totalJoined} sub="All users who opened the exam" />
          <StatCard label="In Progress" value={stats.totalInProgress} sub="Currently taking the exam" />
          <StatCard label="Submitted" value={stats.totalSubmitted} sub="Completed attempts" />
        </div>
      )}

      <Panel className="overflow-hidden">
        {dataLoading || loadingAttempts ? (
          <TableSkeleton rows={5} columns={6} />
        ) : selectedExamId === 'all' ? (
          <EmptyState
            icon={BarChart3Icon}
            title="Select an exam"
            description="Choose an examination from the dropdown above to view participant analytics."
          />
        ) : fetchError ? (
          <ErrorState description={fetchError} onRetry={() => setSelectedExamId(selectedExamId)} />
        ) : attempts.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No participants yet"
            description="No one has started this examination yet."
          />
        ) : (
          <TableWrap>
            <THead>
              <TH>Candidate</TH>
              <TH>Status</TH>
              <TH>Started</TH>
              <TH>Submitted</TH>
              <TH align="right">Score / Percentage</TH>
              <TH>Result</TH>
            </THead>
            <TBody>
              {attempts.map((attempt) => (
                <TR key={attempt.id}>
                  <TD>
                    <p className="font-medium text-ink">{attempt.userName}</p>
                    <p className="text-xs text-muted">{attempt.userEmail || '—'}</p>
                  </TD>
                  <TD>
                    <Badge tone={attempt.status === 'submitted' ? 'success' : 'primary'} dot>
                      {attempt.status === 'submitted' ? 'Submitted' : 'In Progress'}
                    </Badge>
                  </TD>
                  <TD className="whitespace-nowrap text-muted">{formatDateTime(attempt.startedAt)}</TD>
                  <TD className="whitespace-nowrap text-muted">
                    {attempt.submittedAt ? formatDateTime(attempt.submittedAt) : '—'}
                  </TD>
                  <TD align="right" className="tabular text-muted">
                    {attempt.status === 'submitted' && attempt.score !== undefined ? (
                      <span className="font-medium text-ink">{attempt.score} <span className="text-xs font-normal text-muted">({attempt.percentage}%)</span></span>
                    ) : (
                      '—'
                    )}
                  </TD>
                  <TD>
                    {attempt.status === 'submitted' && attempt.passed !== undefined ? (
                       <Badge tone={attempt.passed ? 'success' : 'primary'}>
                         {attempt.passed ? 'Pass' : 'Fail'}
                       </Badge>
                    ) : (
                      '—'
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableWrap>
        )}
      </Panel>
    </>
  );
}
