import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, LockIcon, ShieldCheckIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Wordmark } from '../components/Brand';
import { IconButton } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';

const entries = [
{
  to: '/admin/login',
  title: 'Administrator console',
  description: 'Build examinations, manage candidates, issue credentials, and review results.',
  meta: 'Requires an administrator account'
},
{
  to: '/exam',
  title: 'Enter an examination',
  description: 'Sign in with the Exam ID and password issued to you to begin your assessment.',
  meta: 'Controlled examination environment'
}];


export function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <Wordmark subtitle="Examination infrastructure" />
        <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon aria-hidden className="h-[18px] w-[18px]" /> : <MoonIcon aria-hidden className="h-[18px] w-[18px]" />}
        </IconButton>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          <ShieldCheckIcon aria-hidden className="h-4 w-4" />
          Secure assessments
        </p>
        <h1 className="max-w-xl text-3xl font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[40px]">
          Professional examination infrastructure for institutions and teams.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          Author examinations, control availability with issued credentials, and run distraction-free
          sessions with server-validated timing and submissions.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {entries.map((entry) =>
          <Link
            key={entry.to}
            to={entry.to}
            className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-card transition-[border-color,transform,box-shadow] duration-150 ease-swift hover:-translate-y-0.5 hover:border-primary-border hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            
              <span className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{entry.title}</h2>
                <ArrowRightIcon
                aria-hidden
                className="h-4 w-4 text-muted transition-transform duration-150 ease-swift group-hover:translate-x-0.5 group-hover:text-primary" />
              
              </span>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{entry.description}</p>
              <span className="mt-5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-muted">
                <LockIcon aria-hidden className="h-3 w-3" />
                {entry.meta}
              </span>
            </Link>
          )}
        </div>
      </main>

      <footer className="border-t border-line bg-surface px-5 py-5 text-xs text-muted sm:px-8">
        Examly · Server-validated exam sessions · Audit-logged administrator actions
      </footer>
    </div>);

}