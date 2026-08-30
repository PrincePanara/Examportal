import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from 'lucide-react';
import { Wordmark } from '../../components/Brand';
import { Button, IconButton } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isSubmitting, error, isAuthenticated, clearError } = useAuth();
  const [email, setEmail] = useState('admin@examly.io');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const emailError = touched.email && !email.trim() ? 'Enter your email or username.' : undefined;
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
        <Link to="/exam" className="text-[13px] font-medium text-muted transition-colors duration-150 ease-swift hover:text-ink">
          Candidate portal
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 text-center">
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">Admin sign in</h1>
            <p className="mt-1.5 text-sm text-muted">Access the examination management console.</p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-card">
            
            {error &&
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-primary-border bg-primary-soft px-3.5 py-3 text-[13px] font-medium text-primary-dark">
              
                <AlertCircleIcon aria-hidden className="mt-px h-4 w-4 shrink-0" />
                {error}
              </div>
            }

            <Field label="Email or username" error={emailError} required>
              {({ id, describedBy, invalid }) =>
              <TextInput
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                type="email"
                autoComplete="username"
                value={email}
                placeholder="you@institution.edu"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearError();
                }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))} />

              }
            </Field>

            <Field label="Password" error={passwordError} required>
              {({ id, describedBy, invalid }) =>
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
                  className="h-8 w-8">
                  
                      {reveal ?
                  <EyeOffIcon aria-hidden className="h-4 w-4" /> :

                  <EyeIcon aria-hidden className="h-4 w-4" />
                  }
                    </IconButton>
                } />

              }
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              {isSubmitting ? 'Signing in' : 'Sign in'}
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => window.alert('A password reset link would be emailed to your administrator address.')}
                className="text-[13px] font-medium text-primary transition-colors duration-150 ease-swift hover:text-primary-dark">
                
                Forgot password?
              </button>
              <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-muted">
                <ShieldCheckIcon aria-hidden className="h-3.5 w-3.5" />
                Protected route
              </span>
            </div>
          </form>

          <p className="mt-4 rounded-lg border border-line bg-surface-alt/60 px-3.5 py-3 text-xs leading-relaxed text-muted">
            Demonstration credentials — email <span className="font-medium text-ink">admin@examly.io</span>, password{' '}
            <span className="font-medium text-ink">admin1234</span>
          </p>
        </div>
      </main>
    </div>);

}