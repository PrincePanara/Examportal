import { useEffect, useRef, useState } from 'react';

/**
 * Client-side ticker for display only. The authoritative expiry timestamp is
 * issued and validated by the server (see `api.startSession` / `api.submitSession`).
 */
export function useCountdown(expiresAt: number | null, onExpire?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
  expiresAt ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : 0
  );
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    if (!expiresAt) return;
    const tick = () => {
      const next = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0 && !fired.current) {
        fired.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpire]);

  return secondsLeft;
}