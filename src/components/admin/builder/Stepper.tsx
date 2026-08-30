import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '../../../utils/format';

export const builderSteps = [
{ id: 'details', label: 'Details' },
{ id: 'questions', label: 'Questions' },
{ id: 'rules', label: 'Rules' },
{ id: 'security', label: 'Security' },
{ id: 'preview', label: 'Preview' },
{ id: 'publish', label: 'Publish' }] as
const;

export type BuilderStepId = (typeof builderSteps)[number]['id'];

interface StepperProps {
  current: BuilderStepId;
  onSelect: (id: BuilderStepId) => void;
  completed: BuilderStepId[];
}

export function Stepper({ current, onSelect, completed }: StepperProps) {
  const currentIndex = builderSteps.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Exam builder steps">
      <ol className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
        {builderSteps.map((step, index) => {
          const active = step.id === current;
          const done = completed.includes(step.id) && !active;
          return (
            <li key={step.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-[background-color,color] duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  active ? 'bg-primary-soft text-primary-dark' : 'text-muted hover:bg-surface-alt hover:text-ink'
                )}>
                
                <span
                  aria-hidden
                  className={cn(
                    'tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold',
                    active ?
                    'border-primary bg-primary text-white' :
                    done ?
                    'border-success/30 bg-success-soft text-success' :
                    'border-line bg-surface text-muted'
                  )}>
                  
                  {done ? <CheckIcon className="h-3.5 w-3.5" /> : String(index + 1).padStart(2, '0')}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>
            </li>);

        })}
      </ol>
      <p className="mt-3 hidden px-3 text-2xs uppercase tracking-wide text-muted lg:block">
        Step {currentIndex + 1} of {builderSteps.length}
      </p>
    </nav>);

}