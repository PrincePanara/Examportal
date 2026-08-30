import React from 'react';
import { ExamGate } from './ExamGate';
import { Instructions } from './Instructions';
import { Completion } from './Completion';
import { ExamRunner } from '../../components/exam/ExamRunner';
import { useExamSession } from '../../contexts/ExamSessionContext';

export function ExamPortal() {
  const { stage } = useExamSession();

  if (stage === 'instructions') return <Instructions />;
  if (stage === 'active') return <ExamRunner />;
  if (stage === 'submitted') return <Completion />;
  return <ExamGate />;
}