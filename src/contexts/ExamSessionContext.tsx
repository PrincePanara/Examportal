import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError, examTotalMarks } from '../services/examApi';
import type { AnswerMap, Exam, ExamSession, SubmissionReceipt } from '../types';
import { uid } from '../utils/format';

export type ExamStage = 'gate' | 'instructions' | 'active' | 'submitted';
export type SaveState = 'idle' | 'saving' | 'saved' | 'offline';

interface ExamSessionContextValue {
  stage: ExamStage;
  session: ExamSession | null;
  isPreview: boolean;
  answers: AnswerMap;
  marked: string[];
  currentIndex: number;
  saveState: SaveState;
  gateError: string | null;
  isAuthorizing: boolean;
  isStarting: boolean;
  isSubmitting: boolean;
  receipt: SubmissionReceipt | null;
  authorizedExamId: string | null;
  authorize: (examCode: string, password: string) => Promise<boolean>;
  startSession: (candidateName?: string) => Promise<boolean>;
  startPreview: (exam: Exam) => void;
  selectAnswer: (questionId: string, optionIds: string[]) => void;
  toggleMark: (questionId: string) => void;
  goToIndex: (index: number) => void;
  submit: (reason?: 'manual' | 'timeout') => Promise<void>;
  reset: () => void;
  clearGateError: () => void;
}

const ExamSessionContext = createContext<ExamSessionContextValue | null>(null);

