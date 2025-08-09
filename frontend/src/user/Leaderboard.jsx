import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    TrophyIcon,
    ChartBarIcon,
    FireIcon,
    SparklesIcon,
    StarIcon,
    UserGroupIcon,
    ClockIcon,
    ArrowPathIcon,
    AdjustmentsHorizontalIcon,
    InformationCircleIcon,
    CalendarIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophyIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    FireIcon as FireIconSolid,
    SparklesIcon as SparklesIconSolid,
    StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

// ✅ FIXED: Leaderboard types matching your #backend router exactly
const LEADERBOARD_TYPES = {
    xp: {
        label: 'XP Rankings',
        icon: TrophyIcon,
        iconSolid: TrophyIconSolid,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Total experience points earned'
    },
    tasks: {
        label: 'Task Masters',
        icon: ChartBarIcon,
        iconSolid: ChartBarIconSolid,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Most tasks completed'
    },
    streak: {
        label: 'Streak Champions',
        icon: FireIcon,
        iconSolid: FireIconSolid,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Longest active streaks'
    },
    essence: {
        label: 'Essence Leaders',
        icon: SparklesIcon,
        iconSolid: SparklesIconSolid,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Highest essence balance'
    },
    badges: {
        label: 'Badge Collectors',
        icon: StarIcon,
        iconSolid: StarIconSolid,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Most badges earned'
    },
    weaving: {
        label: 'Weaving Masters',
        icon: UserGroupIcon,
        iconSolid: UserGroupIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        description: 'Most threads woven'
    }
};

// ✅ FIXED: Time periods matching your #backend enum exactly
const TIME_PERIODS = {
    all_time: { label: 'All Time', icon: CalendarIcon },
    daily: { label: 'Today', icon: CalendarIcon },
    weekly: { label: 'This Week', icon: CalendarIcon },
    monthly: { label: 'This Month', icon: CalendarIcon },
    yearly: { label: 'This Year', icon: CalendarIcon }
};

