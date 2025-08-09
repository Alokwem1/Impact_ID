import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    ClockIcon,
    TrophyIcon,
    StarIcon,
    FireIcon,
    SparklesIcon,
    ChartBarIcon,
    UserGroupIcon,
    EyeIcon,
    HeartIcon,
    HandThumbUpIcon,
    FaceSmileIcon,
    BoltIcon,
    ArrowPathIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophyIconSolid,
    StarIcon as StarIconSolid,
    FireIcon as FireIconSolid,
    SparklesIcon as SparklesIconSolid,
    HeartIcon as HeartIconSolid,
    HandThumbUpIcon as HandThumbUpIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

// Activity type configurations
const ACTIVITY_TYPES = {
    task_completed: {
        icon: TrophyIcon,
        iconSolid: TrophyIconSolid,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Task Completed'
    },
    badge_earned: {
        icon: StarIcon,
        iconSolid: StarIconSolid,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Badge Earned'
    },
    streak_milestone: {
        icon: FireIcon,
        iconSolid: FireIconSolid,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Streak Milestone'
    },
    level_up: {
        icon: SparklesIcon,
        iconSolid: SparklesIconSolid,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Level Up'
    },
    thread_woven: {
        icon: UserGroupIcon,
        iconSolid: UserGroupIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        label: 'Thread Woven'
    }
};

// Reaction type configurations
const REACTION_TYPES = {
    like: { icon: HandThumbUpIcon, iconSolid: HandThumbUpIconSolid, color: 'text-blue-500' },
    love: { icon: HeartIcon, iconSolid: HeartIconSolid, color: 'text-red-500' },
    celebrate: { icon: SparklesIcon, iconSolid: SparklesIconSolid, color: 'text-yellow-500' },
    wow: { icon: FaceSmileIcon, iconSolid: FaceSmileIcon, color: 'text-green-500' },
    fire: { icon: FireIcon, iconSolid: FireIconSolid, color: 'text-orange-500' }
};