export function ExamSessionProvider({ children }: {children: React.ReactNode;}) {
  const [stage, setStage] = useState<ExamStage>('gate');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isPreview, setPreview] = useState(false);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [marked, setMarked] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [gateError, setGateError] = useState<string | null>(null);
  const [isAuthorizing, setAuthorizing] = useState(false);
  const [isStarting, setStarting] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [authorizedExamId, setAuthorizedExamId] = useState<string | null>(null);

  const retryTimer = useRef<number | null>(null);
  const pending = useRef<AnswerMap>({});
  const submittedOnce = useRef(false);

  const authorize = useCallback(async (examCode: string, password: string) => {
    setAuthorizing(true);
    setGateError(null);
    try {
      const { examId } = await api.authorizeExam(examCode, password);
      setAuthorizedExamId(examId);
      setStage('instructions');
      return true;
    } catch (err) {
      setGateError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      return false;
    } finally {
      setAuthorizing(false);
    }
  }, []);

  const startSession = useCallback(
    async (candidateName = 'Aditi Sharma') => {
      if (!authorizedExamId) return false;
      setStarting(true);
      try {
        const next = await api.startSession(authorizedExamId, candidateName);
        submittedOnce.current = false;
        setSession(next);
        setAnswers({});
        setMarked([]);
        setCurrentIndex(0);
        setSaveState('idle');
        setPreview(false);
        setStage('active');
        return true;
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'We could not start your examination.');
        return false;
      } finally {
        setStarting(false);
      }
    },
    [authorizedExamId]
  );

  const startPreview = useCallback((exam: Exam) => {
    const startedAt = Date.now();
    submittedOnce.current = false;
    setSession({
      id: uid('preview'),
      exam: JSON.parse(JSON.stringify(exam)) as Exam,
      candidateName: 'Preview candidate',
      startedAt,
      expiresAt: startedAt + exam.rules.durationMinutes * 60 * 1000,
      answers: {},
      marked: [],
      currentIndex: 0,
      submitted: false
    });
    setAnswers({});
    setMarked([]);
    setCurrentIndex(0);
    setSaveState('idle');
    setReceipt(null);
    setPreview(true);
    setStage('active');
  }, []);

  const persist = useCallback(
    (sessionId: string, questionId: string, optionIds: string[]) => {
      setSaveState('saving');
      pending.current[questionId] = optionIds;
      api.
      saveAnswer(sessionId, questionId, optionIds).
      then(() => {
        delete pending.current[questionId];
        setSaveState((current) => {
          if (current === 'offline') toast.success('Connection restored');
          return 'saved';
        });
      }).
      catch((err) => {
        if (err instanceof ApiError && err.code === 'network') {
          setSaveState('offline');
          if (retryTimer.current) window.clearTimeout(retryTimer.current);
          retryTimer.current = window.setTimeout(() => {
            const entries = Object.entries(pending.current);
            if (entries.length === 0) return;
            const [nextId, nextValue] = entries[0];
            persist(sessionId, nextId, nextValue);
          }, 2400);
        } else {
          setSaveState('offline');
        }
      });
    },
    []
  );

  const selectAnswer = useCallback(
    (questionId: string, optionIds: string[]) => {
      setAnswers((current) => ({ ...current, [questionId]: optionIds }));
      if (!session || isPreview) {
        setSaveState('saved');
        return;
      }
      persist(session.id, questionId, optionIds);
    },
    [session, isPreview, persist]
  );

  const toggleMark = useCallback(
    (questionId: string) => {
      setMarked((current) => {
        const next = current.includes(questionId) ?
        current.filter((id) => id !== questionId) :
        [...current, questionId];
        if (session && !isPreview) void api.setMarked(session.id, next).catch(() => undefined);
        return next;
      });
    },
    [session, isPreview]
  );

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const submit = useCallback(
    async (reason: 'manual' | 'timeout' = 'manual') => {
      if (!session || submittedOnce.current) return;
      submittedOnce.current = true;
      setSubmitting(true);
      try {
        if (isPreview) {
          const total = examTotalMarks(session.exam);
          const answered = session.exam.questions.filter((q) => (answers[q.id] ?? []).length > 0).length;
          setReceipt({
            sessionId: session.id,
            submittedAt: new Date().toISOString(),
            answered,
            unanswered: session.exam.questions.length - answered,
            marked: marked.length,
            score: null,
            totalMarks: total,
            percentage: null,
            passed: null,
            resultVisible: false
          });
        } else {
          const result = await api.submitSession(session.id, answers, marked, reason);
          setReceipt(result);
        }
        setStage('submitted');
        if (reason === 'timeout') toast.info('Time expired — your examination was submitted automatically.');
      } catch (err) {
        submittedOnce.current = false;
        toast.error(err instanceof ApiError ? err.message : 'We could not submit your examination.');
      } finally {
        setSubmitting(false);
      }
    },
    [session, isPreview, answers, marked]
  );

  const reset = useCallback(() => {
    if (retryTimer.current) window.clearTimeout(retryTimer.current);
    pending.current = {};
    submittedOnce.current = false;
    setStage('gate');
    setSession(null);
    setAnswers({});
    setMarked([]);
    setCurrentIndex(0);
    setSaveState('idle');
    setReceipt(null);
    setGateError(null);
    setAuthorizedExamId(null);
    setPreview(false);
  }, []);

  const clearGateError = useCallback(() => setGateError(null), []);

  const value = useMemo(
    () => ({
      stage,
      session,
      isPreview,
      answers,
      marked,
      currentIndex,
      saveState,
      gateError,
      isAuthorizing,
      isStarting,
      isSubmitting,
      receipt,
      authorizedExamId,
      authorize,
      startSession,
      startPreview,
      selectAnswer,
      toggleMark,
      goToIndex,
      submit,
      reset,
      clearGateError
    }),
    [
    stage,
    session,
    isPreview,
    answers,
    marked,
    currentIndex,
    saveState,
    gateError,
    isAuthorizing,
    isStarting,
    isSubmitting,
    receipt,
    authorizedExamId,
    authorize,
    startSession,
    startPreview,
    selectAnswer,
    toggleMark,
    goToIndex,
    submit,
    reset,
    clearGateError]

  );

  return <ExamSessionContext.Provider value={value}>{children}</ExamSessionContext.Provider>;
}

export function useExamSession(): ExamSessionContextValue {
  const context = useContext(ExamSessionContext);
  if (!context) throw new Error('useExamSession must be used inside ExamSessionProvider');
  return context;
}