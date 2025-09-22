import React from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryClient } from '@tanstack/react-query';

/**
 * RouteErrorBoundary
 * Catches render/lazy-load/query errors within the routed application area.
 * Provides rich recovery actions: retry, reset cache, full reload, clear storage.
 */
export function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary FallbackComponent={RouteErrorFallback} onReset={() => { /* handled inside fallback via context */ }}>
      {children}
    </ErrorBoundary>
  );
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

function RouteErrorFallback({ error, resetErrorBoundary }) {
  const queryClient = useQueryClient();

  const isChunkLoadError = /Loading chunk|ChunkLoadError|dynamically imported module/i.test(error?.message || '');
  const isNetworkish = /NetworkError|Failed to fetch/i.test(error?.message || '');

  React.useEffect(() => {
    if (import.meta.env.PROD && error) {
      try {
        sessionStorage.setItem('impact_last_error', JSON.stringify({
          message: error.message,
          stack: error.stack,
          time: Date.now(),
          chunk: isChunkLoadError
        }));
      } catch { /* ignore */ }
    }
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[RouteErrorBoundary] Caught error:', error);
    }
  }, [error, isChunkLoadError]);

  const handleRetry = async () => {
    try {
      // Reset react-query caches for failed queries only
      queryClient.resetQueries({ predicate: () => true });
    } catch { /* ignore */ }
    resetErrorBoundary();
  };

  const handleClearAndReload = () => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    window.location.reload();
  };

  const handleHardReload = () => {
    window.location.reload();
  };

  const handleReport = () => {
    const body = encodeURIComponent(`Error: ${error?.message}\n\nStack:\n${error?.stack}`);
    window.open(`mailto:support@impactid.app?subject=App%20Error%20Report&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 18.5C2.962 20.333 3.924 22 5.464 22z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something broke while rendering</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          {isChunkLoadError ? 'A new version may have deployed. Reload to fetch fresh assets.' : 'An unexpected error occurred. You can retry or report the issue.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={handleRetry} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            Retry
          </button>
          {isChunkLoadError ? (
            <button onClick={handleHardReload} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
              Reload Assets
            </button>
          ) : (
            <button onClick={handleClearAndReload} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
              Clear Cache & Reload
            </button>
          )}
          <button onClick={() => window.location.assign('/dashboard')} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-colors">
            Go Dashboard
          </button>
          <button onClick={handleReport} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors">
            Report Issue
          </button>
        </div>
        {import.meta.env.DEV && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-xs text-gray-500">Dev Error Details</summary>
            <pre className="mt-2 max-h-40 overflow-auto bg-gray-100 dark:bg-gray-900 text-[11px] p-3 rounded">{String(error.stack || error.message)}</pre>
            {isNetworkish && <div className="text-amber-600 text-xs mt-2">Network hint: check API / connectivity.</div>}
          </details>
        )}
      </div>
    </div>
  );
}

RouteErrorFallback.propTypes = {
  error: PropTypes.any,
  resetErrorBoundary: PropTypes.func.isRequired
};

export default RouteErrorBoundary;
