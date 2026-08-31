import type { ComponentType } from 'react';
import {
  BarChart3Icon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  SettingsIcon,
  UsersIcon } from
'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{className?: string;}>;
  end?: boolean;
}

export const primaryNav: NavItem[] = [
{ label: 'Dashboard', to: '/admin', icon: LayoutDashboardIcon, end: true },
{ label: 'Exams', to: '/admin/exams', icon: FileTextIcon },
{ label: 'Question bank', to: '/admin/questions', icon: LibraryIcon },
{ label: 'Users', to: '/admin/users', icon: UsersIcon },
{ label: 'Results', to: '/admin/results', icon: ClipboardListIcon },
{ label: 'Analytics', to: '/admin/analytics', icon: BarChart3Icon },
{ label: 'Exam Analytics', to: '/admin/exam-analytics', icon: BarChart3Icon },
{ label: 'Settings', to: '/admin/settings', icon: SettingsIcon }];