import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from 'lucide-react';
import { Wordmark } from '../../components/Brand';
import { Button, IconButton } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isSubmitting, error, isAdminAuthenticated, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  if (isAdminAuthenticated) return <Navigate to="/admin" replace />;

  const emailError = touched.email && !email.trim() ? 'Enter your admin email.' : undefined;
  const passwordError = touched.password && !password ? 'Enter your password.' : undefined;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !password) return;
    const ok = await login(email, password);
    if (ok) navigate('/admin', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <Link to="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          <Wordmark subtitle="Administrator" />
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 ease-swift hover:text-ink"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Student login
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheckIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">Admin sign in</h1>
            <p className="mt-1.5 text-sm text-muted">Access the examination management console.</p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-card"
          >
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                <AlertCircleIcon aria-hidden className="mt-px h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Field label="Admin Email" error={emailError} required>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type="email"
                  autoComplete="username"
                  value={email}
                  placeholder="admin@yourdomain.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError();
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
              )}
            </Field>

            <Field label="Password" error={passwordError} required>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type={reveal ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError();
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  trailing={
                    <IconButton
                      label={reveal ? 'Hide password' : 'Show password'}
                      onClick={() => setReveal((r) => !r)}
                      className="h-8 w-8"
                    >
                      {reveal ? (
                        <EyeOffIcon aria-hidden className="h-4 w-4" />
                      ) : (
                        <EyeIcon aria-hidden className="h-4 w-4" />
                      )}
                    </IconButton>
                  }
                />
              )}
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="flex items-center justify-center pt-1">
              <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-muted">
                <ShieldCheckIcon aria-hidden className="h-3.5 w-3.5" />
                Protected administrator route
              </span>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Not an admin?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Go to student login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}