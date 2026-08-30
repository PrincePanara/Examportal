export type ExamStatus = 'draft' | 'scheduled' | 'published' | 'completed' | 'archived';

export type QuestionType = 'single' | 'multiple' | 'boolean' | 'short';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  /** Used by the extensible `short` type; ignored for choice questions. */
  expectedAnswer?: string;
  marks: number;
  negativeMarks: number;
  difficulty: Difficulty;
  category: string;
}

export interface ExamRules {
  durationMinutes: number;
  attempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  negativeMarking: boolean;
  partialMarking: boolean;
  allowPrevious: boolean;
  allowReview: boolean;
  allowChangeAnswers: boolean;
  allowJump: boolean;
  manualSubmit: boolean;
  autoSubmitOnTimeout: boolean;
  showResultImmediately: boolean;
}

export interface ExamSecurity {
  blockCopy: boolean;
  blockPaste: boolean;
  blockSelection: boolean;
  blockContextMenu: boolean;
  lockNavigation: boolean;
}

export interface ExamCredentials {
  examId: string;
  password: string;
  enabled: boolean;
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  instructions: string;
  category: string;
  status: ExamStatus;
  questions: Question[];
  rules: ExamRules;
  security: ExamSecurity;
  credentials: ExamCredentials;
  startAt: string;
  endAt: string;
  createdAt: string;
  participants: number;
}

export type UserStatus = 'active' | 'disabled' | 'invited';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  examsAttempted: number;
  lastActivity: string;
}

export interface ResultRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  examId: string;
  examName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
}

export interface QuestionPerformance {
  questionId: string;
  prompt: string;
  correctRate: number;
  attempts: number;
  difficulty: Difficulty;
}

export type AnswerMap = Record<string, string[]>;

export interface ExamSession {
  id: string;
  exam: Exam;
  candidateName: string;
  startedAt: number;
  expiresAt: number;
  answers: AnswerMap;
  marked: string[];
  currentIndex: number;
  submitted: boolean;
}

export interface SubmissionReceipt {
  sessionId: string;
  submittedAt: string;
  answered: number;
  unanswered: number;
  marked: number;
  score: number | null;
  totalMarks: number;
  percentage: number | null;
  passed: boolean | null;
  resultVisible: boolean;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
}