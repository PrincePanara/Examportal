import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheckIcon, GraduationCapIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Google SVG icon
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function StudentLogin() {
  const { isStudentAuthenticated, isAdminAuthenticated, isSigningInWithGoogle, googleError, signInWithGoogle, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  if (isStudentAuthenticated) return <Navigate to="/dashboard" replace />;
  if (isAdminAuthenticated) return <Navigate to="/admin" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCapIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ink">ExamPortal</span>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">

          {/* Hero text */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
              <GraduationCapIcon className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Welcome to ExamPortal</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sign in to access your exams and track your results.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">

            {/* Google error */}
            {googleError && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {googleError}
              </div>
            )}

            {/* Google Sign-In */}
            <button
              id="google-signin-btn"
              onClick={signInWithGoogle}
              disabled={isSigningInWithGoogle}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-[15px] font-semibold text-ink shadow-sm transition-all duration-150 hover:border-primary/40 hover:bg-surface-alt hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningInWithGoogle ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-primary" />
              ) : (
                <GoogleIcon />
              )}
              {isSigningInWithGoogle ? 'Signing you in…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs font-medium text-muted">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* Admin login link - uses Link for SPA navigation (no full page reload) */}
            <Link
              to="/admin/login"
              id="admin-login-link"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface-alt px-4 py-3 text-[14px] font-semibold text-muted transition-all duration-150 hover:border-line hover:bg-surface hover:text-ink"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Login as Admin
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-5 text-center text-xs leading-relaxed text-muted">
            By signing in, you agree to our terms of service.
            <br />
            Your profile is stored securely in Firebase.
          </p>
        </div>
      </main>

      <footer className="border-t border-line bg-surface px-5 py-4 text-center text-xs text-muted">
        ExamPortal · Secure server-validated examinations · Made with 🤫 by <span className="font-medium text-ink">PrincePanara</span>
      </footer>
    </div>
  );
}
