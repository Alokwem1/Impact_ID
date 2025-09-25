import { useEffect } from "react";
import { prefetchRouteChunk } from "../routes/routeChunks";

/**
 * Hook: useRoutePrefetch
 * Attaches interaction listeners to elements with a data-prefetch attribute.
 * When hovered/focused, triggers dynamic import of matching route chunk key(s).
 */
let _active = false;
let _detach = null;

/**
 * Non-hook initializer. Safe to call after first paint / idle via dynamic import.
 * Idempotent: multiple calls will not reattach listeners.
 */
export function initRoutePrefetch({ throttleMs = 250, reuseWindowMs = 10000 } = {}) {
  if (_active) return; // already initialized
  _active = true;
  const lastFetched = new Map();
  let lastRun = 0;

  const handler = (e) => {
    const now = Date.now();
    if (now - lastRun < throttleMs) return;
    lastRun = now;
    const target = e.target.closest("[data-prefetch]");
    if (!target) return;
    const keys = (target.getAttribute("data-prefetch") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    keys.forEach((k) => {
      const prev = lastFetched.get(k) || 0;
      if (now - prev < reuseWindowMs) return;
      lastFetched.set(k, now);
      prefetchRouteChunk(k);
    });
  };

  document.addEventListener("pointerenter", handler, true);
  document.addEventListener("focusin", handler, true);

  _detach = () => {
    document.removeEventListener("pointerenter", handler, true);
    document.removeEventListener("focusin", handler, true);
    _active = false;
    _detach = null;
  };
}

/** Dispose listeners if needed (not currently invoked, but useful for HMR / tests). */
export function disposeRoutePrefetch() {
  if (_detach) {
    _detach();
  }
}

/** Legacy hook wrapper retained for backward compatibility (not used in App anymore). */
export function useRoutePrefetch({ throttleMs = 250, reuseWindowMs = 10000 } = {}) {
  useEffect(() => {
    initRoutePrefetch({ throttleMs, reuseWindowMs });
    return () => {
      // We intentionally do NOT auto-dispose on unmount globally since the app likely wants it persistent.
      // If needed, consumers can call disposeRoutePrefetch manually.
    };
  }, [throttleMs, reuseWindowMs]);
}

/** One-off programmatic prefetch (safe no-op on slow connections or data saver). */
export function schedulePrefetch(keys, { delay = 0 } = {}) {
  if (navigator.connection) {
    const { saveData, effectiveType } = navigator.connection;
    if (saveData || ["slow-2g", "2g"].includes(effectiveType)) return; // respect user constraints
  }
  const runner = () => keys.forEach((k) => prefetchRouteChunk(k));
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runner, { timeout: 3000 });
  } else {
    setTimeout(runner, delay);
  }
}
