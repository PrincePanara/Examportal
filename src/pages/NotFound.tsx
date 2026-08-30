import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Wordmark } from '../components/Brand';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <Wordmark subtitle="Examination infrastructure" className="mb-10" />
      <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-muted">
        <CompassIcon aria-hidden className="h-5 w-5" />
      </span>
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">This page doesn’t exist</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        The page you were looking for may have been moved, or you may not have permission to view it.
      </p>
      <div className="mt-6 flex gap-2">
        <Link to="/">
          <Button variant="primary">Back to start</Button>
        </Link>
        <Link to="/admin">
          <Button variant="secondary">Administrator console</Button>
        </Link>
      </div>
    </div>);

}