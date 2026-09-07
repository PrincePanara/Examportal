import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  GraduationCapIcon, LogOutIcon, KeyIcon, BookOpenIcon,
  TrophyIcon, ClockIcon, XIcon, EyeIcon, EyeOffIcon,
  AlertCircleIcon, ArrowRightIcon, CheckCircleIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useExamSession } from '../contexts/ExamSessionContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/examApi';
import type { ResultRecord } from '../types';
import { formatDateTime, formatDuration } from '../utils/format';

function ExamEntryModal({ onClose }: { onClose: () => void }) {
  const { authorize, isAuthorizing, gateError, clearGateError } = useExamSession();
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState({ code: false, password: false });

  const codeError = touched.code && !examCode.trim() ? 'Enter the Exam ID provided to you.' : undefined;
  const passwordError = touched.password && !password ? 'Enter the exam password.' : undefined;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ code: true, password: true });
    if (!examCode.trim() || !password) return;
    const ok = await authorize(examCode, password);
    if (ok) {
      onClose();
      navigate('/exam');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 rounded-2xl border border-line bg-surface shadow-xl duration-200">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <KeyIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Enter Exam</h2>
              <p className="text-xs text-muted">Use credentials from your administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={onSubmit} noValidate className="p-6 space-y-4">
          {gateError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            >
              <AlertCircleIcon className="mt-px h-4 w-4 shrink-0" />
              {gateError}
            </div>
          )}

          {/* Exam ID */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor="exam-code-input">
              Exam ID <span className="text-red-500">*</span>
            </label>
            <input
              id="exam-code-input"
              type="text"
              value={examCode}
              placeholder="e.g. REACT-2026"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => { setExamCode(e.target.value); clearGateError(); }}
              onBlur={() => setTouched(t => ({ ...t, code: true }))}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-[14px] uppercase tracking-wide text-ink placeholder:normal-case placeholder:text-muted/60 placeholder:tracking-normal outline-none transition-colors bg-canvas focus:border-primary focus:ring-2 focus:ring-primary/20 ${codeError ? 'border-red-400' : 'border-line'}`}
            />
            {codeError && <p className="mt-1 text-xs text-red-500">{codeError}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink" htmlFor="exam-password-input">
              Exam Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="exam-password-input"
                type={reveal ? 'text' : 'password'}
                value={password}
                placeholder="••••••••"
                autoComplete="off"
                onChange={(e) => { setPassword(e.target.value); clearGateError(); }}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-[14px] text-ink placeholder:text-muted/60 outline-none transition-colors bg-canvas focus:border-primary focus:ring-2 focus:ring-primary/20 ${passwordError ? 'border-red-400' : 'border-line'}`}
              />
              <button
                type="button"
                onClick={() => setReveal(r => !r)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                {reveal ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
          </div>

          <button
            type="submit"
            id="enter-exam-submit"
            disabled={isAuthorizing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAuthorizing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying…
              </>
            ) : (
              <>
                Enter Exam
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { studentUser, isStudentAuthenticated, logout, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showExamModal, setShowExamModal] = useState(false);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  React.useEffect(() => {
    if (studentUser) {
      api.getUserResults(studentUser.uid)
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoadingResults(false));
    }
  }, [studentUser]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  if (!isStudentAuthenticated) return <Navigate to="/login" replace />;

  const user = studentUser!;
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalExams = results.length;
  const bestScore = totalExams > 0 ? Math.max(...results.map(r => r.percentage)) : 0;
  const passed = results.filter(r => r.passed).length;
  const failed = totalExams - passed;
  const avgScore = totalExams > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / totalExams : 0;

  const stats = [
    { label: 'Exams Taken', value: totalExams.toString(), icon: BookOpenIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Best Score', value: totalExams > 0 ? `${bestScore}%` : 'N/A', icon: TrophyIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Passed / Failed', value: `${passed} / ${failed}`, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Avg. Score', value: totalExams > 0 ? `${avgScore.toFixed(1)}%` : 'N/A', icon: ClockIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-surface/95 px-5 backdrop-blur-sm sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCapIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ink">ExamPortal</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2.5">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-line object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <span className="hidden text-[13px] font-medium text-ink sm:block">{user.name.split(' ')[0]}</span>
          </div>

          <button
            id="logout-btn"
            onClick={async () => { await logout(); navigate('/login'); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">

        {/* Welcome section */}
        <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="h-16 w-16 rounded-2xl ring-4 ring-line object-cover shadow-lg" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm text-muted">Welcome back,</p>
              <h1 className="text-2xl font-bold tracking-tight text-ink">{user.name}</h1>
              <p className="mt-0.5 text-sm text-muted">{user.email}</p>
            </div>
          </div>

          {/* CTA: Enter Exam or Disabled Banner */}
          {user.status === 'disabled' ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Your account has been disabled by the administrator. You cannot take any examinations.</p>
            </div>
          ) : (
            <button
              id="enter-exam-btn"
              onClick={() => setShowExamModal(true)}
              className="flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
            >
              <KeyIcon className="h-4 w-4" />
              Enter Exam ID &amp; Password
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-raised">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xl font-bold tracking-tight text-ink">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity / Exam History */}
        <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-[15px] font-semibold text-ink">Exam History</h2>
            <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-semibold text-muted">{results.length}</span>
          </div>
          
          {loadingResults ? (
            <div className="p-8 text-center text-sm text-muted">Loading history...</div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt">
                <BookOpenIcon className="h-5 w-5 text-muted" />
              </div>
              <p className="text-sm font-semibold text-ink">No exams yet</p>
              <p className="mt-1 text-xs text-muted">
                {user.status === 'disabled'
                  ? 'Your account is disabled.'
                  : 'Enter an Exam ID and password to get started.'}
              </p>
              {user.status !== 'disabled' && (
                <button
                  onClick={() => setShowExamModal(true)}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface hover:border-primary/40"
                >
                  <KeyIcon className="h-4 w-4 text-primary" />
                  Enter Exam
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="bg-surface-alt/50 text-xs text-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium">Exam Name</th>
                    <th className="px-6 py-3 font-medium">Submitted</th>
                    <th className="px-6 py-3 font-medium text-right">Score</th>
                    <th className="px-6 py-3 font-medium text-center">Result</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {results.map((result) => (
                    <tr key={result.id} className="transition-colors hover:bg-surface-alt/30">
                      <td className="px-6 py-4 font-medium">{result.examName}</td>
                      <td className="px-6 py-4 text-muted whitespace-nowrap">{formatDateTime(result.submittedAt)}</td>
                      <td className="px-6 py-4 text-right font-medium">{result.percentage}% <span className="text-xs font-normal text-muted">({result.score}/{result.totalMarks})</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${result.passed ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/review/${result.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg text-sm font-medium text-primary hover:text-primary-dark hover:underline"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info banner */}
        {user.status !== 'disabled' && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted">
            <span className="font-semibold text-primary">Tip:</span> Your administrator will provide you with an Exam ID and a password. Click "Enter Exam ID &amp; Password" above to begin.
          </div>
        )}
      </main>

      {/* Exam Entry Modal */}
      {showExamModal && <ExamEntryModal onClose={() => setShowExamModal(false)} />}
    </div>
  );
}
