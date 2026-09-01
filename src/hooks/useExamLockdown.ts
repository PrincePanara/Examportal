import { useEffect } from 'react';
import type { ExamSecurity } from '../types';

/**
 * Browser-level deterrents for the controlled exam environment.
 *
 * These are deterrents only — they are trivially bypassable and are NOT a
 * security boundary. Real enforcement (authorisation, timing, submission
 * validation) lives in the service/server layer.
 */
export function useExamLockdown(security: ExamSecurity | null, active: boolean) {
  useEffect(() => {
    if (!active || !security) return;

    const block = (event: Event) => {
      event.preventDefault();
    };

    if (security.blockCopy) document.addEventListener('copy', block);
    if (security.blockPaste) document.addEventListener('paste', block);
    if (security.blockCopy) document.addEventListener('cut', block);
    if (security.blockContextMenu) document.addEventListener('contextmenu', block);
    if (security.blockSelection) document.body.classList.add('exam-locked');

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!security.lockNavigation) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    const blockShortcuts = (event: KeyboardEvent) => {
      // Block Print (Ctrl+P or Cmd+P)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
      }
      // Block F12 (DevTools)
      if (event.key === 'F12') {
        event.preventDefault();
      }
      // Block Ctrl+Shift+I / Ctrl+Shift+J / Cmd+Option+I / Cmd+Option+J (DevTools)
      if ((event.ctrlKey || event.metaKey) && (event.shiftKey || event.altKey)) {
        const key = event.key.toLowerCase();
        if (key === 'i' || key === 'j' || key === 'c' || key === 'u') {
          event.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', blockShortcuts);

    let printStyle = document.getElementById('exam-print-lockdown');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'exam-print-lockdown';
      printStyle.innerHTML = `@media print { body { display: none !important; } }`;
      document.head.appendChild(printStyle);
    }

    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
      document.body.classList.remove('exam-locked');
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('keydown', blockShortcuts);
      const style = document.getElementById('exam-print-lockdown');
      if (style) style.remove();
    };
  }, [security, active]);
}