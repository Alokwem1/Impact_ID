// Centralized React Query key factory for consistent cache management
// Usage examples:
//   queryClient.invalidateQueries({ queryKey: queryKeys.user.me() })
//   useQuery({ queryKey: queryKeys.tasks.detail(taskId), queryFn: ... })

export const queryKeys = {
  user: {
    root: () => ["user"],
    me: () => ["user", "me"],
    profile: (username) => ["user", "profile", username],
    badges: (userId) => ["user", "badges", userId],
    history: (userId) => ["user", "history", userId],
    // Added to replace legacy ['userDashboard'] ad-hoc key usage
    dashboard: () => ["user", "dashboard"],
  },
  tasks: {
    root: () => ["tasks"],
    list: (filters = {}) => ["tasks", "list", filters],
    detail: (taskId) => ["tasks", "detail", taskId],
    submissions: (taskId, userId) => ["tasks", "submissions", taskId, userId],
    quiz: (taskId) => ["tasks", "quiz", taskId],
    categories: () => ["tasks", "categories"],
  },
  badges: {
    root: () => ["badges"],
    all: () => ["badges", "all"],
    stats: () => ["badges", "stats"], // replaces ['badge_stats']
    filtered: (tab, params = {}) => ["badges", "filtered", tab, params],
  },
  leaderboard: {
    root: () => ["leaderboard"],
  },
  weaving: {
    root: () => ["weaving"],
    loom: () => ["weaving", "loom"],
    view: (id) => ["weaving", "view", id],
    status: () => ["weaving", "status"],
    availableThreads: () => ["weaving", "available-threads"],
    leaderboard: () => ["weaving", "leaderboard"],
    analytics: () => ["weaving", "analytics"],
  },
  admin: {
    root: () => ["admin"],
    analytics: (range = "30d") => ["admin", "analytics", range],
    auditLog: (page = 1) => ["admin", "audit-log", page],
    auditLogs: (params = {}) => ["admin", "audit-logs", params], // replaces ['auditLogs', queryParams]
    users: (filters = {}) => ["admin", "users", filters],
    usersBase: () => ["admin", "users"],
    usersList: (filters = {}, sort = {}) => [
      "admin",
      "users",
      { filters, sort },
    ], // replaces ['adminUsers', filters, sortConfig]
    submissions: (filters = {}) => ["admin", "submissions", filters],
    dashboard: () => ["admin", "dashboard"],
    usersRoot: () => ["admin", "users-root"],
    userStats: () => ["admin", "user-stats"], // replaces ['adminUserStats']
    recentActions: () => ["admin", "recent-actions"], // replaces ['recentAdminActions']
    platformHealth: () => ["admin", "platform-health"],
  },
  system: {
    health: () => ["system", "health"],
    config: () => ["system", "config"],
  },
  notifications: {
    count: () => ["notifications", "count"],
  },
  achievements: {
    recent: () => ["achievements", "recent"], // replaces ['recentAchievements']
  },
  activities: {
    recent: () => ["activities", "recent"],
    user: (username) => ["activities", "user", username], // replaces ['userActivities', username]
    userId: (userId) => ["activities", "user-id", userId],
  },
  submissions: {
    root: () => ["submissions"],
    list: (filters = {}) => ["submissions", filters],
  },
  public: {
    profile: (username) => ["public", "profile", username], // replaces ['publicProfile', username]
  },
};

// Helper to bulk invalidate after auth state changes
export const authInvalidateTargets = [
  queryKeys.user.me(),
  queryKeys.user.root(),
  queryKeys.badges.root(),
  queryKeys.leaderboard.root(),
  queryKeys.tasks.root(),
];
