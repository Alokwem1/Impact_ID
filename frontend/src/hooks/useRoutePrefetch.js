import { useEffect } from 'react';
import { prefetchRouteChunk } from '../routes/routeChunks';

/**
 * Hook: useRoutePrefetch
 * Attaches interaction listeners to elements with a data-prefetch attribute.
 * When hovered/focused, triggers dynamic import of matching route chunk key(s).
 */
export function useRoutePrefetch() {
  useEffect(() => {
    const handler = (e) => {
      const target = e.target.closest('[data-prefetch]');
      if (!target) return;
      const keys = (target.getAttribute('data-prefetch') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      keys.forEach(k => prefetchRouteChunk(k));
    };
    document.addEventListener('mouseenter', handler, true);
    document.addEventListener('focus', handler, true);
    return () => {
      document.removeEventListener('mouseenter', handler, true);
      document.removeEventListener('focus', handler, true);
    };
  }, []);
}

/** One-off programmatic prefetch (safe no-op on slow connections or data saver). */
export function schedulePrefetch(keys, { delay = 0 } = {}) {
  if (navigator.connection) {
    const { saveData, effectiveType } = navigator.connection;
    if (saveData || ['slow-2g', '2g'].includes(effectiveType)) return; // respect user constraints
  }
  const runner = () => keys.forEach(k => prefetchRouteChunk(k));
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runner, { timeout: 3000 });
  } else {
    setTimeout(runner, delay);
  }
}
