import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, MoonIcon, ShieldCheckIcon, SunIcon } from 'lucide-react';
import { Wordmark } from '../../components/Brand';
import { Button, IconButton } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { useTheme } from '../../contexts/ThemeContext';

export function ExamGate() {
  const { authorize, isAuthorizing, gateError, clearGateError } = useExamSession();
  const { theme, toggleTheme } = useTheme();
  const [examCode, setExamCode] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState({ code: false, password: false });

  const codeError = touched.code && !examCode.trim() ? 'Enter the Exam ID provided to you.' : undefined;
  const passwordError = touched.password && !password ? 'Enter the exam password.' : undefined;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ code: true, password: true });
    if (!examCode.trim() || !password) return;
    await authorize(examCode, password);
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <Wordmark subtitle="Exam portal" />
        <div className="flex items-center gap-1">
          <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
            {theme === 'dark' ? <SunIcon aria-hidden className="h-[18px] w-[18px]" /> : <MoonIcon aria-hidden className="h-[18px] w-[18px]" />}
          </IconButton>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-7 text-center">
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">Enter examination</h1>
            <p className="mt-1.5 text-sm text-muted">
              Use the Exam ID and password issued by your administrator.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-card">
            {gateError &&
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-primary-border bg-primary-soft px-3.5 py-3 text-[13px] font-medium text-primary-dark">
              
                <AlertCircleIcon aria-hidden className="mt-px h-4 w-4 shrink-0" />
                {gateError}
              </div>
            }

            <Field label="Exam ID" required error={codeError}>
              {({ id, describedBy, invalid }) =>
              <TextInput
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                value={examCode}
                placeholder="e.g. REACT-2026"
                autoComplete="off"
                spellCheck={false}
                className="font-mono uppercase tracking-wide"
                onChange={(event) => {
                  setExamCode(event.target.value);
                  clearGateError();
                }}
                onBlur={() => setTouched((t) => ({ ...t, code: true }))} />

              }
            </Field>

            <Field label="Exam password" required error={passwordError}>
              {({ id, describedBy, invalid }) =>
              <TextInput
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                type={reveal ? 'text' : 'password'}
                value={password}
                placeholder="••••••••"
                autoComplete="off"
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearGateError();
                }}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                trailing={
                <IconButton
                  label={reveal ? 'Hide password' : 'Show password'}
                  onClick={() => setReveal((r) => !r)}
                  className="h-8 w-8">
                  
                      {reveal ? <EyeOffIcon aria-hidden className="h-4 w-4" /> : <EyeIcon aria-hidden className="h-4 w-4" />}
                    </IconButton>
                } />

              }
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isAuthorizing}>
              {isAuthorizing ? 'Verifying' : 'Continue'}
              {!isAuthorizing && <ArrowRightIcon aria-hidden className="h-4 w-4" />}
            </Button>

            <p className="flex items-center justify-center gap-1.5 pt-1 text-2xs font-semibold uppercase tracking-wide text-muted">
              <ShieldCheckIcon aria-hidden className="h-3.5 w-3.5" />
              Secure examination
            </p>
          </form>

          <p className="mt-4 rounded-lg border border-line bg-surface-alt/60 px-3.5 py-3 text-xs leading-relaxed text-muted">
            Demonstration credentials — Exam ID <span className="font-medium text-ink">REACT-2026</span>, password{' '}
            <span className="font-medium text-ink">react2026</span>
          </p>

          <p className="mt-6 text-center text-xs text-muted">
            Administrator?{' '}
            <Link to="/admin/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in to the console
            </Link>
          </p>
        </div>
      </main>
    </div>);

}