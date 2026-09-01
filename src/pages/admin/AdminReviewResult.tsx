import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, DownloadIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { ResultRecord } from '../../types';
import { formatDateTime } from '../../utils/format';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function AdminReviewResult() {
  const { resultId } = useParams();
  const { isAdminAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<ResultRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId || !isAdminAuthenticated) return;

    let active = true;
    setLoading(true);

    getDoc(doc(db, 'results', resultId))
      .then((snap) => {
        if (!active) return;
        if (!snap.exists()) {
          setError('Exam result not found.');
          return;
        }
        setResult(snap.data() as ResultRecord);
      })
      .catch(() => {
        if (active) setError('Failed to load exam result.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [resultId, isAdminAuthenticated]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" /></div>;
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircleIcon className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-ink">Error</h1>
        <p className="mt-2 text-muted">{error || 'Something went wrong.'}</p>
        <button onClick={() => navigate('/admin/results')} className="mt-6 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white">
          Back to Results
        </button>
      </div>
    );
  }

  const { questions = [], answers = {} } = result;

  const exportPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Detailed Examination Result', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Candidate: ${result.candidateName} (${result.candidateEmail})`, 14, 32);
    doc.text(`Exam: ${result.examName} (${result.examId})`, 14, 38);
    doc.text(`Submitted: ${formatDateTime(result.submittedAt)}`, 14, 44);
    
    doc.setTextColor(0);
    doc.text(`Score: ${result.score} / ${result.totalMarks} (${result.percentage}%) - ${result.passed ? 'PASSED' : 'FAILED'}`, 14, 52);
    doc.text(`Total Questions: ${questions.length} | Answered: ${Object.keys(answers).length}`, 14, 58);
    
    const tableData: any[][] = [];
    
    questions.forEach((q, idx) => {
      const selectedIds = answers[q.id] || [];
      const isCorrect = 
        selectedIds.length === q.correctOptionIds.length && 
        selectedIds.every(id => q.correctOptionIds.includes(id));
      const isSkipped = selectedIds.length === 0;
      
      const status = isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect';
      
      const selectedText = selectedIds.map(id => {
        const opt = q.options.find(o => o.id === id);
        return opt ? opt.text : '';
      }).join(', ');
      
      const correctText = q.correctOptionIds.map(id => {
        const opt = q.options.find(o => o.id === id);
        return opt ? opt.text : '';
      }).join(', ');
      
      tableData.push([
        `Q${idx + 1}. ${q.prompt}`,
        status,
        selectedText || 'None',
        correctText
      ]);
    });

    autoTable(doc, {
      startY: 65,
      head: [['Question', 'Status', 'Selected Answer', 'Correct Answer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [63, 63, 70] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 20 },
        2: { cellWidth: 45 },
        3: { cellWidth: 45 }
      }
    });

    doc.save(`result-${result.candidateName.replace(/\s+/g, '-')}-${result.examId}.pdf`);
    toast.success('PDF exported successfully');
  };

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <button
            onClick={() => navigate('/admin/results')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-alt"
          >
            <ArrowLeftIcon className="h-5 w-5 text-ink" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-ink">Review: {result.examName}</h1>
            <p className="truncate text-sm text-muted">Candidate: {result.candidateName} ({result.candidateEmail})</p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xl font-bold text-ink">{result.percentage}%</p>
              <p className={`text-xs font-semibold uppercase tracking-wider ${result.passed ? 'text-success' : 'text-primary'}`}>
                {result.passed ? 'Passed' : 'Failed'}
              </p>
            </div>
            <button
              onClick={exportPdf}
              className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-line"
            >
              <DownloadIcon className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-4xl px-5 sm:px-8">
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Score</p>
            <p className="mt-1 text-2xl font-bold text-ink">{result.score} <span className="text-sm font-normal text-muted">/ {result.totalMarks}</span></p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Questions</p>
            <p className="mt-1 text-2xl font-bold text-ink">{questions.length}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Answered</p>
            <p className="mt-1 text-2xl font-bold text-ink">{Object.keys(answers).length}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Time Taken</p>
            <p className="mt-1 text-2xl font-bold text-ink">{Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</p>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-12 text-center shadow-sm">
            <AlertCircleIcon className="mx-auto h-8 w-8 text-muted" />
            <h2 className="mt-4 text-lg font-semibold text-ink">No Questions Available</h2>
            <p className="mt-2 text-sm text-muted">The questions for this exam were not saved with the result.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedIds = answers[q.id] || [];
              const isCorrect = 
                selectedIds.length === q.correctOptionIds.length && 
                selectedIds.every(id => q.correctOptionIds.includes(id));
              
              const isPartiallyCorrect = 
                selectedIds.length > 0 && 
                !isCorrect && 
                selectedIds.every(id => q.correctOptionIds.includes(id));
              
              const isWrong = selectedIds.length > 0 && !isCorrect && !isPartiallyCorrect;
              const isSkipped = selectedIds.length === 0;

              return (
                <div key={q.id} className="rounded-2xl border border-line bg-surface shadow-sm overflow-hidden">
                  <div className={`flex items-center gap-3 border-b border-line px-5 py-3 ${isCorrect ? 'bg-success/5' : isSkipped ? 'bg-surface-alt/50' : 'bg-primary/5'}`}>
                    {isCorrect ? (
                      <CheckCircleIcon className="h-5 w-5 text-success" />
                    ) : isSkipped ? (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-primary" />
                    )}
                    <h3 className="font-semibold text-ink">Question {idx + 1}</h3>
                    <div className="ml-auto flex items-center gap-2 text-xs font-medium">
                      <span className="rounded bg-surface-alt px-2 py-1 text-muted">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-base text-ink mb-6">{q.prompt}</p>
                    
                    <div className="space-y-2.5">
                      {q.options.map(opt => {
                        const isSelected = selectedIds.includes(opt.id);
                        const isRightOption = q.correctOptionIds.includes(opt.id);
                        
                        let optionClass = "rounded-xl border p-3.5 transition-colors ";
                        let icon = null;
                        
                        if (isSelected && isRightOption) {
                          optionClass += "border-success bg-success/10";
                          icon = <CheckCircleIcon className="h-5 w-5 text-success" />;
                        } else if (isSelected && !isRightOption) {
                          optionClass += "border-primary bg-primary/10";
                          icon = <XCircleIcon className="h-5 w-5 text-primary" />;
                        } else if (!isSelected && isRightOption) {
                          optionClass += "border-success/50 bg-success/5";
                          icon = <CheckCircleIcon className="h-5 w-5 text-success opacity-50" />;
                        } else {
                          optionClass += "border-line bg-canvas";
                          icon = <div className="h-5 w-5 rounded-full border-2 border-line" />;
                        }

                        return (
                          <div key={opt.id} className={`flex items-start gap-3 ${optionClass}`}>
                            <div className="mt-0.5 shrink-0">{icon}</div>
                            <span className={`text-[15px] ${isSelected ? 'font-medium text-ink' : 'text-muted'}`}>
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
