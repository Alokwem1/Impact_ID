import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SparklesIcon,
    ClockIcon,
    FireIcon,
    BoltIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ChartBarIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    XMarkIcon,
    CalendarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    EyeIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import {
    SparklesIcon as SparklesIconSolid,
    FireIcon as FireIconSolid,
    BoltIcon as BoltIconSolid,
    TrophyIcon as TrophyIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import Layout from '../tasks/Layout';
import LoomView from '../features/LoomView';
import WeavingView from '../features/WeavingView';
import toast from 'react-hot-toast';

// ================================
// 📊 ENHANCED API FUNCTIONS
// ================================

// Fetch weaving status with comprehensive error handling
const fetchWeavingStatus = async () => {
    try {
        const { data } = await apiClient.get('/api/weaving/status');
        return data;
    } catch (error) {
        console.error('Weaving status fetch error:', error);
        throw new Error('Failed to fetch weaving status');
    }
};

// Fetch available threads with enhanced filtering
const fetchAvailableThreads = async ({ category = null, limit = 5, quality_min = null } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (quality_min) params.append('quality_min', quality_min.toString());
    params.append('limit', limit.toString());
    
    try {
        const { data } = await apiClient.get(`/api/weaving/available-threads?${params.toString()}`);
        return data;
    } catch (error) {
        console.error('Available threads fetch error:', error);
        throw new Error('Failed to fetch available threads');
    }
};

// Enhanced thread claiming with retry logic
const claimThread = async (threadId) => {
    try {
        const { data } = await apiClient.post(`/api/weaving/claim/${threadId}`);
        return data;
    } catch (error) {
        console.error('Thread claim error:', error);
        throw error;
    }
};

// Enhanced weaving submission with validation
const submitWeaving = async (submissionData) => {
    const { thread_id, category, reasoning, action_plan, difficulty_rating } = submissionData;
    
    // Client-side validation
    if (!category || !reasoning) {
        throw new Error('Category and reasoning are required');
    }
    
    if (reasoning.length < 20) {
        throw new Error('Reasoning must be at least 20 characters long');
    }
    
    try {
        const { data } = await apiClient.post(`/api/weaving/submit/${thread_id}`, {
            category,
            reasoning,
            action_plan,
            difficulty_rating
        });
        return data;
    } catch (error) {
        console.error('Weaving submission error:', error);
        throw error;
    }
};

// Enhanced leaderboard with multiple periods
const fetchWeavingLeaderboard = async ({ period = 'weekly', limit = 10 } = {}) => {
    try {
        const { data } = await apiClient.get(`/api/weaving/leaderboard?period=${period}&limit=${limit}`);
        return data;
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return []; // Return empty array on error
    }
};

// Enhanced user profile fetching
const fetchUserProfile = async () => {
    try {
        const { data } = await apiClient.get('/api/users/me');
        return data;
    } catch (error) {
        console.error('User profile fetch error:', error);
        throw error;
    }
};

// Fetch weaving analytics
const fetchWeavingAnalytics = async () => {
    try {
        const { data } = await apiClient.get('/api/weaving/analytics');
        return data;
    } catch (error) {
        console.error('Weaving analytics fetch error:', error);
        return null;
    }
};

// ================================
// 🎨 ENHANCED CONFIGURATION
// ================================

const WEAVING_CATEGORIES = [
    { id: 'Environment', name: 'Environment', icon: GlobeAltIcon, color: 'green', emoji: '🌱' },
    { id: 'Social Good', name: 'Social Good', icon: UserGroupIcon, color: 'pink', emoji: '🤝' },
    { id: 'Technology', name: 'Technology', icon: BoltIcon, color: 'blue', emoji: '💻' },
    { id: 'Education', name: 'Education', icon: DocumentTextIcon, color: 'purple', emoji: '📚' },
    { id: 'Health', name: 'Health', icon: SparklesIcon, color: 'red', emoji: '❤️' },
    { id: 'Other', name: 'Other', icon: StarIcon, color: 'gray', emoji: '✨' }
];

const WEAVING_MODES = {
    quick: {
        label: 'Quick Mode',
        description: 'Fast categorization with standard rewards',
        minChars: 20,
        baseReward: { min: 3, max: 8 }
    },
    advanced: {
        label: 'Advanced Mode',
        description: 'Detailed analysis with bonus rewards',
        minChars: 50,
        baseReward: { min: 8, max: 15 }
    }
};

// ================================
// 🔄 ENHANCED ERROR BOUNDARY
// ================================

class WeavingErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Weaving component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <ExclamationTriangleIconSolid className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Weaving Error</h3>
                    <p className="text-red-700 mb-4">
                        Something went wrong with the weaving experience.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ================================
// 🏠 MAIN WEAVING LOOM COMPONENT
// ================================

export default function WeavingLoomPage() {
    const queryClient = useQueryClient();
    
    // Enhanced state management
    const [currentThread, setCurrentThread] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [qualityFilter, setQualityFilter] = useState(null);
    const [viewMode, setViewMode] = useState('loom'); // 'loom', 'weaving', 'leaderboard', 'stats', 'analytics'
    const [showAdvancedMode, setShowAdvancedMode] = useState(false);
    const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // 1. Enhanced weaving status fetching
    const { 
        data: status, 
        isLoading: statusLoading, 
        isError: statusError, 
        error: statusErrorMessage,
        refetch: refetchStatus 
    } = useQuery({
        queryKey: ['weavingStatus'],
        queryFn: fetchWeavingStatus,
        refetchInterval: autoRefresh ? 30000 : false,
        staleTime: 10000,
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        onError: (error) => {
            console.error('Status fetch failed:', error);
        }
    });

    // 2. Enhanced available threads fetching
    const { 
        data: availableThreads = [], 
        isLoading: threadsLoading,
        refetch: refetchThreads,
        isFetching: threadsFetching 
    } = useQuery({
        queryKey: ['availableThreads', selectedCategory, qualityFilter],
        queryFn: () => fetchAvailableThreads({ 
            category: selectedCategory, 
            limit: 10,
            quality_min: qualityFilter 
        }),
        enabled: status?.is_ready === true,
        staleTime: 2 * 60 * 1000,
        onError: (error) => {
            console.error('Threads fetch failed:', error);
        }
    });

    // 3. Enhanced user profile fetching
    const { data: userProfile, isLoading: profileLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    // 4. Enhanced leaderboard fetching
    const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
        queryKey: ['weavingLeaderboard', leaderboardPeriod],
        queryFn: () => fetchWeavingLeaderboard({ period: leaderboardPeriod, limit: 20 }),
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    // 5. Weaving analytics fetching
    const { data: analytics } = useQuery({
        queryKey: ['weavingAnalytics'],
        queryFn: fetchWeavingAnalytics,
        staleTime: 10 * 60 * 1000,
        enabled: viewMode === 'analytics'
    });

    // 6. Enhanced claim thread mutation
    const { mutate: handleClaim, isPending: isClaiming } = useMutation({
        mutationFn: claimThread,
        onSuccess: (data) => {
            setCurrentThread(data);
            setViewMode('weaving');
            toast.success('Thread claimed! Start weaving your impact.', {
                icon: '🧵',
                duration: 3000,
                style: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }
            });
            
            // Track claiming analytics
            if (window.gtag) {
                window.gtag('event', 'thread_claimed', {
                    event_category: 'weaving',
                    event_label: data.category || 'unknown'
                });
            }
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Failed to claim thread. Please try again.';
            toast.error(errorMessage, {
                icon: '❌',
                duration: 4000
            });
            
            // Handle specific error cases
            if (err.response?.status === 429) {
                refetchStatus();
                toast.info('Cooldown active. Please wait before claiming another thread.', {
                    icon: '⏳',
                    duration: 3000
                });
            } else if (err.response?.status === 404) {
                refetchThreads();
                toast.info('Thread no longer available. Refreshing available threads...', {
                    icon: '🔄',
                    duration: 3000
                });
            }
        },
        onSettled: () => {
            // Always refresh threads after claim attempt
            setTimeout(() => refetchThreads(), 1000);
        }
    });

    // 7. Enhanced submit weaving mutation
    const { mutate: handleSubmit, isPending: isSubmitting } = useMutation({
        mutationFn: submitWeaving,
        onSuccess: (data) => {
            // Enhanced success messaging
            const baseMessage = `🎉 Weaving Complete! +${data.essence_earned} Essence`;
            const xpMessage = data.xp_earned ? `, +${data.xp_earned} XP` : '';
            const streakMessage = data.streak > 1 ? ` (${data.streak} day streak!)` : '';
            
            toast.success(baseMessage + xpMessage + streakMessage, {
                duration: 6000,
                style: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }
            });

            // Show quality bonus notification
            if (data.quality_bonus) {
                setTimeout(() => {
                    toast.success('Quality Bonus Earned! Excellent categorization! 🌟', {
                        icon: '⭐',
                        duration: 4000,
                        style: {
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white'
                        }
                    });
                }, 1500);
            }

            // Show streak milestone notifications
            if (data.streak && [7, 30, 100].includes(data.streak)) {
                setTimeout(() => {
                    toast.success(`🔥 ${data.streak} Day Streak Milestone! You're on fire!`, {
                        icon: '🔥',
                        duration: 5000,
                        style: {
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white'
                        }
                    });
                }, 2500);
            }

            // Comprehensive data invalidation
            queryClient.invalidateQueries({ queryKey: ['weavingStatus'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['availableThreads'] });
            queryClient.invalidateQueries({ queryKey: ['weavingLeaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['weavingAnalytics'] });
            queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
            
            // Track completion analytics
            if (window.gtag) {
                window.gtag('event', 'weaving_completed', {
                    event_category: 'weaving',
                    event_label: data.category || 'unknown',
                    value: data.essence_earned
                });
            }
            
            // Reset to loom view with smooth transition
            setTimeout(() => {
                setCurrentThread(null);
                setViewMode('loom');
            }, 1000);
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to submit weaving. Please try again.';
            toast.error(errorMessage, {
                icon: '❌',
                duration: 5000
            });

            // Handle specific validation errors
            if (err.message.includes('characters long')) {
                toast.info('💡 Tip: Provide more detailed reasoning for better rewards!', {
                    duration: 4000
                });
            }
        }
    });

    // Enhanced auto-refresh logic with intelligent timing
    useEffect(() => {
        if (status && !status.is_ready && status.time_remaining_seconds > 0) {
            const timeRemaining = status.time_remaining_seconds;
            
            // Set timer to refresh status when cooldown should be finished
            const timer = setTimeout(() => {
                refetchStatus();
            }, (timeRemaining + 2) * 1000); // Add 2 seconds buffer
            
            return () => clearTimeout(timer);
        }
    }, [status, refetchStatus]);

    // Enhanced user stats computation
    const getUserWeavingStats = useCallback(() => {
        if (!status || !userProfile) return null;
        
        return {
            essence_balance: status.essence_balance || 0,
            daily_weaves_completed: status.daily_weaves_completed || 0,
            daily_weaves_limit: status.daily_weaves_limit || 10,
            streak: status.streak || 0,
            level: userProfile.level || 1,
            total_weaves: userProfile.total_weaves || 0,
            best_streak: userProfile.best_weaving_streak || 0,
            essence_earned_today: status.essence_earned_today || 0,
            next_level_xp: userProfile.next_level_xp || 1000,
            current_xp: userProfile.xp || 0
        };
    }, [status, userProfile]);

    // Enhanced error rendering with actionable solutions
    const renderError = useCallback(() => {
        if (!statusError) return null;
        
        const isNetworkError = statusErrorMessage?.message?.includes('Network Error') || 
                               statusErrorMessage?.code === 'NETWORK_ERROR';
        
        return (
            <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <ExclamationTriangleIconSolid className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                    {isNetworkError ? 'Connection Error' : 'Weaving Loom Error'}
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">
                    {isNetworkError 
                        ? 'Unable to connect to the Impact Weaving Loom. Please check your internet connection.'
                        : statusErrorMessage?.message || 'Could not load the weaving experience.'
                    }
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => refetchStatus()}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                        Try Again
                    </button>
                    {isNetworkError && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Reload Page
                        </button>
                    )}
                </div>
            </div>
        );
    }, [statusError, statusErrorMessage, refetchStatus]);

    // Enhanced loading state with progress indication
    const renderLoading = useCallback(() => (
        <div className="max-w-md mx-auto text-center py-12">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <SparklesIconSolid className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Connecting to the Loom
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
                Preparing your weaving experience...
            </p>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
        </div>
    ), []);

    // Enhanced content rendering with optimized switching
    const renderContent = useCallback(() => {
        if (statusLoading) return renderLoading();
        if (statusError) return renderError();

        const userStats = getUserWeavingStats();

        switch (viewMode) {
            case 'weaving':
                if (!currentThread) {
                    setViewMode('loom');
                    return null;
                }
                return (
                    <WeavingView 
                        thread={currentThread} 
                        onSubmit={handleSubmit} 
                        submitting={isSubmitting}
                        userStats={userStats}
                        showAdvanced={showAdvancedMode}
                        estimatedReward={WEAVING_MODES[showAdvancedMode ? 'advanced' : 'quick'].baseReward}
                        categories={WEAVING_CATEGORIES}
                        onBack={() => setViewMode('loom')}
                    />
                );
                
            case 'leaderboard':
                return renderLeaderboardView();
                
            case 'stats':
                return renderStatsView();

            case 'analytics':
                return renderAnalyticsView();
                
            default: // 'loom'
                return (
                    <LoomView 
                        status={status} 
                        onClaim={handleClaim} 
                        claiming={isClaiming}
                        availableThreads={availableThreads}
                        threadsLoading={threadsLoading || threadsFetching}
                        userStats={userStats}
                        leaderboard={leaderboard.slice(0, 5)} // Show top 5 in preview
                        onCategoryFilter={setSelectedCategory}
                        selectedCategory={selectedCategory}
                        onQualityFilter={setQualityFilter}
                        qualityFilter={qualityFilter}
                        onRefreshThreads={refetchThreads}
                        categories={WEAVING_CATEGORIES}
                        autoRefresh={autoRefresh}
                        onAutoRefreshToggle={setAutoRefresh}
                    />
                );
        }
    }, [
        statusLoading, statusError, viewMode, currentThread, showAdvancedMode,
        handleSubmit, isSubmitting, getUserWeavingStats, handleClaim, isClaiming,
        availableThreads, threadsLoading, threadsFetching, leaderboard,
        selectedCategory, qualityFilter, refetchThreads, autoRefresh,
        renderLoading, renderError
    ]);

    // Enhanced leaderboard view with period selection
    const renderLeaderboardView = useCallback(() => (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <TrophyIconSolid className="h-8 w-8 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Weaving Leaderboard
                        </h2>
                    </div>
                    <button
                        onClick={() => setViewMode('loom')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    >
                        ← Back to Loom
                    </button>
                </div>

                {/* Period Selection */}
                <div className="flex space-x-2 mb-6">
                    {['daily', 'weekly', 'monthly', 'all_time'].map(period => (
                        <button
                            key={period}
                            onClick={() => setLeaderboardPeriod(period)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                leaderboardPeriod === period
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>
                
                {/* Leaderboard List */}
                <div className="space-y-3">
                    {leaderboardLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : leaderboard.length > 0 ? (
                        leaderboard.map((entry, index) => (
                            <div key={entry.username} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 
                                    'bg-gradient-to-br from-blue-500 to-blue-700'
                                }`}>
                                    {index === 0 ? '👑' : index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {entry.username}
                                        {index < 3 && (
                                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                Top {index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {entry.weave_count} weaves • {entry.total_essence} essence earned
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        #{entry.rank || index + 1}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No leaderboard data available for this period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ), [leaderboard, leaderboardLoading, leaderboardPeriod]);

    // Enhanced stats view with comprehensive metrics
    const renderStatsView = useCallback(() => {
        const userStats = getUserWeavingStats();
        
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <ChartBarIcon className="h-8 w-8 text-blue-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Your Weaving Journey
                            </h2>
                        </div>
                        <button
                            onClick={() => setViewMode('loom')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        >
                            ← Back to Loom
                        </button>
                    </div>
                    
                    {userStats ? (
                        <div className="space-y-6">
                            {/* Primary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 text-center border border-purple-200 dark:border-purple-700">
                                    <SparklesIconSolid className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                                        {userStats.essence_balance.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-purple-600 dark:text-purple-300">Total Essence</div>
                                    {userStats.essence_earned_today > 0 && (
                                        <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                                            +{userStats.essence_earned_today} today
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 text-center border border-blue-200 dark:border-blue-700">
                                    <BoltIconSolid className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {userStats.total_weaves.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-blue-600 dark:text-blue-300">Total Weaves</div>
                                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                        {userStats.daily_weaves_completed}/{userStats.daily_weaves_limit} today
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 text-center border border-red-200 dark:border-red-700">
                                    <FireIconSolid className="h-10 w-10 text-red-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                                        {userStats.streak}
                                    </div>
                                    <div className="text-sm text-red-600 dark:text-red-300">Current Streak</div>
                                    <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        Best: {userStats.best_streak} days
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bars */}
                            <div className="space-y-4">
                                {/* Daily Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Daily Weaving Progress
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {userStats.daily_weaves_completed}/{userStats.daily_weaves_limit}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${Math.min((userStats.daily_weaves_completed / userStats.daily_weaves_limit) * 100, 100)}%` 
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Level Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Level {userStats.level} Progress
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {userStats.current_xp}/{userStats.next_level_xp} XP
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${Math.min((userStats.current_xp / userStats.next_level_xp) * 100, 100)}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Achievements Preview */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Recent Achievements
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { milestone: 10, achieved: userStats.total_weaves >= 10, label: 'First 10 Weaves' },
                                        { milestone: 50, achieved: userStats.total_weaves >= 50, label: '50 Weaves' },
                                        { milestone: 7, achieved: userStats.streak >= 7, label: '7-Day Streak' },
                                        { milestone: 1000, achieved: userStats.essence_balance >= 1000, label: '1K Essence' }
                                    ].map((achievement, index) => (
                                        <div key={index} className={`p-3 rounded-lg text-center border ${
                                            achievement.achieved 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                        }`}>
                                            <div className={`text-2xl mb-1 ${
                                                achievement.achieved ? 'text-green-600' : 'text-gray-400'
                                            }`}>
                                                {achievement.achieved ? '✅' : '⏳'}
                                            </div>
                                            <div className={`text-xs font-medium ${
                                                achievement.achieved 
                                                    ? 'text-green-700 dark:text-green-300' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {achievement.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Loading your weaving statistics...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [getUserWeavingStats]);

    // New analytics view
    const renderAnalyticsView = useCallback(() => (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-8 w-8 text-indigo-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Weaving Analytics
                        </h2>
                    </div>
                    <button
                        onClick={() => setViewMode('loom')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        ← Back to Loom
                    </button>
                </div>
                
                {analytics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Platform-wide stats would go here */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-4">Platform Impact</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-2xl font-bold text-indigo-600">{analytics.total_threads_woven || 0}</div>
                                    <div className="text-sm text-indigo-500">Total Threads Woven</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-indigo-600">{analytics.active_weavers || 0}</div>
                                    <div className="text-sm text-indigo-500">Active Weavers</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
                    </div>
                )}
            </div>
        </div>
    ), [analytics]);

    // Enhanced tab navigation with better accessibility
    const navigationTabs = useMemo(() => [
        { key: 'loom', label: 'Weaving Loom', icon: GlobeAltIcon, description: 'Claim and weave threads' },
        { key: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon, description: 'Top weavers rankings' },
        { key: 'stats', label: 'My Stats', icon: ChartBarIcon, description: 'Your weaving progress' },
        { key: 'analytics', label: 'Analytics', icon: DocumentTextIcon, description: 'Platform insights' }
    ], []);

    // Breadcrumb items for navigation
    const breadcrumbItems = useMemo(() => [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Weaving Loom', href: '/weaving' }
    ], []);

    return (
        <WeavingErrorBoundary>
            <Layout showBreadcrumbs={true} breadcrumbItems={breadcrumbItems}>
                <div className="space-y-6">
                    {/* Enhanced Header with Better Visual Hierarchy */}
                    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2 flex items-center">
                                    <SparklesIconSolid className="h-8 w-8 mr-3 text-yellow-300" />
                                    Impact Weaving Loom
                                </h1>
                                <p className="text-purple-100 text-lg">
                                    Transform raw impact threads into meaningful categorizations and earn essence
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <SparklesIconSolid className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                                    <div className="text-sm text-purple-100">Earn Essence</div>
                                    <div className="text-xs text-purple-200 mt-1">
                                        {status?.essence_balance || 0} current
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Navigation Tabs */}
                        <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
                            {navigationTabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = viewMode === tab.key;
                                const isDisabled = viewMode === 'weaving' && tab.key !== 'weaving';
                                
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => !isDisabled && setViewMode(tab.key)}
                                        disabled={isDisabled}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-white text-purple-600 shadow-sm'
                                                : isDisabled
                                                ? 'text-purple-300 cursor-not-allowed opacity-50'
                                                : 'text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                                        }`}
                                        title={isDisabled ? 'Finish weaving to access' : tab.description}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Mode Toggle with Better UX */}
                    {viewMode === 'loom' && status?.is_ready && (
                        <div className="flex justify-center">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Weaving Mode:
                                    </span>
                                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        {Object.entries(WEAVING_MODES).map(([mode, config]) => (
                                            <button
                                                key={mode}
                                                onClick={() => setShowAdvancedMode(mode === 'advanced')}
                                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                                    (showAdvancedMode && mode === 'advanced') || (!showAdvancedMode && mode === 'quick')
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                            >
                                                {config.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                                            {WEAVING_MODES[showAdvancedMode ? 'advanced' : 'quick'].description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content with Enhanced Error Boundaries */}
                    <div className="min-h-[500px]">
                        {renderContent()}
                    </div>
                </div>
            </Layout>
        </WeavingErrorBoundary>
    );
}