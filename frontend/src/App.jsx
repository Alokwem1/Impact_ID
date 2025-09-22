import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import RouteErrorBoundary from './errors/RouteErrorBoundary';
import { AnimatePresence } from "framer-motion";

// Enhanced imports
import { AuthProvider } from './utils/AuthContext';
import { ThemeProvider } from './ThemeContext';
import A11yInspector from './dev/A11yInspector';
import ProtectedRoute from './utils/protectedRoute';
import WebSocketManager from './WebSocketManager';

// Centralized chunk registry for consistency (imported functions reused for prefetch)
import { routeChunks, prefetchRouteChunk, prefetchMany, prefetchHeuristics } from './routes/routeChunks';
import { useRoutePrefetch, schedulePrefetch } from './hooks/useRoutePrefetch';

// Lazy wrappers referencing registry (ensures single dynamic import site per chunk)
const DashboardPage = lazy(routeChunks.dashboard);
const AdminDashboardPage = lazy(routeChunks.admin);
const LoginPage = lazy(routeChunks.login);
const RegisterPage = lazy(routeChunks.register);
const OnboardingPage = lazy(routeChunks.onboarding);
const VerifyEmailPage = lazy(routeChunks.verifyEmail);
const ForgotPasswordPage = lazy(routeChunks.forgotPassword);
const ResetPasswordPage = lazy(routeChunks.resetPassword);
const PublicProfilePage = lazy(routeChunks.profile);
const TaskDetailPage = lazy(routeChunks.taskDetail);
const TaskListPage = lazy(routeChunks.tasks);
const SubmissionHistoryPage = lazy(routeChunks.submissions);
const WeavingLoomPage = lazy(routeChunks.weaving);
const BadgeListPage = lazy(routeChunks.badges);
const LeaderboardPage = lazy(routeChunks.leaderboard);
const QuizPage = lazy(routeChunks.quiz);

// Enhanced React Query client with safer error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const status = error?.response?.status || error?.status;
        if (status === 401) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Enhanced Error Fallback
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 18.5C2.962 20.333 3.924 22 5.464 22z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Oops! Something went wrong
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We're sorry, but there was an error loading Impact ID. This might be temporary.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          aria-label="Retry loading the application"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          🔄 Try Again
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          aria-label="Go back to home page"
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          🏠 Go Home
        </button>
      </div>
      
      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
            {String(error)}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Accessible Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div className="flex flex-col items-center space-y-6">
      {/* Impact ID Logo Animation */}
      <div className="relative" role="status" aria-live="polite">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3.09 8.26L4 21L12 22L20 21L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 animate-ping"></div>
      </div>
      
      {/* Loading Animation */}
      <div className="flex space-x-1" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      {/* Loading Text */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Impact ID
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
          Loading your impact journey...
        </p>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation(); // for AnimatePresence transitions
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 🌐 PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute requireVerification={false}>
              <OnboardingPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/:username" 
          element={
            <ProtectedRoute>
              <PublicProfilePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/badges" 
          element={
            <ProtectedRoute>
              <BadgeListPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <TaskListPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tasks/:taskId" 
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/quiz/:taskId" 
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/submissions" 
          element={
            <ProtectedRoute>
              <SubmissionHistoryPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/weaving" 
          element={
            <ProtectedRoute>
              <WeavingLoomPage />
            </ProtectedRoute>
          } 
        />

        {/* 🔄 REDIRECTS */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        {/* If not logged in, go to login instead of looping to dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Attach delegated prefetch listeners
  useRoutePrefetch();

  // Heuristic idle prefetch based on current path
  useEffect(() => {
    const path = window.location.pathname;
    const heuristicKeys = Object.entries(prefetchHeuristics).find(([prefix]) => path.startsWith(prefix))?.[1];
    if (heuristicKeys) schedulePrefetch(heuristicKeys, { delay: 500 });
  }, []);

  // Developer debug helpers
  useEffect(() => {
    if (import.meta.env.DEV) {
      const api = {
        prefetch: (key) => prefetchRouteChunk(key),
        prefetchMany: (keys) => prefetchMany(keys),
        loadedChunks: () => Object.keys(performance.getEntriesByType('resource').reduce((acc, r) => { if (/chunk|quiz|tasks|dashboard/i.test(r.name)) acc[r.name] = true; return acc; }, {}))
      };
  console.log('%c[Perf] Route prefetch API available as window.__IMPACT_PERF__', 'color:#2563eb');
      window.__IMPACT_PERF__ = api;
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <QueryClientProvider client={queryClient}> 
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                <WebSocketManager />
                <RouteErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AnimatedRoutes />
                  </Suspense>
                </RouteErrorBoundary>
                {import.meta.env.DEV && <A11yInspector />}
              </div>

              <Toaster 
                position="top-right"
                containerClassName="z-50"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-surface, #fff)',
                    color: 'var(--color-text-primary, #000)',
                    fontSize: '14px',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-lg, 0 2px 8px rgba(0,0,0,0.15))',
                    border: '1px solid var(--color-border, #e5e7eb)',
                  },
                  success: {
                    style: {
                      background: 'var(--toast-success-bg, #d1fae5)',
                      color: 'var(--toast-success-text, #065f46)',
                    },
                  },
                  error: {
                    style: {
                      background: 'var(--toast-error-bg, #fee2e2)',
                      color: 'var(--toast-error-text, #991b1b)',
                    },
                  },
                  loading: {
                    style: {
                      background: 'var(--toast-info-bg, #bfdbfe)',
                      color: 'var(--toast-info-text, #1e3a8a)',
                    },
                  },
                }}
              />
              
              {import.meta.env.DEV && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
              )}
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
