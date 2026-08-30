import type { Exam, ExamRules, ExamSecurity } from '../types';
import { questionBank } from './questionBank';

export const defaultRules: ExamRules = {
  durationMinutes: 60,
  attempts: 1,
  passingScore: 60,
  randomizeQuestions: false,
  randomizeOptions: false,
  negativeMarking: true,
  partialMarking: true,
  allowPrevious: true,
  allowReview: true,
  allowChangeAnswers: true,
  allowJump: true,
  manualSubmit: true,
  autoSubmitOnTimeout: true,
  showResultImmediately: true
};

export const defaultSecurity: ExamSecurity = {
  blockCopy: true,
  blockPaste: true,
  blockSelection: true,
  blockContextMenu: true,
  lockNavigation: true
};

const pick = (ids: string[]) =>
ids.
map((id) => questionBank.find((q) => q.id === id)).
filter((q): q is (typeof questionBank)[number] => Boolean(q)).
map((q) => ({ ...q, options: q.options.map((o) => ({ ...o })), correctOptionIds: [...q.correctOptionIds] }));

const baseInstructions = `Read every question carefully before answering. Your answers are saved automatically as you go. You may mark questions for review and return to them at any time while the timer is running.`;

export const seedExams: Exam[] = [
{
  id: 'exam_react',
  name: 'React Fundamentals Assessment',
  description: 'Test your understanding of React fundamentals, hooks, and rendering behaviour.',
  instructions: baseInstructions,
  category: 'React',
  status: 'published',
  questions: pick(['qb01', 'qb02', 'qb03', 'qb04', 'qb05', 'qb06', 'qb07', 'qb08', 'qb16', 'qb17']),
  rules: { ...defaultRules, durationMinutes: 45, passingScore: 65 },
  security: { ...defaultSecurity },
  credentials: { examId: 'REACT-2026', password: 'react2026', enabled: true },
  startAt: '2026-08-01T09:00:00.000Z',
  endAt: '2026-12-20T18:00:00.000Z',
  createdAt: '2026-07-14T10:20:00.000Z',
  participants: 248
},
{
  id: 'exam_js',
  name: 'JavaScript Advanced Concepts',
  description: 'Closures, async semantics, and the type system for senior engineering candidates.',
  instructions: baseInstructions,
  category: 'JavaScript',
  status: 'draft',
  questions: pick(['qb09', 'qb10', 'qb11']),
  rules: { ...defaultRules, durationMinutes: 75, passingScore: 70 },
  security: { ...defaultSecurity, lockNavigation: false },
  credentials: { examId: 'JSADV-7QK4', password: 'draft-not-issued', enabled: false },
  startAt: '2026-09-10T09:00:00.000Z',
  endAt: '2026-09-30T18:00:00.000Z',
  createdAt: '2026-08-19T14:05:00.000Z',
  participants: 0
},
{
  id: 'exam_sql',
  name: 'Database & SQL Certification',
  description: 'Certification-level coverage of relational modelling, indexing, and transactions.',
  instructions: baseInstructions,
  category: 'Databases',
  status: 'published',
  questions: pick(['qb12', 'qb13', 'qb14', 'qb15']),
  rules: { ...defaultRules, durationMinutes: 90, passingScore: 75, showResultImmediately: false },
  security: { ...defaultSecurity },
  credentials: { examId: 'SQL-CERT26', password: 'sqlCert!26', enabled: true },
  startAt: '2026-08-20T09:00:00.000Z',
  endAt: '2026-10-05T18:00:00.000Z',
  createdAt: '2026-06-02T08:40:00.000Z',
  participants: 512
},
{
  id: 'exam_frontend',
  name: 'Frontend Interview Screen',
  description: 'Short screening assessment used before the technical interview loop.',
  instructions: baseInstructions,
  category: 'Frontend',
  status: 'scheduled',
  questions: pick(['qb16', 'qb17', 'qb18']),
  rules: { ...defaultRules, durationMinutes: 30, passingScore: 60, allowPrevious: false, allowJump: false },
  security: { ...defaultSecurity },
  credentials: { examId: 'FE-SCREEN9', password: 'feScreen#9', enabled: true },
  startAt: '2026-09-14T09:00:00.000Z',
  endAt: '2026-09-14T18:00:00.000Z',
  createdAt: '2026-08-25T11:15:00.000Z',
  participants: 0
},
{
  id: 'exam_compliance',
  name: 'Corporate Compliance 2026',
  description: 'Annual mandatory compliance assessment for all staff.',
  instructions: baseInstructions,
  category: 'General',
  status: 'completed',
  questions: pick(['qb04', 'qb08', 'qb13']),
  rules: { ...defaultRules, durationMinutes: 20, passingScore: 80, negativeMarking: false },
  security: { ...defaultSecurity, blockSelection: false },
  credentials: { examId: 'COMP-2026A', password: 'comp2026A', enabled: false },
  startAt: '2026-03-01T09:00:00.000Z',
  endAt: '2026-03-31T18:00:00.000Z',
  createdAt: '2026-02-10T09:00:00.000Z',
  participants: 1184
},
{
  id: 'exam_legacy',
  name: 'HTML & Markup Basics (2024)',
  description: 'Retired entry-level assessment kept for historical reporting.',
  instructions: baseInstructions,
  category: 'Frontend',
  status: 'archived',
  questions: pick(['qb18', 'qb16']),
  rules: { ...defaultRules, durationMinutes: 25 },
  security: { ...defaultSecurity },
  credentials: { examId: 'HTML-2024', password: 'archived', enabled: false },
  startAt: '2024-05-01T09:00:00.000Z',
  endAt: '2024-08-01T18:00:00.000Z',
  createdAt: '2024-04-01T09:00:00.000Z',
  participants: 1538
}];