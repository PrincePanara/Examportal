import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExamRunner } from '../../components/exam/ExamRunner';
import { Completion } from '../exam/Completion';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useExamSession } from '../../contexts/ExamSessionContext';

export function StudentPreview() {
  const { examId } = useParams<{examId: string;}>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { exams, loading } = useData();
  const { startPreview, stage, session, isPreview, reset } = useExamSession();

  const exam = exams.find((item) => item.id === examId);

  useEffect(() => {
    if (!exam) return;
    if (!session || !isPreview || session.exam.id !== exam.id) {
      startPreview(exam);
    }
  }, [exam, session, isPreview, startPreview]);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  if (loading && !exam) {
    return (
      <div className="min-h-screen space-y-4 bg-canvas p-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>);

  }

  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <ErrorState
          title="Examination not found"
          description="This examination may have been deleted. Return to the exams list to continue."
          onRetry={() => navigate('/admin/exams')} />
        
      </div>);

  }

  if (exam.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <ErrorState
          title="Nothing to preview yet"
          description="Add at least one question to preview this examination the way candidates will see it."
          onRetry={() => navigate(`/admin/exams/${exam.id}`)} />
        
      </div>);

  }

  if (stage === 'submitted') {
    return (
      <Completion
        exitLabel="Back to builder"
        onExit={() => {
          reset();
          navigate(`/admin/exams/${exam.id}`);
        }} />);


  }

  return <ExamRunner />;
}