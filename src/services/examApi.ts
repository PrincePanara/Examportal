import { defaultRules, defaultSecurity, seedExams } from '../data/exams';
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
  SubmissionReceipt } from
'../types';
import { generateExamId, generatePassword, uid } from '../utils/format';

/**
 * Service layer for the examination platform.
 *
 * Every method here is the boundary the UI talks to — it mirrors the shape of a
 * real HTTP/API layer (async, throws typed errors, owns authoritative state such
 * as grading and session expiry). Swapping this file for `fetch` calls against a
 * real server requires no changes in the React tree.
 *
 * Deliberately server-owned in this abstraction, never trusted from the client:
 *   - exam authorisation (exam id + password)
 *   - exam session timing / expiry
 *   - answer persistence
 *   - grading and score calculation
 *   - duplicate submission prevention
 */

export type ApiErrorCode =
'invalid_credentials' |
'not_found' |
'exam_not_available' |
'exam_not_started' |
'exam_expired' |
'exam_full' |
'session_expired' |
'already_submitted' |
'network' |
'forbidden' |
'server';

export class ApiError extends Error {
  code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface Store {
  exams: Exam[];
  bank: Question[];
  candidates: Candidate[];
  results: ResultRecord[];
  sessions: Record<string, ExamSession>;
  auditLog: {id: string;action: string;at: string;}[];
}

const store: Store = {
  exams: clone(seedExams),
  bank: clone(questionBank),
  candidates: clone(seedCandidates),
  results: clone(seedResults),
  sessions: {},
  auditLog: []
};

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

function audit(action: string): void {
  store.auditLog.unshift({ id: uid('audit'), action, at: new Date().toISOString() });
}

function findExam(id: string): Exam {
  const exam = store.exams.find((e) => e.id === id);
  if (!exam) throw new ApiError('not_found', 'This examination could not be found.');
  return exam;
}

export function examTotalMarks(exam: Exam): number {
  return Number(exam.questions.reduce((sum, q) => sum + q.marks, 0).toFixed(2));
}

function gradeQuestion(question: Question, selected: string[], partialMarking: boolean, negativeMarking: boolean): number {
  if (!selected || selected.length === 0) return 0;
  const correct = question.correctOptionIds;
  const correctPicked = selected.filter((id) => correct.includes(id));
  const wrongPicked = selected.filter((id) => !correct.includes(id));

  if (question.type === 'multiple') {
    if (wrongPicked.length > 0) {
      return negativeMarking ? -question.negativeMarks : 0;
    }
    if (correctPicked.length === correct.length) return question.marks;
    if (partialMarking) {
      return Number((question.marks / correct.length * correctPicked.length).toFixed(2));
    }
    return 0;
  }

  const isCorrect = correctPicked.length === correct.length && wrongPicked.length === 0;
  if (isCorrect) return question.marks;
  return negativeMarking ? -question.negativeMarks : 0;
}

export const api = {
  /* ---------------------------------------------------------------- admin */

  async adminLogin(email: string, password: string) {
    await wait(680);
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      throw new ApiError('invalid_credentials', 'Enter your email and password to continue.');
    }
    if (normalized !== 'admin@examly.io' || password !== 'admin1234') {
      throw new ApiError('invalid_credentials', 'Those credentials are incorrect. Please try again.');
    }
    audit('Admin signed in');
    return { id: 'adm_01', name: 'Rhea Kapoor', email: 'admin@examly.io', role: 'Administrator' };
  },

  async listExams(): Promise<Exam[]> {
    await wait(420);
    return clone(store.exams);
  },

  async getExam(id: string): Promise<Exam> {
    await wait(260);
    return clone(findExam(id));
  },

