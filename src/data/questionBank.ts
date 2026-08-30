import type { Question } from '../types';

function q(
id: string,
prompt: string,
options: string[],
correctIndexes: number[],
extra: Partial<Question> = {})
: Question {
  const mapped = options.map((text, i) => ({ id: `${id}_o${i + 1}`, text }));
  return {
    id,
    type: correctIndexes.length > 1 ? 'multiple' : options.length === 2 ? 'boolean' : 'single',
    prompt,
    options: mapped,
    correctOptionIds: correctIndexes.map((i) => mapped[i].id),
    marks: 2,
    negativeMarks: 0.5,
    difficulty: 'medium',
    category: 'React',
    ...extra
  };
}

export const questionBank: Question[] = [
q('qb01', 'Which hook is used to manage local state in a React function component?', ['useEffect', 'useState', 'useMemo', 'useRef'], [1], {
  difficulty: 'easy',
  marks: 2
}),
q('qb02', 'What is the purpose of the dependency array in useEffect?', [
'It defines which values the effect re-runs on',
'It memoizes the return value of the effect',
'It sets the execution order of effects',
'It prevents the component from re-rendering'],
[0]),
q('qb03', 'Select all statements that are true about React keys.', [
'Keys help React identify which items changed',
'Keys must be globally unique across the app',
'Array index keys can cause incorrect reconciliation',
'Keys are passed to the component as a prop'],
[0, 2], { difficulty: 'hard', marks: 4, negativeMarks: 1 }),
q('qb04', 'React state updates inside event handlers are batched.', ['True', 'False'], [0], {
  type: 'boolean',
  difficulty: 'easy',
  marks: 1,
  negativeMarks: 0
}),
q('qb05', 'Which hook would you use to cache an expensive derived value?', ['useCallback', 'useMemo', 'useLayoutEffect', 'useReducer'], [1]),
q('qb06', 'What does the React Context API primarily solve?', [
'Passing data through the tree without prop drilling',
'Persisting state to local storage',
'Server-side data fetching',
'Reducing bundle size'],
[0], { difficulty: 'easy' }),
q('qb07', 'Which pattern correctly lifts state for two sibling components?', [
'Store state in the closest common parent',
'Duplicate state in both siblings',
'Use a module-level mutable variable',
'Read the sibling ref directly'],
[0]),
q('qb08', 'A component wrapped in React.memo re-renders when its props are referentially equal.', ['True', 'False'], [1], {
  type: 'boolean',
  marks: 1,
  negativeMarks: 0
}),
q('qb09', 'Which of these are valid JavaScript primitive types?', ['symbol', 'object', 'bigint', 'array'], [0, 2], {
  category: 'JavaScript',
  difficulty: 'hard',
  marks: 4,
  negativeMarks: 1
}),
q('qb10', 'What does `Promise.allSettled` resolve with?', [
'An array of status/value descriptors for every promise',
'The first fulfilled value',
'A rejection if any promise rejects',
'An array of only fulfilled values'],
[0], { category: 'JavaScript' }),
q('qb11', 'In JavaScript, `typeof null` evaluates to:', ['"null"', '"object"', '"undefined"', '"number"'], [1], {
  category: 'JavaScript',
  difficulty: 'easy'
}),
q('qb12', 'Which SQL clause filters rows after aggregation?', ['WHERE', 'HAVING', 'GROUP BY', 'QUALIFY'], [1], {
  category: 'Databases'
}),
q('qb13', 'A database index always improves write performance.', ['True', 'False'], [1], {
  type: 'boolean',
  category: 'Databases',
  marks: 1,
  negativeMarks: 0
}),
q('qb14', 'Which normal form removes transitive dependencies on the primary key?', ['1NF', '2NF', '3NF', 'BCNF'], [2], {
  category: 'Databases',
  difficulty: 'hard',
  marks: 4,
  negativeMarks: 1
}),
q('qb15', 'What is the primary benefit of a database transaction?', [
'Atomic all-or-nothing execution of statements',
'Faster read throughput',
'Automatic schema migration',
'Reduced storage footprint'],
[0], { category: 'Databases' }),
q('qb16', 'Which CSS property creates a new stacking context most predictably?', ['float', 'isolation: isolate', 'overflow: auto', 'display: block'], [1], {
  category: 'Frontend',
  difficulty: 'hard',
  marks: 3,
  negativeMarks: 0.75
}),
q('qb17', 'Select all accessibility requirements for a custom button.', [
'Keyboard activation with Enter and Space',
'A visible focus indicator',
'An aria-label even when it has visible text',
'A discernible accessible name'],
[0, 1, 3], { category: 'Frontend', difficulty: 'hard', marks: 4, negativeMarks: 1 }),
q('qb18', 'Which HTTP status code indicates the client is authenticated but not authorised?', ['401', '403', '404', '409'], [1], {
  category: 'Frontend'
})];


export const questionCategories = ['React', 'JavaScript', 'Databases', 'Frontend', 'General'] as const;