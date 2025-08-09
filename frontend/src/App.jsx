import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

// Enhanced imports
import { AuthProvider } from './utils/AuthContext';
import { ThemeProvider } from './ThemeContext';
import ProtectedRoute from './utils/protectedRoute';
import WebSocketManager from './WebSocketManager';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./DashboardPage'));
const AdminDashboardPage = lazy(() => import('./AdminDashboardPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const RegisterPage = lazy(() => import('./auth/RegisterPage'));
const OnboardingPage = lazy(() => import('./OnboardingPage'));
const VerifyEmailPage = lazy(() => import('./auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./auth/ResetPasswordPage'));
const PublicProfilePage = lazy(() => import('./user/PublicProfilePage'));
const TaskDetailPage = lazy(() => import('./tasks/TaskDetailPage'));
const TaskListPage = lazy(() => import('./tasks/TaskList'));
const SubmissionHistoryPage = lazy(() => import('./tasks/SubmissionHistoryPage'));
const WeavingLoomPage = lazy(() => import('./features/WeavingLoomPage'));
const BadgeListPage = lazy(() => import('./user/BadgeList'));
const LeaderboardPage = lazy(() => import('./user/Leaderboard'));
const QuizPage = lazy(() => import('./tasks/QuizPage'));

// Enhanced React Query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.response?.status === 401) return false;
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

// Enhanced Error Fallback Component
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          🔄 Try Again
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
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
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Enhanced loading component with Impact ID branding
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div className="flex flex-col items-center space-y-6">
      {/* Impact ID Logo Animation */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3.09 8.26L4 21L12 22L20 21L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 animate-ping"></div>
      </div>
      
      {/* Loading Animation */}
      <div className="flex space-x-1">
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
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}> 
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                {/* WebSocket Manager for real-time features */}
                <WebSocketManager />
                
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* 🌐 PUBLIC ROUTES */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/signup" element={<Navigate to="/register" replace />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    
                    {/* 🔒 PROTECTED ROUTES */}
                    
                    {/* Main Dashboard */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Onboarding (for new users) */}
                    <Route 
                      path="/onboarding" 
                      element={
                        <ProtectedRoute requireVerification={false}>
                          <OnboardingPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute roles={['admin']}>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* User Features */}
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
                    
                    {/* Task Management */}
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
                    
                    {/* Impact Weaving */}
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
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </div>
              
              {/* Enhanced toast notifications with Impact ID theming */}
              <Toaster 
                position="top-right"
                containerClassName="z-50"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--color-border)',
                  },
                  success: {
                    style: {
                      background: 'var(--toast-success-bg)',
                      color: 'var(--toast-success-text)',
                    },
                    iconTheme: {
                      primary: 'var(--toast-success-text)',
                      secondary: 'var(--toast-success-bg)',
                    },
                  },
                  error: {
                    style: {
                      background: 'var(--toast-error-bg)',
                      color: 'var(--toast-error-text)',
                    },
                    iconTheme: {
                      primary: 'var(--toast-error-text)',
                      secondary: 'var(--toast-error-bg)',
                    },
                  },
                  loading: {
                    style: {
                      background: 'var(--toast-info-bg)',
                      color: 'var(--toast-info-text)',
                    },
                    iconTheme: {
                      primary: 'var(--toast-info-text)',
                      secondary: 'var(--toast-info-bg)',
                    },
                  },
                }}
              />
              
              {/* React Query Devtools - only in development */}
              {import.meta.env.DEV && (
                <ReactQueryDevtools 
                  initialIsOpen={false}
                  position="bottom-right"
                />
              )}
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;