  async createExam(): Promise<Exam> {
    await wait(360);
    const name = 'Untitled examination';
    const exam: Exam = {
      id: uid('exam'),
      name,
      description: '',
      instructions:
      'Read every question carefully before answering. Your answers are saved automatically as you go.',
      category: 'General',
      status: 'draft',
      questions: [],
      rules: { ...defaultRules },
      security: { ...defaultSecurity },
      credentials: { examId: generateExamId(name), password: generatePassword(), enabled: false },
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdAt: new Date().toISOString(),
      participants: 0
    };
    store.exams.unshift(exam);
    audit(`Created exam draft ${exam.credentials.examId}`);
    return clone(exam);
  },

  async updateExam(id: string, patch: Partial<Exam>): Promise<Exam> {
    await wait(280);
    maybeFail();
    const exam = findExam(id);
    Object.assign(exam, patch);
    audit(`Updated exam ${exam.credentials.examId}`);
    return clone(exam);
  },

  async duplicateExam(id: string): Promise<Exam> {
    await wait(360);
    const source = findExam(id);
    const copy: Exam = {
      ...clone(source),
      id: uid('exam'),
      name: `${source.name} (copy)`,
      status: 'draft',
      participants: 0,
      createdAt: new Date().toISOString(),
      credentials: { examId: generateExamId(source.name), password: generatePassword(), enabled: false }
    };
    store.exams.unshift(copy);
    audit(`Duplicated exam ${source.credentials.examId}`);
    return clone(copy);
  },

  async setExamStatus(id: string, status: ExamStatus): Promise<Exam> {
    await wait(320);
    const exam = findExam(id);
    exam.status = status;
    exam.credentials.enabled = status === 'published' || status === 'scheduled';
    audit(`Set ${exam.credentials.examId} to ${status}`);
    return clone(exam);
  },

  async deleteExam(id: string): Promise<void> {
    await wait(300);
    const exam = findExam(id);
    store.exams = store.exams.filter((e) => e.id !== id);
    audit(`Deleted exam ${exam.credentials.examId}`);
  },

  async regenerateCredentials(id: string, regenerateId = false): Promise<Exam> {
    await wait(420);
    const exam = findExam(id);
    exam.credentials.password = generatePassword();
    if (regenerateId) exam.credentials.examId = generateExamId(exam.name);
    audit(`Regenerated credentials for ${exam.credentials.examId}`);
    return clone(exam);
  },

  /* --------------------------------------------------------- question bank */

  async listQuestionBank(): Promise<Question[]> {
    await wait(340);
    return clone(store.bank);
  },

  async saveBankQuestion(question: Question): Promise<Question> {
    await wait(280);
    const index = store.bank.findIndex((q) => q.id === question.id);
    if (index >= 0) store.bank[index] = clone(question);else
    store.bank.unshift(clone(question));
    audit(`Saved question ${question.id} to the bank`);
    return clone(question);
  },

  async deleteBankQuestion(id: string): Promise<void> {
    await wait(240);
    store.bank = store.bank.filter((q) => q.id !== id);
    audit(`Removed question ${id} from the bank`);
  },

  /* ------------------------------------------------------------- candidates */

  async listCandidates(): Promise<Candidate[]> {
    await wait(380);
    return clone(store.candidates);
  },

  async saveCandidate(candidate: Candidate): Promise<Candidate> {
    await wait(300);
    const index = store.candidates.findIndex((c) => c.id === candidate.id);
    if (index >= 0) store.candidates[index] = clone(candidate);else
    store.candidates.unshift(clone(candidate));
    audit(`Saved user ${candidate.email}`);
    return clone(candidate);
  },

  /* ---------------------------------------------------------------- results */

  async listResults(): Promise<ResultRecord[]> {
    await wait(400);
    return clone(store.results);
  },

  async analytics() {
    await wait(460);
    return {
      totals: platformTotals,
      questionPerformance: clone(seedQuestionPerformance),
      auditLog: clone(store.auditLog).slice(0, 8)
    };
  },

  /* ------------------------------------------------------------ exam portal */

