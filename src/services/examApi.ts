/**
 * examApi.ts — Firestore-backed examination service
 *
 * Exam CRUD (create, read, update, delete, credentials) → Firebase Firestore
 * Exam sessions (in-progress answers, grading, submission) → In-memory (per-session, by design)
 * Question bank, candidates, results, analytics → In-memory seed (admin-only, non-critical)
 *
 * This architecture means:
 *  - Admin creates/edits exams → stored in Firestore, persisted across sessions
 *  - User enters Exam ID + Password → verified against Firestore in real-time
 *  - The correct exam (with all questions, rules, settings) is loaded from Firestore
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { defaultRules, defaultSecurity } from '../data/exams';
import { platformTotals, seedCandidates, seedQuestionPerformance, seedResults } from '../data/people';
import { questionBank } from '../data/questionBank';
import type {
  AnswerMap,
  Candidate,
  Exam,
  ExamSession,
  ExamStatus,
  Question,
  ResultRecord,
  SubmissionReceipt,
  ExamAttempt,
  StudentUser,
} from '../types';
import { generateExamId, generatePassword, uid } from '../utils/format';

// ─── Error Types ─────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | 'invalid_credentials'
  | 'not_found'
  | 'exam_not_available'
  | 'exam_not_started'
  | 'exam_expired'
  | 'exam_full'
  | 'session_expired'
  | 'already_submitted'
  | 'network'
  | 'forbidden'
  | 'server';

export class ApiError extends Error {
  code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const EXAMS_COLLECTION = 'exams';
const ATTEMPTS_COLLECTION = 'examAttempts';

/** Serialize an Exam to a plain object safe for Firestore */
function toFirestore(exam: Exam): Record<string, unknown> {
  return JSON.parse(JSON.stringify(exam)) as Record<string, unknown>;
}

/** Read an exam doc from Firestore, throw if missing */
async function fetchExam(id: string): Promise<Exam> {
  const snap = await getDoc(doc(db, EXAMS_COLLECTION, id));
  if (!snap.exists()) throw new ApiError('not_found', 'This examination could not be found.');
  return snap.data() as Exam;
}

// ─── Flaky-network simulation (dev tool) ─────────────────────────────────────

let flakyNetwork = false;
let flakyStreak = 0;

export function setFlakyNetwork(enabled: boolean): void {
  flakyNetwork = enabled;
  flakyStreak = 0;
}

function maybeFail(): void {
  if (!flakyNetwork) return;
  flakyStreak += 1;
  if (flakyStreak % 3 === 1) {
    throw new ApiError('network', "We couldn't reach the server. Retrying…");
  }
}

// ─── In-memory: Sessions, question bank, candidates, results ─────────────────

interface InMemoryStore {
  bank: Question[];
  candidates: Candidate[];
  results: ResultRecord[];
  sessions: Record<string, ExamSession>;
  auditLog: { id: string; action: string; at: string }[];
}

const mem: InMemoryStore = {
  bank: clone(questionBank),
  candidates: clone(seedCandidates),
  results: clone(seedResults),
  sessions: {},
  auditLog: [],
};

function audit(action: string): void {
  mem.auditLog.unshift({ id: uid('audit'), action, at: new Date().toISOString() });
}

// ─── Grading ─────────────────────────────────────────────────────────────────

export function examTotalMarks(exam: Exam): number {
  return Number(exam.questions.reduce((sum, q) => sum + q.marks, 0).toFixed(2));
}

