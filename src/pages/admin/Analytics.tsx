import React, { useMemo } from 'react';
import { BarChart3Icon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { DifficultyBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, Panel, PanelHeader, StatSkeleton, TableSkeleton } from '../../components/ui/States';
import { TBody, TD, TH, THead, TR, TableWrap } from '../../components/ui/Table';
import { useData } from '../../contexts/DataContext';
import { formatDuration } from '../../utils/format';

export function Analytics() {
  const { exams, results, analytics, loading, loadError, reload } = useData();

  const derived = useMemo(() => {
    const average =
    results.length > 0 ? results.reduce((sum, result) => sum + result.percentage, 0) / results.length : 0;
    const passRate =
    results.length > 0 ? results.filter((result) => result.passed).length / results.length * 100 : 0;
    const perExam = exams.
    map((exam) => {
      const rows = results.filter((result) => result.examId === exam.id);
      const avg = rows.length > 0 ? rows.reduce((sum, row) => sum + row.percentage, 0) / rows.length : 0;
      const pass = rows.length > 0 ? rows.filter((row) => row.passed).length / rows.length * 100 : 0;
      const time = rows.length > 0 ? rows.reduce((sum, row) => sum + row.timeTakenSeconds, 0) / rows.length : 0;
      return {
        id: exam.id,
        name: exam.name,
        attempts: rows.length,
        average: Number(avg.toFixed(1)),
        passRate: Math.round(pass),
        averageTime: Math.round(time)
      };
    }).
    filter((row) => row.attempts > 0).
    sort((a, b) => b.attempts - a.attempts);

    return { average: Number(average.toFixed(1)), passRate: Math.round(passRate), perExam };
  }, [exams, results]);

  const hardest = useMemo(
    () => [...(analytics?.questionPerformance ?? [])].sort((a, b) => a.correctRate - b.correctRate),
    [analytics]
  );

  if (loadError) return <ErrorState description={loadError} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Understand exam quality, candidate performance, and where papers are too hard or too easy."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Analytics' }]} />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading || !analytics ?
        Array.from({ length: 6 }).map((_, index) => <StatSkeleton key={index} />) :

        <>
            <StatCard label="Total exams" value={exams.length} sub="Across all statuses" />
            <StatCard label="Total attempts" value={analytics.totals.totalAttempts.toLocaleString()} sub="Sessions started all time" />
            <StatCard
            label="Completion rate"
            value={`${analytics.totals.completionRate}%`}
            progress={analytics.totals.completionRate}
            sub="Sessions that reached submission" />
          
            <StatCard label="Average score" value={`${derived.average}%`} emphasis progress={derived.average} />
            <StatCard label="Pass rate" value={`${derived.passRate}%`} progress={derived.passRate} />
            <StatCard
            label="Average completion time"
            value={formatDuration(analytics.totals.averageCompletionSeconds)}
            sub="From session start to submission" />
          
          </>
        }
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel className="overflow-hidden">
          <PanelHeader title="Exam performance" description="Attempts, scores, and pace per examination" />
          {loading ?
          <TableSkeleton rows={4} columns={4} /> :
          derived.perExam.length === 0 ?
          <EmptyState
            icon={BarChart3Icon}
            title="No attempts recorded yet"
            description="Exam-level analytics appear once candidates start submitting." /> :


          <TableWrap className="min-w-0">
              <THead>
                <TH>Exam</TH>
                <TH align="right">Attempts</TH>
                <TH align="right">Avg score</TH>
                <TH align="right">Pass rate</TH>
                <TH align="right">Avg time</TH>
              </THead>
              <TBody>
                {derived.perExam.map((row) =>
              <TR key={row.id}>
                    <TD className="font-medium">{row.name}</TD>
                    <TD align="right" className="tabular text-muted">
                      {row.attempts}
                    </TD>
                    <TD align="right" className="tabular font-semibold">
                      {row.average}%
                    </TD>
                    <TD align="right" className="tabular text-muted">
                      {row.passRate}%
                    </TD>
                    <TD align="right" className="tabular whitespace-nowrap text-muted">
                      {formatDuration(row.averageTime)}
                    </TD>
                  </TR>
              )}
              </TBody>
            </TableWrap>
          }
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader
            title="Question-level performance"
            description="Hardest questions first — a very low correct rate often signals an unclear question" />
          
          {loading || !analytics ?
          <TableSkeleton rows={6} columns={2} /> :
          hardest.length === 0 ?
          <EmptyState
            icon={BarChart3Icon}
            title="No question data yet"
            description="Per-question statistics build up as candidates answer live examinations." /> :


          <ul className="divide-y divide-line">
              {hardest.map((question, index) =>
            <li key={question.questionId} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
                        Question {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-medium leading-snug text-ink">{question.prompt}</p>
                    </div>
                    <DifficultyBadge difficulty={question.difficulty} />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-soft">
                      <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${question.correctRate}%` }}
                    role="progressbar"
                    aria-valuenow={question.correctRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Correct rate for ${question.prompt}`} />
                  
                    </div>
                    <p className="tabular shrink-0 text-xs text-muted">
                      <span className="font-semibold text-success">{question.correctRate}% correct</span>
                      <span className="mx-1.5 text-line-strong">·</span>
                      <span className="font-semibold text-primary">{100 - question.correctRate}% incorrect</span>
                    </p>
                  </div>
                </li>
            )}
            </ul>
          }
        </Panel>
      </div>
    </>);

}