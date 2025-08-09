import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    UserIcon,
    CalendarIcon,
    TrophyIcon,
    StarIcon,
    FireIcon,
    SparklesIcon,
    MapPinIcon,
    GlobeAltIcon,
    ChartBarIcon,
    UserGroupIcon,
    ArrowLeftIcon,
    ShareIcon,
    EyeIcon,
    CheckBadgeIcon,
    BoltIcon,
    LinkIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophyIconSolid,
    StarIcon as StarIconSolid,
    FireIcon as FireIconSolid,
    SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import BadgeItem from './BadgeItem';

// ================================
// 📊 CORRECTED API FUNCTIONS
// ================================

// ✅ FIXED: Corrected API endpoint to match your #backend users router
const fetchPublicProfile = async (username) => {
    try {
        const { data } = await apiClient.get(`/api/users/${encodeURIComponent(username)}`);
        return data;
    } catch (error) {
        console.error('Error fetching public profile:', error);
        throw new Error(error.response?.data?.detail || 'Profile not found');
    }
};

// ✅ FIXED: Corrected API endpoint to match your #backend activities router
const fetchUserActivities = async (username) => {
    try {
        // First get user ID from username since activities endpoint expects user_id
        const { data: profileData } = await apiClient.get(`/api/users/${encodeURIComponent(username)}`);
        
        if (!profileData.id) {
            throw new Error('User ID not found');
        }

        // Then fetch activities using user_id
        const { data } = await apiClient.get('/api/activities/', {
            params: { 
                user_id: profileData.id,
                limit: 10,
                filter_type: 'all',
                hours_back: 168 // Last week
            }
        });
        return data;
    } catch (error) {
        console.error('Error fetching user activities:', error);
        // Don't throw error for activities as it's not critical
        return [];
    }
};

// ✅ FIXED: Fetch user's public badges properly
const fetchUserBadges = async (username) => {
    try {
        // Get badges from profile data since they're included
        const { data } = await apiClient.get(`/api/users/${encodeURIComponent(username)}`);
        return data.badges || [];
    } catch (error) {
        console.error('Error fetching user badges:', error);
        return [];
    }
};

// Enhanced share profile function
const shareProfile = async (profileData) => {
    const shareData = {
        title: `${profileData.username}'s Impact ID Profile`,
        text: `Check out ${profileData.username}'s profile on Impact ID - Level ${profileData.level} with ${profileData.xp.toLocaleString()} XP!`,
        url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
    } else {
        await navigator.clipboard.writeText(window.location.href);
        throw new Error('Link copied to clipboard');
    }
};

// ================================
// 🧮 UTILITY FUNCTIONS
// ================================

const calculateLevel = (xp) => {
    // Match your backend level calculation logic
    return Math.floor(xp / 1000) + 1;
};

const getXpForNextLevel = (currentXp) => {
    const currentLevel = calculateLevel(currentXp);
    return currentLevel * 1000;
};

const getXpProgress = (currentXp) => {
    const currentLevel = calculateLevel(currentXp);
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpForNextLevel = currentLevel * 1000;
    const progress = ((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
};

// ================================
// 🎨 ENHANCED COMPONENTS
// ================================

// Enhanced Loading Skeleton
const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-6 mb-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
                <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-16 bg-gray-300 rounded"></div>
        </div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="h-8 w-8 bg-gray-300 rounded mx-auto mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-12 mx-auto"></div>
                </div>
            ))}
        </div>
    </div>
);

// Enhanced Error State
const ErrorState = ({ error, onRetry, onGoBack }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>Try Again</span>
                    </button>
                )}
                <button
                    onClick={onGoBack}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Go Back
                </button>
                <Link
                    to="/dashboard"
                    className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Dashboard
                </Link>
            </div>
        </div>
    </div>
);

