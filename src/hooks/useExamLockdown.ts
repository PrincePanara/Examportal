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

    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
      document.body.classList.remove('exam-locked');
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [security, active]);
}