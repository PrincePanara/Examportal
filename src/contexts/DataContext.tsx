import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '../services/examApi';
import type { Candidate, Exam, ExamStatus, Question, QuestionPerformance, ResultRecord } from '../types';

interface AnalyticsPayload {
  totals: {
    totalUsers: number;
    completedExams: number;
    totalAttempts: number;
    completionRate: number;
    averageCompletionSeconds: number;
  };
  questionPerformance: QuestionPerformance[];
  auditLog: {id: string;action: string;at: string;}[];
}

interface DataContextValue {
  exams: Exam[];
  bank: Question[];
  candidates: Candidate[];
  results: ResultRecord[];
  analytics: AnalyticsPayload | null;
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  createExam: () => Promise<Exam | null>;
  updateExam: (id: string, patch: Partial<Exam>, options?: {silent?: boolean;}) => Promise<Exam | null>;
  duplicateExam: (id: string) => Promise<Exam | null>;
  setExamStatus: (id: string, status: ExamStatus) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  regenerateCredentials: (id: string, regenerateId?: boolean) => Promise<Exam | null>;
  saveBankQuestion: (question: Question) => Promise<void>;
  deleteBankQuestion: (id: string) => Promise<void>;
  saveCandidate: (candidate: Candidate) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const message = (err: unknown, fallback = 'Something went wrong. Please try again.') =>
err instanceof ApiError ? err.message : fallback;

export function DataProvider({ children }: {children: React.ReactNode;}) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [bank, setBank] = useState<Question[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [nextExams, nextBank, nextCandidates, nextResults, nextAnalytics] = await Promise.all([
      api.listExams(),
      api.listQuestionBank(),
      api.listCandidates(),
      api.listResults(),
      api.analytics()]
      );
      setExams(nextExams);
      setBank(nextBank);
      setCandidates(nextCandidates);
      setResults(nextResults);
      setAnalytics(nextAnalytics);
    } catch (err) {
      setLoadError(message(err, "We couldn't load your workspace. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replaceExam = useCallback((exam: Exam) => {
    setExams((current) => {
      const exists = current.some((e) => e.id === exam.id);
      return exists ? current.map((e) => e.id === exam.id ? exam : e) : [exam, ...current];
    });
  }, []);

  const createExam = useCallback(async () => {
    try {
      const exam = await api.createExam();
      replaceExam(exam);
      return exam;
    } catch (err) {
      toast.error(message(err));
      return null;
    }
  }, [replaceExam]);

  const updateExam = useCallback(
    async (id: string, patch: Partial<Exam>, options?: {silent?: boolean;}) => {
      try {
        const exam = await api.updateExam(id, patch);
        replaceExam(exam);
        if (!options?.silent) toast.success('Changes saved');
        return exam;
      } catch (err) {
        toast.error(message(err, "We couldn't save your changes. Please try again."));
        return null;
      }
    },
    [replaceExam]
  );

  const duplicateExam = useCallback(
    async (id: string) => {
      try {
        const exam = await api.duplicateExam(id);
        replaceExam(exam);
        toast.success(`Duplicated as “${exam.name}”`);
        return exam;
      } catch (err) {
        toast.error(message(err));
        return null;
      }
    },
    [replaceExam]
  );

  const setExamStatus = useCallback(
    async (id: string, status: ExamStatus) => {
      try {
        const exam = await api.setExamStatus(id, status);
        replaceExam(exam);
        toast.success(`“${exam.name}” is now ${status}`);
      } catch (err) {
        toast.error(message(err));
      }
    },
    [replaceExam]
  );

  const deleteExam = useCallback(async (id: string) => {
    try {
      await api.deleteExam(id);
      setExams((current) => current.filter((e) => e.id !== id));
      toast.success('Examination deleted');
    } catch (err) {
      toast.error(message(err));
    }
  }, []);

  const regenerateCredentials = useCallback(
    async (id: string, regenerateId = false) => {
      try {
        const exam = await api.regenerateCredentials(id, regenerateId);
        replaceExam(exam);
        toast.success(regenerateId ? 'Exam ID and password regenerated' : 'Exam password regenerated');
        return exam;
      } catch (err) {
        toast.error(message(err));
        return null;
      }
    },
    [replaceExam]
  );

  const saveBankQuestion = useCallback(async (question: Question) => {
    try {
      const saved = await api.saveBankQuestion(question);
      setBank((current) => {
        const exists = current.some((q) => q.id === saved.id);
        return exists ? current.map((q) => q.id === saved.id ? saved : q) : [saved, ...current];
      });
      toast.success('Question saved to the bank');
    } catch (err) {
      toast.error(message(err));
    }
  }, []);

  const deleteBankQuestion = useCallback(async (id: string) => {
    try {
      await api.deleteBankQuestion(id);
      setBank((current) => current.filter((q) => q.id !== id));
      toast.success('Question removed from the bank');
    } catch (err) {
      toast.error(message(err));
    }
  }, []);

  const saveCandidate = useCallback(async (candidate: Candidate) => {
    try {
      const saved = await api.saveCandidate(candidate);
      setCandidates((current) => {
        const exists = current.some((c) => c.id === saved.id);
        return exists ? current.map((c) => c.id === saved.id ? saved : c) : [saved, ...current];
      });
      toast.success('User saved');
    } catch (err) {
      toast.error(message(err));
    }
  }, []);

  const value = useMemo(
    () => ({
      exams,
      bank,
      candidates,
      results,
      analytics,
      loading,
      loadError,
      reload,
      createExam,
      updateExam,
      duplicateExam,
      setExamStatus,
      deleteExam,
      regenerateCredentials,
      saveBankQuestion,
      deleteBankQuestion,
      saveCandidate
    }),
    [
    exams,
    bank,
    candidates,
    results,
    analytics,
    loading,
    loadError,
    reload,
    createExam,
    updateExam,
    duplicateExam,
    setExamStatus,
    deleteExam,
    regenerateCredentials,
    saveBankQuestion,
    deleteBankQuestion,
    saveCandidate]

  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside DataProvider');
  return context;
}