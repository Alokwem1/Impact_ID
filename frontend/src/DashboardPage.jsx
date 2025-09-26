import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./api/queryKeys";
import { Link } from "react-router-dom";
import {
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  MapPinIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
  SparklesIcon as SparklesIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";
import { useAuth } from "./utils/AuthContext";
import Layout from "./tasks/Layout";
import TaskList from "./tasks/TaskList";
import Leaderboard from "./user/Leaderboard";
import BadgeList from "./user/BadgeList";
import apiClient from "./api/axios";
import toast from "react-hot-toast";
import SectionHeader from "./components/ui/SectionHeader";
import StatCard from "./components/ui/StatCard";
import { ENABLE_UI_ENHANCEMENTS } from "./config/featureFlags";

// ================================
// 📊 DASHBOARD DATA FETCHING
// ================================

// Fetch comprehensive user dashboard data
const fetchDashboardData = async () => {
  const { data } = await apiClient.get("/api/dashboard");
  return data;
};

// Fetch user's recent achievements
const fetchRecentAchievements = async () => {
  const { data } = await apiClient.get("/api/users/achievements/recent", {
    params: { limit: 3 },
  });
  return data;
};

// ================================
// 📈 ENHANCED USER PROFILE SUMMARY
// ================================

/**
 * Enhanced UserProfileSummary component with comprehensive user stats
 */
const UserProfileSummary = ({ dashboardData }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Calculate XP progress to next level
  const getXpForNextLevel = (currentXp) => {
    const level = Math.floor(currentXp / 1000) + 1;
    return level * 1000;
  };

  const getXpProgress = (currentXp) => {
    const currentLevel = Math.floor(currentXp / 1000);
    const xpInCurrentLevel = currentXp - currentLevel * 1000;
    return (xpInCurrentLevel / 1000) * 100;
  };

  const nextLevelXp = getXpForNextLevel(user.xp || 0);
  const progressPercent = getXpProgress(user.xp || 0);
  const currentLevel = Math.floor((user.xp || 0) / 1000) + 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* User Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {user.username?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          {user.is_verified && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircleIconSolid className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user.username}
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              Level {currentLevel}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
          {user.streak > 0 && (
            <div className="flex items-center mt-1">
              <FireIconSolid className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {user.streak} day streak!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Level {currentLevel} Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(user.xp || 0).toLocaleString()} / {nextLevelXp.toLocaleString()}{" "}
            XP
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {(nextLevelXp - (user.xp || 0)).toLocaleString()} XP to next level
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <CheckCircleIconSolid className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-1" />
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {user.task_count || 0}
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Tasks Completed
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <SparklesIconSolid className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-1" />
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {user.essence_balance || 0}
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Essence
          </div>
        </div>

        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <StarIconSolid className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-1" />
            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {user.badge_count || 0}
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Badges</div>
        </div>

        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrophyIconSolid className="h-5 w-5 text-green-600 dark:text-green-400 mr-1" />
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {user.xp || 0}
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total XP
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/profile"
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <UserIcon className="h-4 w-4" />
          <span>Profile</span>
        </Link>
        <Link
          to="/leaderboard"
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors"
        >
          <ChartBarIcon className="h-4 w-4" />
          <span>Rankings</span>
        </Link>
      </div>
    </div>
  );
};

// ================================
// 🎯 DAILY GOALS COMPONENT
// ================================

/**
 * Daily Goals component showing progress towards daily objectives
 */
const DailyGoals = ({ dashboardData }) => {
  if (!dashboardData?.daily_goals) return null;

  const { daily_goals } = dashboardData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Daily Goals
        </h3>
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Tasks Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Complete Tasks
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {daily_goals.tasks_completed || 0} /{" "}
              {daily_goals.tasks_target || 3}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((daily_goals.tasks_completed || 0) / (daily_goals.tasks_target || 3)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* XP Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Earn XP
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {daily_goals.xp_earned || 0} / {daily_goals.xp_target || 100}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((daily_goals.xp_earned || 0) / (daily_goals.xp_target || 100)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Streak Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Maintain Streak
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {daily_goals.streak_maintained ? "Maintained" : "Pending"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                daily_goals.streak_maintained
                  ? "bg-gradient-to-r from-orange-500 to-red-500 w-full"
                  : "bg-gray-300 dark:bg-gray-600 w-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {daily_goals.all_completed && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIconSolid className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              All daily goals completed! 🎉
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================
// 🏆 RECENT ACHIEVEMENTS COMPONENT
// ================================

/**
 * Recent Achievements component showing latest badges and milestones
 */
const RecentAchievements = () => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: queryKeys.achievements.recent(),
    queryFn: fetchRecentAchievements,
    onError: (error) => {
      console.error("Failed to fetch achievements:", error);
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Achievements
        </h3>
        <div className="text-center py-6">
          <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Complete tasks to earn your first achievement!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Achievements
        </h3>
        <Link
          to="/badges"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <TrophyIconSolid className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {achievement.badge_title || achievement.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Earned{" "}
                {new Date(
                  achievement.awarded_at || achievement.created_at,
                ).toLocaleDateString()}
              </p>
            </div>
            {achievement.xp_reward && (
              <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                +{achievement.xp_reward} XP
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ================================
// 📊 ACTIVITY SUMMARY COMPONENT
// ================================

/**
 * Activity Summary component showing recent platform activity
 */
const ActivitySummary = ({ dashboardData }) => {
  if (!dashboardData) return null;

  const stats = [
    {
      label: "This Week",
      value: dashboardData.this_week_stats?.tasks_completed || 0,
      icon: CheckCircleIcon,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "This Month",
      value: dashboardData.this_month_stats?.xp_earned || 0,
      icon: TrophyIcon,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      suffix: " XP",
    },
    {
      label: "Global Rank",
      value: dashboardData.global_rank || "Unranked",
      icon: ChartBarIcon,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      prefix: "#",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Activity Summary
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stat.label}
                    </p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.prefix}
                      {stat.value}
                      {stat.suffix}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================================
// 🏠 MAIN DASHBOARD COMPONENT
// ================================

/**
 * Enhanced DashboardPage with comprehensive user experience
 */
export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Fetch dashboard data with real-time updates
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: queryKeys.user.dashboard(),
    queryFn: fetchDashboardData,
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    onError: (error) => {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    },
  });

  // ✅ CRITICAL FIX: Handle loading state to prevent destructuring errors
  if (loading || dashboardLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ✅ CRITICAL FIX: Handle case where user is null
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Unable to load dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Please try refreshing the page or logging in again
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  Welcome back, {user.username}! 👋
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Ready to make an impact today?
                </p>
              </div>

              {/* Welcome Back Banner for New Users */}
              {dashboardData?.is_new_user && (
                <div className="hidden lg:block">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <SparklesIconSolid className="h-5 w-5" />
                      <span className="font-medium">New to Impact ID?</span>
                    </div>
                    <p className="text-sm mt-1 opacity-90">
                      Complete your first task to get started!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Bar */}
            {dashboardData && (
              ENABLE_UI_ENHANCEMENTS ? (
                <div className="mt-6 space-y-4">
                  <SectionHeader title="Quick stats" subtitle="Snapshot of your progress" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Today"
                      value={dashboardData.tasks_completed_today || 0}
                      icon={<CheckCircleIconSolid className="h-6 w-6 text-green-500" />}
                    />
                    <StatCard
                      label="Streak"
                      value={user.streak || 0}
                      icon={<FireIconSolid className="h-6 w-6 text-orange-500" />}
                    />
                    <StatCard
                      label="Level"
                      value={Math.floor((user.xp || 0) / 1000) + 1}
                      icon={<TrophyIconSolid className="h-6 w-6 text-yellow-500" />}
                    />
                    <StatCard
                      label="Essence"
                      value={user.essence_balance || 0}
                      icon={<SparklesIconSolid className="h-6 w-6 text-purple-500" />}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105"
                    aria-label="Tasks Completed Today"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <div className="flex items-center">
                      <CheckCircleIconSolid className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {dashboardData.tasks_completed_today || 0}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Today
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <FireIconSolid className="h-8 w-8 text-orange-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {user.streak || 0}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Streak
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <TrophyIconSolid className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {Math.floor((user.xp || 0) / 1000) + 1}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Level
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <SparklesIconSolid className="h-8 w-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {user.essence_balance || 0}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Essence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Main grid layout for the dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
            {/* Primary Column: Task List */}
            <div className="xl:col-span-2 space-y-8">
              <section aria-labelledby="task-list-title">
                <h2 id="task-list-title" className="sr-only">
                  Your Daily Tasks
                </h2>
                <TaskList />
              </section>
            </div>

            {/* Sidebar Columns: Profile and Secondary Content */}
            <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-8">
              {/* Left Sidebar */}
              <div className="space-y-6">
                <section aria-labelledby="profile-summary-title">
                  <h2 id="profile-summary-title" className="sr-only">
                    Profile Summary
                  </h2>
                  <UserProfileSummary dashboardData={dashboardData} />
                </section>

                <section aria-labelledby="daily-goals-title" role="region">
                  <h2 id="daily-goals-title" className="sr-only">
                    Daily Goals
                  </h2>
                  <DailyGoals dashboardData={dashboardData} />
                </section>

                <section aria-labelledby="activity-summary-title">
                  <h2 id="activity-summary-title" className="sr-only">
                    Activity Summary
                  </h2>
                  <ActivitySummary dashboardData={dashboardData} />
                </section>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <section aria-labelledby="achievements-title" role="region">
                  <h2 id="achievements-title" className="sr-only">
                    Recent Achievements
                  </h2>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <RecentAchievements />
                  </React.Suspense>
                </section>

                <section aria-labelledby="badges-title">
                  <h2 id="badges-title" className="sr-only">
                    Your Badges
                  </h2>
                  <BadgeList />
                </section>

                <section aria-labelledby="leaderboard-title">
                  <h2 id="leaderboard-title" className="sr-only">
                    Leaderboard
                  </h2>
                  <Leaderboard />
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
 
