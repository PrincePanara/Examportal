import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ExternalLinkIcon } from 'lucide-react';
import { cn } from '../../utils/format';
import { primaryNav } from './navigation';

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Primary" className="flex-1 space-y-0.5 px-3 py-4">
        {primaryNav.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color] duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            collapsed && 'justify-center px-0',
            isActive ?
            'bg-primary-soft text-primary-dark' :
            'text-muted hover:bg-surface-alt hover:text-ink'
          )
          }
          title={collapsed ? item.label : undefined}>
          
            {({ isActive }) =>
          <>
                {isActive && !collapsed &&
            <span aria-hidden className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
            }
                <item.icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
          }
          </NavLink>
        )}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          to="/exam"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-ink transition-colors duration-150 ease-swift hover:bg-surface-alt',
            collapsed && 'justify-center px-0'
          )}
          title="Open the candidate exam portal">
          
          <ExternalLinkIcon aria-hidden className="h-[18px] w-[18px] shrink-0 text-muted" />
          {!collapsed && <span className="truncate">Exam portal</span>}
        </Link>
      </div>
    </div>);

}