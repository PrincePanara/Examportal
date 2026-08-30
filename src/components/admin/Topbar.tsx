import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftIcon,
  SearchIcon,
  SunIcon } from
'lucide-react';
import { IconButton } from '../ui/Button';
import { Wordmark } from '../Brand';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn, initials } from '../../utils/format';

interface TopbarProps {
  onOpenDrawer: () => void;
  onToggleCollapse: () => void;
}

const notifications = [
{ id: 'n1', title: '3 new submissions', body: 'React Fundamentals Assessment', at: '12 min ago' },
{ id: 'n2', title: 'Exam window closing', body: 'Database & SQL Certification ends in 2 days', at: '1 h ago' },
{ id: 'n3', title: 'Draft reminder', body: 'JavaScript Advanced Concepts has no questions yet', at: 'Yesterday' }];


export function Topbar({ onOpenDrawer, onToggleCollapse }: TopbarProps) {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { exams } = useData();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<'none' | 'bell' | 'profile'>('none');
  const [read, setRead] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenu('none');
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return exams.
    filter(
      (exam) =>
      exam.name.toLowerCase().includes(term) || exam.credentials.examId.toLowerCase().includes(term)
    ).
    slice(0, 5);
  }, [exams, query]);

  const unread = notifications.filter((n) => !read.includes(n.id)).length;

  return (
    <header
      ref={containerRef}
      className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-3 backdrop-blur sm:px-4">
      
      <IconButton label="Open navigation" onClick={onOpenDrawer} className="lg:hidden">
        <MenuIcon aria-hidden className="h-5 w-5" />
      </IconButton>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Examly admin home">
          
          <Wordmark />
        </button>
      </div>

      <IconButton label="Collapse sidebar" onClick={onToggleCollapse} className="hidden lg:inline-flex">
        <PanelLeftIcon aria-hidden className="h-[18px] w-[18px]" />
      </IconButton>

      <div className="relative ml-auto hidden max-w-sm flex-1 sm:block">
        <SearchIcon aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exams or exam IDs"
          aria-label="Search exams"
          className="h-9 w-full rounded-lg border border-line bg-surface-alt/60 pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 transition-[border-color,background-color] duration-150 ease-swift focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10" />
        
        {matches.length > 0 &&
        <ul className="absolute left-0 right-0 top-11 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop">
            {matches.map((exam) =>
          <li key={exam.id}>
                <button
              type="button"
              onClick={() => {
                navigate(`/admin/exams/${exam.id}`);
                setQuery('');
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-ink transition-colors duration-150 ease-swift hover:bg-surface-alt">
              
                  <span className="truncate">{exam.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted">{exam.credentials.examId}</span>
                </button>
              </li>
          )}
          </ul>
        }
      </div>

      <div className="ml-auto flex items-center gap-1 sm:ml-0">
        <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
          {theme === 'dark' ?
          <SunIcon aria-hidden className="h-[18px] w-[18px]" /> :

          <MoonIcon aria-hidden className="h-[18px] w-[18px]" />
          }
        </IconButton>

        <div className="relative">
          <IconButton
            label="Notifications"
            onClick={() => setOpenMenu(openMenu === 'bell' ? 'none' : 'bell')}
            aria-expanded={openMenu === 'bell'}>
            
            <BellIcon aria-hidden className="h-[18px] w-[18px]" />
            {unread > 0 &&
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                {unread}
              </span>
            }
          </IconButton>
          {openMenu === 'bell' &&
          <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <button
                type="button"
                onClick={() => setRead(notifications.map((n) => n.id))}
                className="text-xs font-medium text-primary hover:text-primary-dark">
                
                  Mark all read
                </button>
              </div>
              <ul className="divide-y divide-line">
                {notifications.map((item) =>
              <li key={item.id} className="flex gap-3 px-4 py-3">
                    <span
                  aria-hidden
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                    read.includes(item.id) ? 'bg-line-strong' : 'bg-primary'
                  )} />
                
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink">{item.title}</p>
                      <p className="truncate text-xs text-muted">{item.body}</p>
                      <p className="mt-1 text-2xs uppercase tracking-wide text-muted">{item.at}</p>
                    </div>
                  </li>
              )}
              </ul>
            </div>
          }
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'profile' ? 'none' : 'profile')}
            aria-expanded={openMenu === 'profile'}
            aria-label="Account menu"
            className="ml-1 flex h-9 items-center gap-2 rounded-lg border border-line px-1.5 pr-2.5 transition-colors duration-150 ease-swift hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[11px] font-semibold text-surface">
              {initials(admin?.name ?? 'Admin')}
            </span>
            <span className="hidden text-[13px] font-medium text-ink sm:inline">
              {admin?.name.split(' ')[0] ?? 'Admin'}
            </span>
          </button>
          {openMenu === 'profile' &&
          <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-ink">{admin?.name}</p>
                <p className="truncate text-xs text-muted">{admin?.email}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide text-success">
                  <CheckIcon aria-hidden className="h-3 w-3" /> {admin?.role}
                </p>
              </div>
              <button
              type="button"
              onClick={() => {
                setOpenMenu('none');
                logout();
                navigate('/admin/login');
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-ink transition-colors duration-150 ease-swift hover:bg-surface-alt">
              
                <LogOutIcon aria-hidden className="h-4 w-4 text-muted" />
                Sign out
              </button>
            </div>
          }
        </div>
      </div>
    </header>);

}