import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 &&
      <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
            {breadcrumbs.map((crumb, index) =>
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRightIcon aria-hidden className="h-3.5 w-3.5 text-line-strong" />}
                {crumb.to ?
            <Link
              to={crumb.to}
              className="rounded font-medium transition-colors duration-150 ease-swift hover:text-ink">
              
                    {crumb.label}
                  </Link> :

            <span aria-current="page" className="font-medium text-ink">
                    {crumb.label}
                  </span>
            }
              </li>
          )}
          </ol>
        </nav>
      }
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow}
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-ink sm:text-2xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>);

}