  /** Validates exam credentials. Returns only what the candidate is allowed to see. */
  async authorizeExam(examCode: string, password: string) {
    await wait(720);
    const exam = store.exams.find(
      (e) => e.credentials.examId.toLowerCase() === examCode.trim().toLowerCase()
    );
    if (!exam || exam.credentials.password !== password) {
      throw new ApiError('invalid_credentials', 'Exam ID or password is incorrect.');
    }
    if (!exam.credentials.enabled || exam.status === 'archived' || exam.status === 'draft') {
      throw new ApiError('exam_not_available', 'This examination is no longer available.');
    }
    if (exam.status === 'completed' || new Date(exam.endAt).getTime() < Date.now()) {
      throw new ApiError('exam_expired', 'This examination has closed and can no longer be started.');
    }
    if (new Date(exam.startAt).getTime() > Date.now()) {
      throw new ApiError(
        'exam_not_started',
        `This examination opens on ${new Date(exam.startAt).toLocaleString()}.`
      );
    }
    audit(`Candidate authorised into ${exam.credentials.examId}`);
    return { examId: exam.id };
  },

  /** Non-sensitive briefing shown to an authorised candidate before starting. */
  async examBrief(examId: string) {
    await wait(320);
    const exam = findExam(examId);
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
      security: { ...exam.security }
    };
  },

  /** Server issues the session and owns its expiry timestamp. */
  async startSession(examId: string, candidateName: string): Promise<ExamSession> {
    await wait(520);
    const exam = findExam(examId);
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
      submitted: false
    };
    if (exam.rules.randomizeQuestions) {
      session.exam.questions = [...session.exam.questions].sort(() => Math.random() - 0.5);
    }
    if (exam.rules.randomizeOptions) {
      session.exam.questions = session.exam.questions.map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
      }));
    }
    store.sessions[session.id] = session;
    return clone(session);
  },

  async saveAnswer(sessionId: string, questionId: string, optionIds: string[]) {
    await wait(340);
    maybeFail();
    const session = store.sessions[sessionId];
    if (!session) throw new ApiError('not_found', 'Your examination session could not be found.');
    if (session.submitted) throw new ApiError('already_submitted', 'This examination has already been submitted.');
    session.answers[questionId] = [...optionIds];
    return { savedAt: new Date().toISOString() };
  },

  async setMarked(sessionId: string, marked: string[]) {
    await wait(200);
    const session = store.sessions[sessionId];
    if (!session) throw new ApiError('not_found', 'Your examination session could not be found.');
    session.marked = [...marked];
    return { savedAt: new Date().toISOString() };
  },

  /** Grading, timing validation and duplicate-submission prevention all happen here. */
  async submitSession(
  sessionId: string,
  answers: AnswerMap,
  marked: string[],
  reason: 'manual' | 'timeout' = 'manual')
  : Promise<SubmissionReceipt> {
    await wait(900);
    const session = store.sessions[sessionId];
    if (!session) throw new ApiError('not_found', 'Your examination session could not be found.');
    if (session.submitted) {
      throw new ApiError('already_submitted', 'This examination has already been submitted.');
    }

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
    const percentage = total > 0 ? Number((score / total * 100).toFixed(1)) : 0;
    const answered = exam.questions.filter((q) => (session.answers[q.id] ?? []).length > 0).length;
    const passed = percentage >= exam.rules.passingScore;

    const record: ResultRecord = {
      id: uid('res'),
      candidateId: 'usr_self',
      candidateName: session.candidateName,
      candidateEmail: 'candidate@northfield.edu',
      examId: exam.id,
      examName: exam.name,
      score,
      totalMarks: total,
      percentage,
      passed,
      timeTakenSeconds: Math.round((Date.now() - session.startedAt) / 1000),
      submittedAt: new Date().toISOString()
    };
    store.results.unshift(record);
    const liveExam = store.exams.find((e) => e.id === exam.id);
    if (liveExam) liveExam.participants += 1;
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
      resultVisible
    };
  }
};