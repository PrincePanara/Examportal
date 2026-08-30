import type { Candidate, QuestionPerformance, ResultRecord } from '../types';

export const seedCandidates: Candidate[] = [
{ id: 'usr_01', name: 'Aditi Sharma', email: 'aditi.sharma@northfield.edu', status: 'active', examsAttempted: 6, lastActivity: '2026-08-28T14:20:00.000Z' },
{ id: 'usr_02', name: 'Marcus Bell', email: 'marcus.bell@northfield.edu', status: 'active', examsAttempted: 4, lastActivity: '2026-08-28T09:05:00.000Z' },
{ id: 'usr_03', name: 'Lena Fischer', email: 'lena.fischer@northfield.edu', status: 'active', examsAttempted: 9, lastActivity: '2026-08-27T17:44:00.000Z' },
{ id: 'usr_04', name: 'Tomás Rivera', email: 'tomas.rivera@northfield.edu', status: 'disabled', examsAttempted: 2, lastActivity: '2026-07-11T12:10:00.000Z' },
{ id: 'usr_05', name: 'Priya Nair', email: 'priya.nair@northfield.edu', status: 'active', examsAttempted: 7, lastActivity: '2026-08-29T08:02:00.000Z' },
{ id: 'usr_06', name: 'Daniel Okonjo', email: 'daniel.okonjo@northfield.edu', status: 'invited', examsAttempted: 0, lastActivity: '2026-08-26T10:30:00.000Z' },
{ id: 'usr_07', name: 'Sofia Lindqvist', email: 'sofia.lindqvist@northfield.edu', status: 'active', examsAttempted: 5, lastActivity: '2026-08-25T16:18:00.000Z' },
{ id: 'usr_08', name: 'Kenji Watanabe', email: 'kenji.watanabe@northfield.edu', status: 'active', examsAttempted: 3, lastActivity: '2026-08-24T11:52:00.000Z' }];


interface Seed {
  candidate: string;
  exam: [string, string];
  score: number;
  total: number;
  seconds: number;
  submittedAt: string;
}

const rows: Seed[] = [
{ candidate: 'usr_01', exam: ['exam_react', 'React Fundamentals Assessment'], score: 24, total: 26, seconds: 1980, submittedAt: '2026-08-28T14:20:00.000Z' },
{ candidate: 'usr_02', exam: ['exam_react', 'React Fundamentals Assessment'], score: 15, total: 26, seconds: 2410, submittedAt: '2026-08-28T09:05:00.000Z' },
{ candidate: 'usr_03', exam: ['exam_react', 'React Fundamentals Assessment'], score: 25.5, total: 26, seconds: 1620, submittedAt: '2026-08-27T17:44:00.000Z' },
{ candidate: 'usr_05', exam: ['exam_react', 'React Fundamentals Assessment'], score: 21, total: 26, seconds: 2100, submittedAt: '2026-08-27T10:31:00.000Z' },
{ candidate: 'usr_07', exam: ['exam_sql', 'Database & SQL Certification'], score: 9, total: 11, seconds: 3300, submittedAt: '2026-08-26T13:12:00.000Z' },
{ candidate: 'usr_08', exam: ['exam_sql', 'Database & SQL Certification'], score: 6, total: 11, seconds: 4020, submittedAt: '2026-08-25T15:40:00.000Z' },
{ candidate: 'usr_03', exam: ['exam_sql', 'Database & SQL Certification'], score: 10.5, total: 11, seconds: 2880, submittedAt: '2026-08-24T09:22:00.000Z' },
{ candidate: 'usr_01', exam: ['exam_compliance', 'Corporate Compliance 2026'], score: 4, total: 4, seconds: 640, submittedAt: '2026-03-18T11:02:00.000Z' },
{ candidate: 'usr_04', exam: ['exam_compliance', 'Corporate Compliance 2026'], score: 2, total: 4, seconds: 900, submittedAt: '2026-03-17T14:48:00.000Z' },
{ candidate: 'usr_05', exam: ['exam_compliance', 'Corporate Compliance 2026'], score: 3.5, total: 4, seconds: 720, submittedAt: '2026-03-16T10:15:00.000Z' },
{ candidate: 'usr_02', exam: ['exam_sql', 'Database & SQL Certification'], score: 8, total: 11, seconds: 3540, submittedAt: '2026-08-22T16:05:00.000Z' },
{ candidate: 'usr_07', exam: ['exam_react', 'React Fundamentals Assessment'], score: 18.5, total: 26, seconds: 2250, submittedAt: '2026-08-21T12:44:00.000Z' }];


export const seedResults: ResultRecord[] = rows.map((row, index) => {
  const candidate = seedCandidates.find((c) => c.id === row.candidate)!;
  const percentage = Number((row.score / row.total * 100).toFixed(1));
  return {
    id: `res_${String(index + 1).padStart(2, '0')}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    examId: row.exam[0],
    examName: row.exam[1],
    score: row.score,
    totalMarks: row.total,
    percentage,
    passed: percentage >= 60,
    timeTakenSeconds: row.seconds,
    submittedAt: row.submittedAt
  };
});

export const seedQuestionPerformance: QuestionPerformance[] = [
{ questionId: 'qb17', prompt: 'Select all accessibility requirements for a custom button.', correctRate: 31, attempts: 248, difficulty: 'hard' },
{ questionId: 'qb03', prompt: 'Select all statements that are true about React keys.', correctRate: 38, attempts: 248, difficulty: 'hard' },
{ questionId: 'qb16', prompt: 'Which CSS property creates a new stacking context most predictably?', correctRate: 44, attempts: 248, difficulty: 'hard' },
{ questionId: 'qb05', prompt: 'Which hook would you use to cache an expensive derived value?', correctRate: 61, attempts: 248, difficulty: 'medium' },
{ questionId: 'qb02', prompt: 'What is the purpose of the dependency array in useEffect?', correctRate: 72, attempts: 248, difficulty: 'medium' },
{ questionId: 'qb07', prompt: 'Which pattern correctly lifts state for two sibling components?', correctRate: 78, attempts: 248, difficulty: 'medium' },
{ questionId: 'qb01', prompt: 'Which hook is used to manage local state in a React function component?', correctRate: 94, attempts: 248, difficulty: 'easy' },
{ questionId: 'qb04', prompt: 'React state updates inside event handlers are batched.', correctRate: 88, attempts: 248, difficulty: 'easy' }];


export const platformTotals = {
  totalUsers: 1248,
  completedExams: 3482,
  totalAttempts: 4106,
  completionRate: 89.2,
  averageCompletionSeconds: 2418
};