const HistoryItem = ({ activity, onReact, currentUserReaction, reactionCounts }) => {
    const activityConfig = ACTIVITY_TYPES[activity.action] || ACTIVITY_TYPES.task_completed;
    const Icon = activityConfig.icon;
    const IconSolid = activityConfig.iconSolid;

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const activityDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - activityDate) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return activityDate.toLocaleDateString();
    };

    const getTotalReactions = () => {
        return Object.values(reactionCounts || {}).reduce((sum, count) => sum + count, 0);
    };

    const handleReaction = (reactionType) => {
        if (onReact) {
            onReact(activity.id, reactionType);
        }
    };

    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${activityConfig.borderColor} hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className={`p-2 rounded-full ${activityConfig.bgColor} flex-shrink-0`}>
                    <IconSolid className={`h-5 w-5 ${activityConfig.color}`} />
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {activity.detail || activity.action.replace(/_/g, ' ')}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activityConfig.bgColor} ${activityConfig.color}`}>
                                    {activityConfig.label}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center space-x-1">
                                    <ClockIcon className="h-3 w-3" />
                                    <span>{formatTimeAgo(activity.created_at)}</span>
                                </span>
                            </div>

                            {/* Metadata */}
                            {activity.meta_data && Object.keys(activity.meta_data).length > 0 && (
                                <div className="mt-2 text-xs text-gray-600">
                                    {activity.meta_data.xp_gained && (
                                        <span className="inline-flex items-center space-x-1 mr-3">
                                            <BoltIcon className="h-3 w-3 text-yellow-500" />
                                            <span>+{activity.meta_data.xp_gained} XP</span>
                                        </span>
                                    )}
                                    {activity.meta_data.badge_name && (
                                        <span className="inline-flex items-center space-x-1">
                                            <StarIcon className="h-3 w-3 text-yellow-500" />
                                            <span>{activity.meta_data.badge_name}</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reaction Count */}
                        {getTotalReactions() > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <span>{getTotalReactions()}</span>
                                <HeartIcon className="h-3 w-3" />
                            </div>
                        )}
                    </div>

                    {/* Reactions */}
                    {onReact && (
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
                            {Object.entries(REACTION_TYPES).map(([type, config]) => {
                                const Icon = currentUserReaction === type ? config.iconSolid : config.icon;
                                const count = reactionCounts?.[type] || 0;
                                const isActive = currentUserReaction === type;
                                
                                return (
                                    <button
                                        key={type}
                                        onClick={() => handleReaction(type)}
                                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                            isActive
                                                ? `${config.color} bg-gray-100 font-medium`
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title={`${type.charAt(0).toUpperCase() + type.slice(1)} this activity`}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {count > 0 && <span>{count}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function UserHistoryWidget({ 
    showReactions = false, 
    limit = 5, 
    showHeader = true,
    className = "",
    onActivityClick 
}) {
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            // Use your activities API endpoint with user filtering
            const response = await apiClient.get('/api/activities/', {
                params: {
                    hours_back: 168, // Last week
                    limit: limit,
                    offset: 0
                }
            });
            setActivities(response.data);
            setError('');
        } catch (err) {
            console.error('Activities fetch error:', err);
            setError('Could not load recent activities.');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/activities/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Stats fetch error:', err);
        }
    }, []);

    const handleReaction = useCallback(async (activityId, reactionType) => {
        if (!showReactions) return;
        
        try {
            const response = await apiClient.post(`/api/activities/${activityId}/react`, {
                reaction_type: reactionType
            });
            
            // Update the activity in the local state
            setActivities(prev => prev.map(activity => {
                if (activity.id === activityId) {
                    const updatedActivity = { ...activity };
                    
                    // Update reaction counts
                    if (response.data.is_removed) {
                        // Reaction was removed
                        if (updatedActivity.reaction_counts?.[reactionType]) {
                            updatedActivity.reaction_counts[reactionType]--;
                        }
                        updatedActivity.user_reaction = null;
                    } else {
                        // Reaction was added or changed
                        if (!updatedActivity.reaction_counts) {
                            updatedActivity.reaction_counts = {};
                        }
                        
                        // Remove old reaction if changing
                        if (updatedActivity.user_reaction && updatedActivity.user_reaction !== reactionType) {
                            if (updatedActivity.reaction_counts[updatedActivity.user_reaction]) {
                                updatedActivity.reaction_counts[updatedActivity.user_reaction]--;
                            }
                        }
                        
                        // Add new reaction
                        updatedActivity.reaction_counts[reactionType] = (updatedActivity.reaction_counts[reactionType] || 0) + 1;
                        updatedActivity.user_reaction = reactionType;
                    }
                    
                    return updatedActivity;
                }
                return activity;
            }));
            
        } catch (err) {
            console.error('Reaction error:', err);
            toast.error('Failed to react to activity');
        }
    }, [showReactions]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchActivities(), fetchStats()]);
        setRefreshing(false);
        toast.success('Activities refreshed!');
    }, [fetchActivities, fetchStats]);

    useEffect(() => {
        fetchActivities();
        if (showReactions) {
            fetchStats();
        }
    }, [fetchActivities, fetchStats, showReactions]);

    const renderContent = () => {
        if (loading && activities.length === 0) {
            return (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse">
                            <div className="flex items-start space-x-3">
                                <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-center text-sm">{error}</p>
                    <button
                        onClick={fetchActivities}
                        className="mt-2 w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (activities.length === 0) {
            return (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">
                        Your recent activity will appear here.
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                        Complete tasks or earn badges to get started!
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {activities.map((activity) => (
                    <HistoryItem
                        key={activity.id}
                        activity={activity}
                        onReact={showReactions ? handleReaction : null}
                        currentUserReaction={activity.user_reaction}
                        reactionCounts={activity.reaction_counts}
                        onClick={onActivityClick}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={className}>
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-6 w-6 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {stats && (
                            <div className="text-xs text-gray-500">
                                {stats.recent_activity_count} this week
                            </div>
                        )}
                        
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh activities"
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <Link
                            to="/activities"
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View All
                        </Link>
                    </div>
                </div>
            )}

            {/* Weekly Activity Summary */}
            {stats && stats.most_active_date && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-900 font-medium">Most Active Day</span>
                        </div>
                        <div className="text-blue-700">
                            {new Date(stats.most_active_date).toLocaleDateString()} 
                            <span className="ml-1 font-semibold">({stats.most_active_count} activities)</span>
                        </div>
                    </div>
                </div>
            )}

            {renderContent()}

            {/* Loading overlay for refresh */}
            {refreshing && activities.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <p className="text-gray-700 text-sm">Refreshing activities...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}