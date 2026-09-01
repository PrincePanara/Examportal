import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ActivityIcon,
  CheckCircle2Icon,
  FileTextIcon,
  PlayCircleIcon,
  PlusIcon,
  UsersIcon } from
'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { ExamStatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState, ErrorState, Panel, PanelHeader, StatSkeleton, TableSkeleton } from '../../components/ui/States';
import { TBody, TD, TH, THead, TR, TableWrap } from '../../components/ui/Table';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { formatDate, formatDateTime, greeting } from '../../utils/format';

export function Dashboard() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { exams, results, candidates, analytics, loading, loadError, reload, createExam } = useData();
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => {
    const active = exams.filter((exam) => exam.status === 'published').length;
    return {
      total: exams.length,
      active,
      users: candidates.length,
      completed: results.length
    };
  }, [exams, candidates, results]);

  const recentExams = useMemo(
    () =>
    [...exams].
    sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).
    slice(0, 6),
    [exams]
  );

  const recentSubmissions = useMemo(
    () =>
    [...results].
    sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).
    slice(0, 5),
    [results]
  );

  const onCreate = async () => {
    setCreating(true);
    const exam = await createExam();
    setCreating(false);
    if (exam) navigate(`/admin/exams/${exam.id}`);
  };

  if (loadError) {
    return <ErrorState description={loadError} onRetry={() => void reload()} />;
  }

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${admin?.name.split(' ')[0] ?? 'Admin'}`}
        description="Manage examinations, users, and results from one place."
        actions={
        <Button variant="primary" size="lg" loading={creating} onClick={onCreate}>
            <PlusIcon aria-hidden className="h-4 w-4" />
            Create new exam
          </Button>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ?
        Array.from({ length: 4 }).map((_, index) => <StatSkeleton key={index} />) :

        <>
            <StatCard label="Total exams" value={stats.total} icon={FileTextIcon} sub="Across all statuses" />
            <StatCard
            label="Active exams"
            value={stats.active}
            icon={PlayCircleIcon}
            emphasis
            sub="Currently accepting candidates" />
          
            <StatCard label="Total users" value={stats.users.toLocaleString()} icon={UsersIcon} sub="Registered candidates" />
            <StatCard
            label="Completed exams"
            value={stats.completed.toLocaleString()}
            icon={CheckCircle2Icon}
            sub="Submitted sessions all time" />
          
          </>
        }
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Panel className="overflow-hidden xl:col-span-2">
          <PanelHeader
            title="Recent exams"
            description="Newest examinations and their current availability"
            action={
            <Link to="/admin/exams">
                <Button size="sm" variant="ghost">
                  View all
                </Button>
              </Link>
            } />
          
          {loading ?
          <TableSkeleton rows={5} columns={5} /> :
          recentExams.length === 0 ?
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


          <TableWrap>
              <THead>
                <TH>Exam</TH>
                <TH>Status</TH>
                <TH align="right">Questions</TH>
                <TH align="right">Duration</TH>
                <TH align="right">Participants</TH>
                <TH>Created</TH>
                <TH align="right">Actions</TH>
              </THead>
              <TBody>
                {recentExams.map((exam) =>
              <TR key={exam.id}>
                    <TD>
                      <p className="font-medium leading-tight text-ink">{exam.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted">{exam.credentials.examId}</p>
                    </TD>
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
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/admin/preview/${exam.id}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost">
                            Preview
                          </Button>
                        </Link>
                        <Link to={`/admin/exams/${exam.id}`}>
                          <Button size="sm" variant="secondary">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </TD>
                  </TR>
              )}
              </TBody>
            </TableWrap>
          }
        </Panel>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader title="Recent submissions" description="Latest completed sessions" />
            {loading ?
            <div className="space-y-3 p-5">
                <TableSkeleton rows={4} columns={2} />
              </div> :
            recentSubmissions.length === 0 ?
            <EmptyState icon={CheckCircle2Icon} title="No submissions yet" description="Results appear here as candidates submit." /> :

            <ul className="divide-y divide-line">
                {recentSubmissions.map((result) =>
              <li key={result.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">{result.candidateName}</p>
                      <p className="truncate text-xs text-muted">{result.examName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular text-[13px] font-semibold text-ink">{result.percentage}%</p>
                      <p className={result.passed ? 'text-2xs font-semibold uppercase text-success' : 'text-2xs font-semibold uppercase text-primary'}>
                        {result.passed ? 'Pass' : 'Fail'}
                      </p>
                    </div>
                  </li>
              )}
              </ul>
            }
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader title="Activity log" description="Audit trail of administrator actions" />
            {analytics && analytics.auditLog.length > 0 ?
            <ul className="divide-y divide-line">
                {analytics.auditLog.map((entry) =>
              <li key={entry.id} className="flex gap-3 px-5 py-3">
                    <ActivityIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    <div className="min-w-0">
                      <p className="text-[13px] text-ink">{entry.action}</p>
                      <p className="text-xs text-muted">{formatDateTime(entry.at)}</p>
                    </div>
                  </li>
              )}
              </ul> :

            <EmptyState
              icon={ActivityIcon}
              title="No activity recorded"
              description="Administrator actions such as publishing an exam or regenerating credentials are logged here." />

            }
          </Panel>
        </div>
      </div>
    </>);

}