export default function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [stats, setStats] = useState(null);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [userPosition, setUserPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeType, setActiveType] = useState('xp');
    const [activePeriod, setActivePeriod] = useState('all_time');
    const [showStats, setShowStats] = useState(false);

    // ✅ FIXED: Corrected API endpoint to match your #backend leaderboard router
    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/leaderboard/', {
                params: {
                    leaderboard_type: activeType,
                    period: activePeriod,
                    limit: 50
                }
            });
            setLeaderboardData(response.data);
            setError('');
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
            const errorMessage = err.response?.data?.detail || 'Could not load the leaderboard.';
            setError(errorMessage);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    }, [activeType, activePeriod]);

    // ✅ FIXED: Corrected API endpoint for user position
    const fetchUserPosition = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/leaderboard/my-position', {
                params: {
                    leaderboard_type: activeType,
                    period: activePeriod
                }
            });
            setUserPosition(response.data);
        } catch (err) {
            // User might not be ranked yet or not authenticated
            setUserPosition(null);
        }
    }, [activeType, activePeriod]);

    // ✅ FIXED: Corrected API endpoints for stats and achievements
    const fetchStats = useCallback(async () => {
        try {
            const [statsResponse, achievementsResponse] = await Promise.all([
                apiClient.get('/api/leaderboard/stats'),
                apiClient.get('/api/leaderboard/recent-achievements', { params: { limit: 5 } })
            ]);
            setStats(statsResponse.data);
            setRecentAchievements(achievementsResponse.data);
        } catch (err) {
            console.error('Stats fetch error:', err);
            // Don't show error toast for stats since it's optional
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
        fetchUserPosition();
    }, [fetchLeaderboard, fetchUserPosition]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleTypeChange = (type) => {
        setActiveType(type);
    };

    const handlePeriodChange = (period) => {
        setActivePeriod(period);
    };

    const renderPodiumEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    // ✅ ENHANCED: Better score formatting based on your #backend LeaderboardEntry schema
    const formatScore = (entry) => {
        switch (activeType) {
            case 'xp':
                return `${entry.score.toLocaleString()} XP`;
            case 'tasks':
                return `${entry.score} task${entry.score !== 1 ? 's' : ''}`;
            case 'streak':
                return `${entry.score} day${entry.score !== 1 ? 's' : ''}`;
            case 'essence':
                return `${entry.score.toLocaleString()} essence`;
            case 'badges':
                return `${entry.score} badge${entry.score !== 1 ? 's' : ''}`;
            case 'weaving':
                return `${entry.score} thread${entry.score !== 1 ? 's' : ''}`;
            default:
                return `${entry.score} pts`;
        }
    };

    // ✅ ENHANCED: Better additional data formatting based on your #backend structure
    const formatAdditionalData = (data, type) => {
        if (!data || Object.keys(data).length === 0) return null;

        const formatters = {
            xp: {
                'level': (value) => `Level ${value}`,
                'streak': (value) => `${value}-day streak`,
                'essence_balance': (value) => `${value.toLocaleString()} essence`
            },
            tasks: {
                'avg_xp_per_task': (value) => `${value} avg XP`,
                'tasks_completed': (value) => `${value} completed`
            },
            streak: {
                'last_task_date': (value) => `Last: ${new Date(value).toLocaleDateString()}`
            },
            weaving: {
                'total_essence': (value) => `${value.toLocaleString()} essence earned`
            }
        };

        const typeFormatters = formatters[type] || {};
        
        return Object.entries(data).map(([key, value]) => {
            const formatter = typeFormatters[key];
            const displayValue = formatter ? formatter(value) : `${key.replace(/_/g, ' ')}: ${value}`;
            return { key, displayValue };
        });
    };

    const currentTypeConfig = LEADERBOARD_TYPES[activeType];
    const CurrentIcon = currentTypeConfig.icon;
    const CurrentIconSolid = currentTypeConfig.iconSolid;

    // Enhanced loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-gray-300 h-8 w-8"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
            ))}
        </div>
    );

    if (loading && leaderboardData.length === 0) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Loading leaderboard...</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md">
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Better Stats Toggle */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                        <CurrentIconSolid className={`h-8 w-8 ${currentTypeConfig.color}`} />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {currentTypeConfig.label}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {currentTypeConfig.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <InformationCircleIcon className="h-4 w-4" />
                            <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                fetchLeaderboard();
                                fetchUserPosition();
                                fetchStats();
                            }}
                            disabled={loading}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced User Position Display */}
                {userPosition && (
                    <div className={`p-3 rounded-lg border ${currentTypeConfig.bgColor} ${currentTypeConfig.borderColor}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${currentTypeConfig.color}`}>
                                Your Position: #{userPosition.position} of {userPosition.total_users}
                            </p>
                            <p className="text-xs text-gray-600">
                                {userPosition.percentile && `Top ${(100 - userPosition.percentile).toFixed(1)}%`}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Stats Panel */}
            {showStats && stats && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.total_users?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-600">Total Users</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.active_users_today || '0'}</p>
                            <p className="text-xs text-gray-600">Active Today</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{stats.total_tasks_completed?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-600">Tasks Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.average_xp?.toFixed(0) || '0'}</p>
                            <p className="text-xs text-gray-600">Avg XP</p>
                        </div>
                    </div>

                    {/* Enhanced Recent Achievements */}
                    {recentAchievements.length > 0 && (
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3">Recent Achievements</h4>
                            <div className="space-y-2">
                                {recentAchievements.slice(0, 3).map((achievement, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <TrophyIcon className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">{achievement.username}</span> earned{' '}
                                                <span className="font-medium text-yellow-700">{achievement.badge_title}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(achievement.awarded_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Enhanced Filter Controls */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex flex-col space-y-4">
                    {/* Leaderboard Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Leaderboard Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(LEADERBOARD_TYPES).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleTypeChange(key)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            activeType === key
                                                ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                                                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Period Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Period
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(TIME_PERIODS).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePeriodChange(key)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        activePeriod === key
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800 font-medium">Failed to load leaderboard</p>
                    </div>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <button
                        onClick={fetchLeaderboard}
                        className="w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-lg transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Enhanced Leaderboard Display */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Rankings
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                        <span>{leaderboardData.length} user{leaderboardData.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {leaderboardData.length > 0 ? (
                    <ul className="space-y-3">
                        {leaderboardData.map((entry) => (
                            <li 
                                key={entry.user_id} 
                                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                    entry.is_current_user 
                                        ? `${currentTypeConfig.bgColor} ${currentTypeConfig.borderColor} border-2`
                                        : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg w-10 text-center">
                                        {renderPodiumEmoji(entry.rank)}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <Link 
                                            to={`/profile/${entry.username}`} 
                                            className="font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                                        >
                                            {entry.username}
                                        </Link>
                                        {entry.is_current_user && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <span className={`font-bold ${currentTypeConfig.color}`}>
                                        {formatScore(entry)}
                                    </span>
                                    {entry.additional_data && Object.keys(entry.additional_data).length > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formatAdditionalData(entry.additional_data, activeType)?.map(({ key, displayValue }) => (
                                                <div key={key}>
                                                    {displayValue}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <CurrentIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
                        <p className="text-gray-600">
                            Be the first to appear on this leaderboard!
                        </p>
                    </div>
                )}

                {/* Enhanced Load More Button */}
                {leaderboardData.length >= 50 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                toast.info('Pagination feature coming soon!', {
                                    icon: '🚀',
                                    duration: 3000
                                });
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Enhanced Loading Overlay */}
            {loading && leaderboardData.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="text-gray-700">Updating leaderboard...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}