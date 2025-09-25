import { useState, useEffect } from "react";
import {
  SparklesIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  HeartIcon,
  ComputerDesktopIcon,
  BeakerIcon,
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  SparklesIcon as SparklesIconSolid,
  FireIcon as FireIconSolid,
  BoltIcon as BoltIconSolid,
  TrophyIcon as TrophyIconSolid,
  ClockIcon as ClockIconSolid,
} from "@heroicons/react/24/solid";

// Category mapping for thread filtering
const THREAD_CATEGORIES = [
  {
    id: "Environment",
    name: "Environment",
    icon: GlobeAltIcon,
    color: "green",
  },
  { id: "Social Good", name: "Social Good", icon: HeartIcon, color: "pink" },
  {
    id: "Technology",
    name: "Technology",
    icon: ComputerDesktopIcon,
    color: "blue",
  },
  {
    id: "Education",
    name: "Education",
    icon: AcademicCapIcon,
    color: "purple",
  },
  { id: "Health", name: "Health", icon: BeakerIcon, color: "red" },
  { id: null, name: "All Categories", icon: SparklesIcon, color: "gray" },
];

// Time formatting utility
const formatTime = (seconds) => {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  } else if (m > 0) {
    return `${m}m ${s}s`;
  } else {
    return `${s}s`;
  }
};