function gradeQuestion(
  question: Question,
  selected: string[],
  partialMarking: boolean,
  negativeMarking: boolean
): number {
  if (!selected || selected.length === 0) return 0;
  const correct = question.correctOptionIds;
  const correctPicked = selected.filter((id) => correct.includes(id));
  const wrongPicked = selected.filter((id) => !correct.includes(id));

  if (question.type === 'multiple') {
    if (wrongPicked.length > 0) return negativeMarking ? -question.negativeMarks : 0;
    if (correctPicked.length === correct.length) return question.marks;
    if (partialMarking) {
      return Number(((question.marks / correct.length) * correctPicked.length).toFixed(2));
    }
    return 0;
  }

  const isCorrect = correctPicked.length === correct.length && wrongPicked.length === 0;
  if (isCorrect) return question.marks;
  return negativeMarking ? -question.negativeMarks : 0;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {

  // ──────────────────────────────────────────────── Admin auth (in-memory)

  async adminLogin(email: string, password: string) {
    await wait(680);
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      throw new ApiError('invalid_credentials', 'Enter your email and password to continue.');
    }
    if (normalized !== 'princyo@gmail.com' || password !== 'princeyo@123') {
      throw new ApiError('invalid_credentials', 'Those credentials are incorrect. Please try again.');
    }
    audit('Admin signed in');
    return { id: 'adm_01', name: 'Prince Panara', email: 'princyo@gmail.com', role: 'Administrator' };
  },

  // ──────────────────────────────────────────────── Exams (Firestore)

  async listExams(): Promise<Exam[]> {
    const snap = await getDocs(collection(db, EXAMS_COLLECTION));
    const exams = snap.docs.map((d) => d.data() as Exam);
    // Sort newest first client-side (avoids needing a Firestore index)
    return exams.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getExam(id: string): Promise<Exam> {
    return fetchExam(id);
  },

  async createExam(): Promise<Exam> {
    const name = 'Untitled examination';
    const examId = uid('exam');
    const exam: Exam = {
      id: examId,
      name,
      description: '',
      instructions: 'Read every question carefully before answering. Your answers are saved automatically as you go.',
      category: 'General',
      status: 'draft',
      questions: [],
      rules: { ...defaultRules },
      security: { ...defaultSecurity },
      credentials: {
        examId: generateExamId(name),
        password: generatePassword(),
        enabled: false,
      },
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdAt: new Date().toISOString(),
      participants: 0,
    };
    await setDoc(doc(db, EXAMS_COLLECTION, examId), toFirestore(exam));
    audit(`Created exam draft ${exam.credentials.examId}`);
    return clone(exam);
  },

  async updateExam(id: string, patch: Partial<Exam>): Promise<Exam> {
    maybeFail();
    const current = await fetchExam(id);
    const updated: Exam = { ...current, ...patch };
    await setDoc(doc(db, EXAMS_COLLECTION, id), toFirestore(updated));
    audit(`Updated exam ${updated.credentials.examId}`);
    return clone(updated);
  },

  async duplicateExam(id: string): Promise<Exam> {
    const source = await fetchExam(id);
    const newId = uid('exam');
    const copy: Exam = {
      ...clone(source),
      id: newId,
      name: `${source.name} (copy)`,
      status: 'draft',
      participants: 0,
      createdAt: new Date().toISOString(),
      credentials: {
        examId: generateExamId(source.name),
        password: generatePassword(),
        enabled: false,
      },
    };
    await setDoc(doc(db, EXAMS_COLLECTION, newId), toFirestore(copy));
    audit(`Duplicated exam ${source.credentials.examId}`);
    return clone(copy);
  },

  async setExamStatus(id: string, status: ExamStatus): Promise<Exam> {
    const exam = await fetchExam(id);
    const enabled = status === 'published' || status === 'scheduled';
    const updated: Exam = {
      ...exam,
      status,
      credentials: { ...exam.credentials, enabled },
    };
    await setDoc(doc(db, EXAMS_COLLECTION, id), toFirestore(updated));
    audit(`Set ${exam.credentials.examId} to ${status}`);
    return clone(updated);
  },

  async deleteExam(id: string): Promise<void> {
    const exam = await fetchExam(id);
    await deleteDoc(doc(db, EXAMS_COLLECTION, id));
    audit(`Deleted exam ${exam.credentials.examId}`);
  },

  async regenerateCredentials(id: string, regenerateId = false): Promise<Exam> {
    const exam = await fetchExam(id);
    const newCreds = {
      ...exam.credentials,
      password: generatePassword(),
      ...(regenerateId ? { examId: generateExamId(exam.name) } : {}),
    };
    const updated: Exam = { ...exam, credentials: newCreds };
    await updateDoc(doc(db, EXAMS_COLLECTION, id), { credentials: newCreds });
    audit(`Regenerated credentials for ${newCreds.examId}`);
    return clone(updated);
  },

  // ──────────────────────────────────────────────── Question bank (in-memory)

  async listQuestionBank(): Promise<Question[]> {
    await wait(340);
    return clone(mem.bank);
  },

  async saveBankQuestion(question: Question): Promise<Question> {
    await wait(280);
    const index = mem.bank.findIndex((q) => q.id === question.id);
    if (index >= 0) mem.bank[index] = clone(question);
    else mem.bank.unshift(clone(question));
    audit(`Saved question ${question.id} to the bank`);
    return clone(question);
  },

  async deleteBankQuestion(id: string): Promise<void> {
    await wait(240);
    mem.bank = mem.bank.filter((q) => q.id !== id);
    audit(`Removed question ${id} from the bank`);
  },

  // ──────────────────────────────────────────────── Candidates (Firestore)

  async listCandidates(): Promise<Candidate[]> {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => {
      const data = d.data() as StudentUser;
      return {
        id: data.uid,
        name: data.name,
        email: data.email,
        photoURL: data.photoURL,
        status: 'active',
        examsAttempted: 0,
        lastActivity: data.createdAt,
      } as Candidate;
    }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  },

  async saveCandidate(candidate: Candidate): Promise<Candidate> {
    await wait(300);
    const index = mem.candidates.findIndex((c) => c.id === candidate.id);
    if (index >= 0) mem.candidates[index] = clone(candidate);
    else mem.candidates.unshift(clone(candidate));
    audit(`Saved user ${candidate.email}`);
    return clone(candidate);
  },

  // ──────────────────────────────────────────────── Results (Firestore)

  async listResults(): Promise<ResultRecord[]> {
    const snap = await getDocs(collection(db, 'results'));
    const results = snap.docs.map((d) => d.data() as ResultRecord);
    return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  async getUserResults(userId: string): Promise<ResultRecord[]> {
    const q = query(collection(db, 'results'), where('candidateId', '==', userId));
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => d.data() as ResultRecord);
    return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  async analytics() {
    await wait(460);
    return {
      totals: platformTotals,
      questionPerformance: clone(seedQuestionPerformance),
      auditLog: clone(mem.auditLog).slice(0, 8),
    };
  },

  // ──────────────────────────────────────────────── Exam portal (Firestore)

  /**
   * Verify Exam ID + Password against Firestore.
   * Queries the exams collection by examId field (case-insensitive via normalization).
   */
  async authorizeExam(examCode: string, password: string, userId?: string) {
    const normalizedCode = examCode.trim().toUpperCase();

    // Query Firestore for an exam with this credentials.examId
    // We store examIds as UPPERCASE, so this is an exact match
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('credentials.examId', '==', normalizedCode)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new ApiError('invalid_credentials', 'Exam ID or password is incorrect.');
    }

    const exam = snap.docs[0].data() as Exam;

    // Check password
    if (exam.credentials.password !== password) {
      throw new ApiError('invalid_credentials', 'Exam ID or password is incorrect.');
    }

    // Check enabled & status
    if (!exam.credentials.enabled || exam.status === 'archived' || exam.status === 'draft') {
      throw new ApiError('exam_not_available', 'This examination is not currently available.');
    }

    // Check timing
    if (exam.status === 'completed' || new Date(exam.endAt).getTime() < Date.now()) {
      throw new ApiError('exam_expired', 'This examination has closed and can no longer be started.');
    }

    if (new Date(exam.startAt).getTime() > Date.now()) {
      throw new ApiError(
        'exam_not_started',
        `This examination opens on ${new Date(exam.startAt).toLocaleString()}.`
      );
    }

    if (userId) {
      const attemptRef = doc(db, ATTEMPTS_COLLECTION, `${exam.id}_${userId}`);
      const attemptSnap = await getDoc(attemptRef);
      if (attemptSnap.exists()) {
        const attempt = attemptSnap.data() as ExamAttempt;
        if (attempt.status === 'submitted') {
          throw new ApiError('already_submitted', 'You have already submitted this examination and cannot attempt it again.');
        }
      }
    }

    audit(`Candidate authorised into ${exam.credentials.examId}`);
    return { examId: exam.id };
  },

  /** Non-sensitive exam briefing for the instructions page */
  async examBrief(examId: string) {
    const exam = await fetchExam(examId);
    return {
      name: exam.name,
      description: exam.description,
      instructions: exam.instructions,
      questionCount: exam.questions.length,
      totalMarks: examTotalMarks(exam),
      durationMinutes: exam.rules.durationMinutes,
      passingScore: exam.rules.passingScore,
      attempts: exam.rules.attempts,
      allowReview: exam.rules.allowReview,
      autoSubmitOnTimeout: exam.rules.autoSubmitOnTimeout,
      showResultImmediately: exam.rules.showResultImmediately,
      security: { ...exam.security },
    };
  },

  async createOrResumeAttempt(examId: string, userId: string, userName: string, userEmail: string): Promise<void> {
    const attemptId = `${examId}_${userId}`;
    const attemptRef = doc(db, ATTEMPTS_COLLECTION, attemptId);
    const attemptSnap = await getDoc(attemptRef);
    if (attemptSnap.exists()) {
      const attempt = attemptSnap.data() as ExamAttempt;
      if (attempt.status === 'submitted') {
        throw new ApiError('already_submitted', 'You have already submitted this examination.');
      }
      return; // Already in progress
    }
    const newAttempt: ExamAttempt = {
      id: attemptId,
      examId,
      userId,
      userName,
      userEmail,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
    await setDoc(attemptRef, newAttempt);
  },

  async getExamAttempts(examId: string): Promise<ExamAttempt[]> {
    const q = query(collection(db, ATTEMPTS_COLLECTION), where('examId', '==', examId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ExamAttempt);
  },

  /** Start an exam session — loads exam from Firestore, session kept in-memory */
  async startSession(examId: string, candidateName: string, userId?: string, userEmail?: string): Promise<ExamSession> {
    if (userId && userEmail) {
      await this.createOrResumeAttempt(examId, userId, candidateName || 'Candidate', userEmail);
    }
    const exam = await fetchExam(examId);
    const startedAt = Date.now();

    const session: ExamSession = {
      id: uid('sess'),
      exam: clone(exam),
      candidateName: candidateName || 'Candidate',
      startedAt,
      expiresAt: startedAt + exam.rules.durationMinutes * 60 * 1000,
      answers: {},
      marked: [],
      currentIndex: 0,
      submitted: false,
    };

    if (exam.rules.randomizeQuestions) {
      session.exam.questions = [...session.exam.questions].sort(() => Math.random() - 0.5);
    }
    if (exam.rules.randomizeOptions) {
      session.exam.questions = session.exam.questions.map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
    }

    mem.sessions[session.id] = session;
    return clone(session);
  },

  async saveAnswer(sessionId: string, questionId: string, optionIds: string[]) {
    maybeFail();
    const session = mem.sessions[sessionId];
    if (!session) throw new ApiError('not_found', 'Your examination session could not be found.');
    if (session.submitted) throw new ApiError('already_submitted', 'This examination has already been submitted.');
    session.answers[questionId] = [...optionIds];
    return { savedAt: new Date().toISOString() };
  },

  async setMarked(sessionId: string, marked: string[]) {
    const session = mem.sessions[sessionId];
    if (!session) throw new ApiError('not_found', 'Your examination session could not be found.');
    session.marked = [...marked];
    return { savedAt: new Date().toISOString() };
  },

  async submitSession(
    sessionId: string,
    answers: AnswerMap,
    marked: string[],
    userId: string | null,
    reason: 'manual' | 'timeout' = 'manual'
  ): Promise<SubmissionReceipt> {
    await wait(900);
    const session = mem.sessions[sessionId];
    if (!session) throw new ApiError('not_found', 'Your examination session could not be found.');
    if (session.submitted) throw new ApiError('already_submitted', 'This examination has already been submitted.');

    session.answers = { ...session.answers, ...answers };
    session.marked = [...marked];
    session.submitted = true;

    const exam = session.exam;
    const total = examTotalMarks(exam);
    let raw = 0;
    exam.questions.forEach((q) => {
      raw += gradeQuestion(q, session.answers[q.id] ?? [], exam.rules.partialMarking, exam.rules.negativeMarking);
    });
    const score = Math.max(0, Number(raw.toFixed(2)));
    const percentage = total > 0 ? Number(((score / total) * 100).toFixed(1)) : 0;
    const answered = exam.questions.filter((q) => (session.answers[q.id] ?? []).length > 0).length;
    const passed = percentage >= exam.rules.passingScore;

    const record: ResultRecord = {
      id: uid('res'),
      candidateId: userId || 'usr_self',
      candidateName: session.candidateName,
      candidateEmail: '',
      examId: exam.id,
      examName: exam.name,
      score,
      totalMarks: total,
      percentage,
      passed,
      timeTakenSeconds: Math.round((Date.now() - session.startedAt) / 1000),
      submittedAt: new Date().toISOString(),
      answers: session.answers,
      questions: exam.questions,
    };

    if (userId) {
      try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
          const userData = userSnap.data() as StudentUser;
          record.candidateName = userData.name;
          record.candidateEmail = userData.email;
        }
      } catch {
        // Fallback to session name if user fetch fails
      }
      const attemptId = `${exam.id}_${userId}`;
      try {
        await updateDoc(doc(db, ATTEMPTS_COLLECTION, attemptId), {
          status: 'submitted',
          submittedAt: record.submittedAt,
          score,
          percentage,
          passed,
        });
      } catch {
        // Attempt update failed, but session submission completes in memory
      }
    }

    try {
      await setDoc(doc(db, 'results', record.id), record);
    } catch {
      // Even if saving result fails, we still want to finish session logic locally
    }

    // Update participant count in Firestore (best-effort)
    try {
      const examRef = doc(db, EXAMS_COLLECTION, exam.id);
      const latestSnap = await getDoc(examRef);
      if (latestSnap.exists()) {
        const latest = latestSnap.data() as Exam;
        await updateDoc(examRef, { participants: (latest.participants ?? 0) + 1 });
      }
    } catch {
      // Non-critical — don't fail the submission
    }

    audit(`Submission received for ${exam.credentials.examId} (${reason})`);

    const resultVisible = exam.rules.showResultImmediately;
    return {
      sessionId,
      submittedAt: record.submittedAt,
      answered,
      unanswered: exam.questions.length - answered,
      marked: session.marked.length,
      score: resultVisible ? score : null,
      totalMarks: total,
      percentage: resultVisible ? percentage : null,
      passed: resultVisible ? passed : null,
      resultVisible,
    };
  },
};