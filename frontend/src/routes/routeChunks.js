// Central registry of route dynamic import functions so we can reuse for lazy() and prefetching.
// Each value should be a function returning the import() Promise.

export const routeChunks = {
  dashboard: () =>
    import(/* webpackChunkName: "dashboard" */ "../DashboardPage.jsx"),
  admin: () =>
    import(/* webpackChunkName: "admin" */ "../AdminDashboardPage.jsx"),
  onboarding: () =>
    import(/* webpackChunkName: "onboarding" */ "../OnboardingPage.jsx"),
  login: () =>
    import(/* webpackChunkName: "auth-login" */ "../auth/LoginPage.jsx"),
  register: () =>
    import(/* webpackChunkName: "auth-register" */ "../auth/RegisterPage.jsx"),
  verifyEmail: () =>
    import(/* webpackChunkName: "auth-verify" */ "../auth/VerifyEmailPage.jsx"),
  forgotPassword: () =>
    import(
      /* webpackChunkName: "auth-forgot" */ "../auth/ForgotPasswordPage.jsx"
    ),
  resetPassword: () =>
    import(
      /* webpackChunkName: "auth-reset" */ "../auth/ResetPasswordPage.jsx"
    ),
  profile: () =>
    import(/* webpackChunkName: "profile" */ "../user/PublicProfilePage.jsx"),
  badges: () =>
    import(/* webpackChunkName: "badges" */ "../user/BadgeList.jsx"),
  leaderboard: () =>
    import(/* webpackChunkName: "leaderboard" */ "../user/Leaderboard.jsx"),
  tasks: () =>
    import(/* webpackChunkName: "tasks-list" */ "../tasks/TaskList.jsx"),
  taskDetail: () =>
    import(/* webpackChunkName: "task-detail" */ "../tasks/TaskDetailPage.jsx"),
  submissions: () =>
    import(
      /* webpackChunkName: "submissions" */ "../tasks/SubmissionHistoryPage.jsx"
    ),
  quiz: () => import(/* webpackChunkName: "quiz" */ "../tasks/QuizPage.jsx"),
  weaving: () =>
    import(/* webpackChunkName: "weaving" */ "../features/WeavingLoomPage.jsx"),
};

// Suggested prefetch ordering heuristics keyed by current location group.
export const prefetchHeuristics = {
  "/dashboard": ["tasks", "weaving", "badges", "leaderboard"],
  "/tasks": ["quiz", "taskDetail", "dashboard", "badges"],
  "/weaving": ["dashboard", "tasks", "leaderboard"],
};

export function prefetchRouteChunk(key) {
  const loader = routeChunks[key];
  if (!loader) return Promise.resolve();
  return loader().catch(() => {}); // silence errors (e.g., offline)
}

export function prefetchMany(keys) {
  return Promise.all(keys.map(prefetchRouteChunk));
}