export default function LoomView({
  status,
  onClaim,
  claiming = false,
  availableThreads = [],
  threadsLoading = false,
  userStats = null,
  leaderboard = [],
  onCategoryFilter = () => {},
  selectedCategory = null,
  onRefreshThreads = () => {},
}) {
  const [timeRemaining, setTimeRemaining] = useState(
    status?.time_remaining_seconds || 0,
  );
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [showThreads, setShowThreads] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Real-time countdown effect
  useEffect(() => {
    if (status) {
      setTimeRemaining(status.time_remaining_seconds || 0);

      if (!status.is_ready && status.time_remaining_seconds > 0) {
        const interval = setInterval(() => {
          setTimeRemaining((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [status]);

  // Check readiness
  const isReady = status?.is_ready && timeRemaining <= 0;
  const hasReachedDailyLimit =
    status?.daily_weaves_completed >= status?.daily_weaves_limit;
  const canWeave = isReady && !hasReachedDailyLimit;

  // Handle thread claiming
  const handleClaim = () => {
    if (selectedThreadId) {
      onClaim(selectedThreadId);
    } else {
      // If no specific thread selected, use the general claim
      onClaim();
    }
  };

  // Get button text based on state
  const getButtonText = () => {
    if (claiming) return "Finding Thread...";
    if (hasReachedDailyLimit)
      return `Daily Limit Reached (${status.daily_weaves_limit})`;
    if (!isReady) return `Ready in ${formatTime(timeRemaining)}`;
    if (selectedThreadId) return "Weave Selected Thread";
    return "Weave Random Thread";
  };

  // Get category color classes
  const getCategoryColor = (categoryId) => {
    const category = THREAD_CATEGORIES.find((cat) => cat.id === categoryId);
    const colorMap = {
      green: "bg-green-100 text-green-700 border-green-300",
      pink: "bg-pink-100 text-pink-700 border-pink-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      red: "bg-red-100 text-red-700 border-red-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colorMap[category?.color] || colorMap.gray;
  };

  // Progress calculation
  const getProgressPercentage = () => {
    if (!status?.daily_weaves_limit) return 0;
    return (status.daily_weaves_completed / status.daily_weaves_limit) * 100;
  };

  if (!status) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading loom status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Loom Interface */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <SparklesIconSolid className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">The Impact Loom</h3>
                <p className="text-purple-100">
                  Transform impact threads into meaningful categorizations
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="text-center">
              <div
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  canWeave
                    ? "bg-green-500 bg-opacity-20 text-green-100"
                    : "bg-yellow-500 bg-opacity-20 text-yellow-100"
                }`}
              >
                {canWeave ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Ready to Weave</span>
                  </>
                ) : (
                  <>
                    <ClockIconSolid className="w-4 h-4" />
                    <span>
                      {hasReachedDailyLimit ? "Daily Limit" : "Cooling Down"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User Stats Row */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <SparklesIconSolid className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">
                  {userStats.essence_balance}
                </div>
                <div className="text-xs text-purple-100">Essence</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <BoltIconSolid className="h-5 w-5 mx-auto mb-1 text-blue-300" />
                <div className="text-lg font-bold">
                  {userStats.daily_weaves_completed}/
                  {userStats.daily_weaves_limit}
                </div>
                <div className="text-xs text-purple-100">Daily Weaves</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <FireIconSolid className="h-5 w-5 mx-auto mb-1 text-red-300" />
                <div className="text-lg font-bold">{userStats.streak}</div>
                <div className="text-xs text-purple-100">Streak</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <TrophyIconSolid className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">
                  {userStats.total_weaves || 0}
                </div>
                <div className="text-xs text-purple-100">Total</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Daily Progress
              </span>
              <span className="text-sm text-gray-500">
                {status.daily_weaves_completed} / {status.daily_weaves_limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Cooldown Timer */}
          {!canWeave && !hasReachedDailyLimit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    Weaving Cooldown Active
                  </h4>
                  <p className="text-yellow-700">
                    Next weaving available in{" "}
                    <span className="font-bold">
                      {formatTime(timeRemaining)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Daily Limit Reached */}
          {hasReachedDailyLimit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ExclamationCircleIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Daily Weaving Limit Reached
                  </h4>
                  <p className="text-blue-700">
                    You've completed {status.daily_weaves_limit} weaves today.
                    Come back tomorrow for more!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thread Selection Toggle */}
          {canWeave && (
            <div className="flex space-x-4">
              <button
                onClick={() => setShowThreads(!showThreads)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>{showThreads ? "Hide" : "Browse"} Available Threads</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <TrophyIcon className="h-4 w-4" />
                <span>{showLeaderboard ? "Hide" : "View"} Leaderboard</span>
              </button>
            </div>
          )}

          {/* Available Threads Panel */}
          {showThreads && canWeave && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  Available Threads ({status.available_threads || 0})
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onRefreshThreads}
                    disabled={threadsLoading}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                    title="Refresh threads"
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 ${threadsLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {THREAD_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;

                    return (
                      <button
                        key={category.id || "all"}
                        onClick={() => onCategoryFilter(category.id)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          isSelected
                            ? getCategoryColor(category.id)
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threads List */}
              {threadsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-lg border animate-pulse"
                    >
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : availableThreads.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`bg-white p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedThreadId === thread.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setSelectedThreadId(
                          selectedThreadId === thread.id ? null : thread.id,
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {thread.title ||
                              thread.meta_data?.title ||
                              "Impact Thread"}
                          </h5>
                          {thread.summary && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {thread.summary}
                            </p>
                          )}
                        </div>

                        {selectedThreadId === thread.id && (
                          <div className="ml-3 flex-shrink-0">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Source: {thread.source || "Web"}</span>
                        {thread.category && (
                          <span
                            className={`px-2 py-1 rounded-full ${getCategoryColor(thread.category)}`}
                          >
                            {thread.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GlobeAltIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No threads available in this category.</p>
                  <p className="text-sm">
                    Try selecting a different category or refresh.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Panel */}
          {showLeaderboard && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrophyIcon className="h-5 w-5 text-yellow-600" />
                <span>Weekly Weaving Leaders</span>
              </h4>

              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.username}
                      className="flex items-center space-x-3 p-2 bg-white rounded-lg"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-amber-600"
                                : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {entry.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.weave_count} weaves • {entry.total_essence}{" "}
                          essence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Leaderboard loading...
                </p>
              )}
            </div>
          )}

          {/* Main Action Button */}
          <button
            onClick={handleClaim}
            disabled={!canWeave || claiming}
            className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform ${
              canWeave && !claiming
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } disabled:transform-none`}
          >
            {claiming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Finding Thread...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <SparklesIconSolid className="h-5 w-5" />
                <span>{getButtonText()}</span>
              </div>
            )}
          </button>

          {/* Help Text */}
          {canWeave && (
            <div className="text-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
              <InformationCircleIcon className="h-4 w-4 inline mr-1" />
              {selectedThreadId
                ? "You'll weave the selected thread above."
                : "A random thread will be selected for you to weave."}
            </div>
          )}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          <span>Platform Activity</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {status.available_threads || 0}
            </div>
            <div className="text-sm text-gray-600">Available Threads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {userStats?.essence_balance || 0}
            </div>
            <div className="text-sm text-gray-600">Your Essence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {userStats?.streak || 0}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {userStats?.total_weaves || 0}
            </div>
            <div className="text-sm text-gray-600">Total Weaves</div>
          </div>
        </div>
      </div>
    </div>
  );
}
