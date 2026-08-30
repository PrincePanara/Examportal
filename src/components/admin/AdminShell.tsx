import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { SidebarNav } from './Sidebar';
import { Topbar } from './Topbar';
import { Wordmark } from '../Brand';
import { IconButton } from '../ui/Button';
import { cn } from '../../utils/format';

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <Topbar onOpenDrawer={() => setDrawerOpen(true)} onToggleCollapse={() => setCollapsed((c) => !c)} />

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-14 z-30 hidden border-r border-line bg-surface transition-[width] duration-200 ease-swift lg:block',
          collapsed ? 'w-[68px]' : 'w-60'
        )}>
        
        <SidebarNav collapsed={collapsed} />
      </aside>

      <AnimatePresence>
        {drawerOpen &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setDrawerOpen(false)} />
          
            <motion.aside
            role="dialog"
            aria-label="Navigation"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-y-0 left-0 flex w-[264px] flex-col border-r border-line bg-surface">
            
              <div className="flex h-14 items-center justify-between border-b border-line px-4">
                <Wordmark />
                <IconButton label="Close navigation" onClick={() => setDrawerOpen(false)}>
                  <XIcon aria-hidden className="h-4 w-4" />
                </IconButton>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </div>
        }
      </AnimatePresence>

      <main
        className={cn(
          'pt-14 transition-[padding] duration-200 ease-swift',
          collapsed ? 'lg:pl-[68px]' : 'lg:pl-60'
        )}>
        
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>);

}