// Enhanced Activity Item Component
const ActivityItem = ({ activity }) => {
    const getActivityIcon = (action) => {
        switch (action) {
            case 'task_completed':
                return <TrophyIconSolid className="h-4 w-4 text-blue-600" />;
            case 'badge_earned':
                return <StarIconSolid className="h-4 w-4 text-yellow-600" />;
            case 'streak_milestone':
                return <FireIconSolid className="h-4 w-4 text-red-600" />;
            case 'level_up':
                return <SparklesIconSolid className="h-4 w-4 text-purple-600" />;
            case 'thread_woven':
                return <UserGroupIcon className="h-4 w-4 text-indigo-600" />;
            case 'user_joined':
                return <UserIcon className="h-4 w-4 text-green-600" />;
            default:
                return <EyeIcon className="h-4 w-4 text-blue-600" />;
        }
    };

    const getActivityColor = (action) => {
        switch (action) {
            case 'task_completed':
                return 'bg-blue-100';
            case 'badge_earned':
                return 'bg-yellow-100';
            case 'streak_milestone':
                return 'bg-red-100';
            case 'level_up':
                return 'bg-purple-100';
            case 'thread_woven':
                return 'bg-indigo-100';
            case 'user_joined':
                return 'bg-green-100';
            default:
                return 'bg-gray-100';
        }
    };

    return (
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-8 h-8 ${getActivityColor(activity.action)} rounded-full flex items-center justify-center flex-shrink-0`}>
                {getActivityIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                    {activity.detail || activity.action.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                    <ClockIcon className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.created_at)}
                    </p>
                    {activity.meta_data?.xp_gained && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            +{activity.meta_data.xp_gained} XP
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Badge Display Component
const BadgeDisplay = ({ badges }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="text-center py-8">
                <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
                <p className="text-gray-600">This user hasn't earned any badges yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
                <div key={badge.badge_id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <StarIconSolid className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{badge.title}</h4>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Earned {formatDate(badge.awarded_at)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ================================
// 🏠 MAIN COMPONENT
// ================================

export default function PublicProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('badges');
    const [isSharing, setIsSharing] = useState(false);

    // ✅ ENHANCED: Profile fetching with React Query
    const { 
        data: profile, 
        isLoading: profileLoading, 
        isError: profileError, 
        error: profileErrorMessage,
        refetch: refetchProfile 
    } = useQuery({
        queryKey: ['publicProfile', username],
        queryFn: () => fetchPublicProfile(username),
        enabled: !!username,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        onError: (error) => {
            console.error('Profile fetch failed:', error);
        }
    });

    // ✅ ENHANCED: Activities fetching with React Query
    const { 
        data: activities = [], 
        isLoading: activitiesLoading 
    } = useQuery({
        queryKey: ['userActivities', username],
        queryFn: () => fetchUserActivities(username),
        enabled: !!username && !!profile && activeTab === 'activities',
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1
    });

    // ✅ ENHANCED: Share functionality with proper error handling
    const handleShare = async () => {
        if (isSharing || !profile) return;
        
        setIsSharing(true);
        try {
            await shareProfile(profile);
            toast.success('Profile shared successfully!', {
                icon: '🔗',
                duration: 3000
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                if (err.message === 'Link copied to clipboard') {
                    toast.success('Profile link copied to clipboard!', {
                        icon: '📋',
                        duration: 3000
                    });
                } else {
                    console.error('Share failed:', err);
                    toast.error('Failed to share profile');
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    // ✅ ENHANCED: Memoized calculations
    const profileStats = useMemo(() => {
        if (!profile) return null;

        const memberDays = Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24));
        const xpProgress = getXpProgress(profile.xp);
        const nextLevelXp = getXpForNextLevel(profile.xp);
        const badgeCount = profile.badges?.length || 0;

        return {
            memberDays,
            xpProgress,
            nextLevelXp,
            badgeCount
        };
    }, [profile]);

    // Validation
    if (!username) {
        return (
            <ErrorState 
                error="No username provided in URL"
                onGoBack={() => navigate(-1)}
            />
        );
    }

    // Loading state
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span>Back</span>
                        </button>
                    </div>
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    // Error state
    if (profileError) {
        return (
            <ErrorState 
                error={profileErrorMessage?.message || 'Profile not found'}
                onRetry={refetchProfile}
                onGoBack={() => navigate(-1)}
            />
        );
    }

    // No profile data
    if (!profile) {
        return (
            <ErrorState 
                error="Profile data not available"
                onRetry={refetchProfile}
                onGoBack={() => navigate(-1)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Enhanced Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                    
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <ShareIcon className="h-4 w-4" />
                        <span>{isSharing ? 'Sharing...' : 'Share Profile'}</span>
                    </button>
                </div>

                {/* Enhanced Profile Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                                <span className="text-2xl font-bold text-white">
                                    {profile.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <CheckBadgeIcon className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        {/* Enhanced Profile Info */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                        {profile.username}
                                    </h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                        <div className="flex items-center space-x-1">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>Joined {formatDate(profile.created_at)}</span>
                                        </div>
                                        {profile.location && (
                                            <div className="flex items-center space-x-1">
                                                <MapPinIcon className="h-4 w-4" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                    {profile.bio && (
                                        <p className="text-gray-700 mb-3 max-w-2xl">{profile.bio}</p>
                                    )}
                                </div>
                                
                                {/* Enhanced Level Badge */}
                                <div className="flex items-center space-x-2">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                        Level {profile.level}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Social Links */}
                            {(profile.website || (profile.social_links && Object.keys(profile.social_links).length > 0)) && (
                                <div className="flex items-center space-x-3 mt-3">
                                    {profile.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                        >
                                            <GlobeAltIcon className="h-4 w-4" />
                                            <span>Website</span>
                                        </a>
                                    )}
                                    {profile.social_links && Object.entries(profile.social_links).map(([platform, url]) => (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            <span className="capitalize">{platform}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced XP Progress */}
                    {profileStats && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Level {profile.level} Progress
                                </span>
                                <span className="text-sm text-gray-600">
                                    {profile.xp.toLocaleString()} / {profileStats.nextLevelXp.toLocaleString()} XP
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 ease-out relative"
                                    style={{ width: `${profileStats.xpProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                        <TrophyIconSolid className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{profile.xp.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total XP</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                        <StarIconSolid className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{profileStats?.badgeCount || 0}</p>
                        <p className="text-sm text-gray-600">Badges</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                        <FireIconSolid className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{profile.streak || 0}</p>
                        <p className="text-sm text-gray-600">Streak</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                        <SparklesIconSolid className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{profile.essence_balance || 0}</p>
                        <p className="text-sm text-gray-600">Essence</p>
                    </div>
                </div>

                {/* Enhanced Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <ChartBarIcon className="h-6 w-6 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Activity Stats</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tasks Completed:</span>
                                <span className="font-semibold">{profile.total_tasks_completed || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Threads Woven:</span>
                                <span className="font-semibold">{profile.total_threads_woven || profile.weaving_streak || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <BoltIcon className="h-6 w-6 text-yellow-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Member Since:</span>
                                <span className="font-semibold">
                                    {profileStats?.memberDays || 0} days
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Level:</span>
                                <span className="font-semibold">Level {profile.level}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                { id: 'badges', label: 'Badges', icon: StarIcon, count: profileStats?.badgeCount },
                                { id: 'activities', label: 'Recent Activity', icon: ChartBarIcon, count: activities.length }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                        {tab.count !== null && tab.count !== undefined && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'badges' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Badges ({profileStats?.badgeCount || 0})
                                    </h3>
                                    {profileStats?.badgeCount > 0 && (
                                        <span className="text-sm text-gray-500">
                                            Showing all earned badges
                                        </span>
                                    )}
                                </div>
                                <BadgeDisplay badges={profile.badges} />
                            </div>
                        )}

                        {activeTab === 'activities' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Recent Activity ({activities.length})
                                    </h3>
                                    {activitiesLoading && (
                                        <span className="text-sm text-gray-500">Loading...</span>
                                    )}
                                </div>
                                {activitiesLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="animate-pulse flex space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="rounded-full bg-gray-300 h-8 w-8"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activities.length > 0 ? (
                                    <div className="space-y-3">
                                        {activities.map((activity, index) => (
                                            <ActivityItem key={activity.id || index} activity={activity} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                                        <p className="text-gray-600">This user hasn't been active recently.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}