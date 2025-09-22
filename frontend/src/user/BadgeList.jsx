import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    TrophyIcon,
    StarIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    ChartBarIcon,
    SparklesIcon,
    AcademicCapIcon,
    FireIcon,
    BoltIcon,
    GlobeAltIcon,
    CalendarIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ShareIcon,
    BookmarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    EyeIcon,
    DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophyIconSolid,
    StarIcon as StarIconSolid,
    SparklesIcon as SparklesIconSolid,
    BoltIcon as BoltIconSolid,
    FireIcon as FireIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import { queryKeys } from '../api/queryKeys';
import toast from 'react-hot-toast';
import BadgeItem from '../user/BadgeItem';

// ================================
// 🎯 ENHANCED CONFIGURATION
// ================================

// Badge categories from your #backend with enhanced metadata
const BADGE_CATEGORIES = {
    TASKS: {
        value: 'tasks',
        label: 'Task Mastery',
        icon: AcademicCapIcon,
        color: 'blue',
        description: 'Achievements for completing various tasks'
    },
    STREAKS: {
        value: 'streaks',
        label: 'Consistency',
        icon: FireIcon,
        color: 'red',
        description: 'Rewards for maintaining activity streaks'
    },
    XP: {
        value: 'xp',
        label: 'Experience',
        icon: BoltIcon,
        color: 'yellow',
        description: 'Level-based achievements and milestones'
    },
    SOCIAL: {
        value: 'social',
        label: 'Community',
        icon: UserGroupIcon,
        color: 'green',
        description: 'Social interaction and collaboration badges'
    },
    SPECIAL: {
        value: 'special',
        label: 'Special Events',
        icon: SparklesIcon,
        color: 'purple',
        description: 'Limited-time and unique achievements'
    },
    WEAVING: {
        value: 'weaving',
        label: 'Impact Weaving',
        icon: GlobeAltIcon,
        color: 'indigo',
        description: 'Thread weaving and categorization mastery'
    },
    SEASONAL: {
        value: 'seasonal',
        label: 'Seasonal',
        icon: CalendarIcon,
        color: 'pink',
        description: 'Time-limited seasonal achievements'
    }
};

// Badge rarities with enhanced visual design
const BADGE_RARITIES = {
    COMMON: {
        value: 'common',
        label: 'Common',
        color: 'gray',
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-500/25'
    },
    UNCOMMON: {
        value: 'uncommon',
        label: 'Uncommon',
        color: 'green',
        gradient: 'from-green-400 to-green-600',
        glow: 'shadow-green-500/25'
    },
    RARE: {
        value: 'rare',
        label: 'Rare',
        color: 'blue',
        gradient: 'from-blue-400 to-blue-600',
        glow: 'shadow-blue-500/25'
    },
    EPIC: {
        value: 'epic',
        label: 'Epic',
        color: 'purple',
        gradient: 'from-purple-400 to-purple-600',
        glow: 'shadow-purple-500/25'
    },
    LEGENDARY: {
        value: 'legendary',
        label: 'Legendary',
        color: 'yellow',
        gradient: 'from-yellow-400 to-orange-500',
        glow: 'shadow-yellow-500/25'
    }
};

// Sort options with enhanced metadata
const SORT_OPTIONS = {
    awarded_at: { label: 'Date Earned', icon: ClockIcon },
    title: { label: 'Name A-Z', icon: BookmarkIcon },
    rarity: { label: 'Rarity', icon: StarIcon },
    progress: { label: 'Progress', icon: ChartBarIcon }
};

// ================================
// 📊 ENHANCED API FUNCTIONS
// ================================

// Fetch user's badges with comprehensive filtering
const fetchUserBadges = async ({ category, sortBy, order, search }) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sortBy) params.append('sort_by', sortBy);
    if (order) params.append('order', order);
    if (search) params.append('search', search);
    
    try {
        const { data } = await apiClient.get(`/api/badges/my?${params.toString()}`);
        return data;
    } catch (error) {
        console.error('Error fetching user badges:', error);
        throw new Error('Failed to fetch your badges');
    }
};

// Fetch all badges with user progress
const fetchAllBadges = async ({ category, rarity, earnedOnly, availableOnly, search }) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (rarity) params.append('rarity', rarity);
    if (earnedOnly !== null) params.append('earned_only', earnedOnly);
    if (availableOnly !== null) params.append('available_only', availableOnly);
    if (search) params.append('search', search);
    
    try {
        const { data } = await apiClient.get(`/api/badges?${params.toString()}`);
        return data;
    } catch (error) {
        console.error('Error fetching badges:', error);
        throw new Error('Failed to fetch badges');
    }
};

// Fetch user badge statistics
const fetchBadgeStats = async () => {
    try {
        const { data } = await apiClient.get('/api/badges/my/stats');
        return data;
    } catch (error) {
        console.error('Error fetching badge stats:', error);
        throw new Error('Failed to fetch badge statistics');
    }
};

// Check and award new badges
const checkAndAwardBadges = async () => {
    try {
        const { data } = await apiClient.post('/api/badges/check-and-award');
        return data;
    } catch (error) {
        console.error('Error checking badges:', error);
        throw new Error('Failed to check for new badges');
    }
};

// Export badge collection
const exportBadgeCollection = async (format = 'pdf') => {
    try {
        const response = await apiClient.get(`/api/badges/my/export?format=${format}`, {
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `badge-collection.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return response;
    } catch (error) {
        console.error('Error exporting badges:', error);
        throw new Error('Failed to export badge collection');
    }
};

// Share badge collection
const shareBadgeCollection = async () => {
    try {
        const { data } = await apiClient.post('/api/badges/my/share');
        return data;
    } catch (error) {
        console.error('Error sharing badges:', error);
        throw new Error('Failed to share badge collection');
    }
};

// ================================
// 🏠 MAIN BADGE LIST COMPONENT
// ================================

export default function BadgeList() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // Enhanced state management
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showFilter, setShowFilter] = useState(false);
    const [activeTab, setActiveTab] = useState('earned'); // 'earned', 'available', 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: null,
        rarity: null,
        sortBy: 'awarded_at',
        order: 'desc'
    });
    const [favoriteFilters, setFavoriteFilters] = useState([]);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedBadges, setSelectedBadges] = useState(new Set());

    // Memoized query parameters
    const queryParams = useMemo(() => ({
        ...filters,
        search: searchTerm.trim()
    }), [filters, searchTerm]);

    // Enhanced badge statistics fetching
    const { 
        data: badgeStats, 
        isLoading: statsLoading,
        error: statsError,
        refetch: refetchStats 
    } = useQuery({
        queryKey: queryKeys.badges.stats(),
        queryFn: fetchBadgeStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        refetchInterval: autoRefresh ? 30000 : false,
        onError: (error) => {
            console.error('Badge stats fetch failed:', error);
        }
    });

    // Enhanced badges fetching based on active tab and filters
    const { 
        data: badges = [], 
        isLoading, 
        error, 
        refetch,
        isFetching 
    } = useQuery({
        queryKey: queryKeys.badges.filtered(activeTab, queryParams),
        queryFn: () => {
            switch (activeTab) {
                case 'earned':
                    return fetchUserBadges(queryParams);
                case 'available':
                    return fetchAllBadges({ ...queryParams, availableOnly: true });
                case 'all':
                    return fetchAllBadges(queryParams);
                default:
                    return fetchUserBadges(queryParams);
            }
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        refetchInterval: autoRefresh ? 60000 : false,
        onError: (error) => {
            console.error('Badges fetch failed:', error);
        }
    });

    // Enhanced check and award badges mutation
    const { mutate: checkBadges, isPending: isCheckingBadges } = useMutation({
        mutationFn: checkAndAwardBadges,
        onSuccess: (data) => {
            if (data.awarded && data.awarded.length > 0) {
                // Show individual toasts for each new badge
                data.awarded.forEach((badge, index) => {
                    setTimeout(() => {
                        toast.success(`🏆 New Badge Unlocked: ${badge.title}!`, {
                            duration: 6000,
                            icon: '🎉',
                            style: {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 'bold'
                            }
                        });
                    }, index * 1000);
                });
                
                // Show summary if multiple badges
                if (data.awarded.length > 1) {
                    setTimeout(() => {
                        toast.success(`🌟 Amazing! You earned ${data.awarded.length} new badges!`, {
                            duration: 8000,
                            icon: '🌟'
                        });
                    }, data.awarded.length * 1000 + 500);
                }
                
                // Comprehensive cache invalidation
                queryClient.invalidateQueries({ queryKey: queryKeys.badges.root() });
                queryClient.invalidateQueries({ queryKey: queryKeys.badges.all() });
                queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
                queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
                queryClient.invalidateQueries({ queryKey: queryKeys.achievements.recent() });
            } else {
                toast.success('Badge check complete - keep up the great work!', {
                    icon: '✨',
                    duration: 3000
                });
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to check for new badges';
            toast.error(errorMessage, {
                icon: '❌',
                duration: 4000
            });
        }
    });

    // Export badge collection mutation
    const { mutate: exportBadges, isPending: isExporting } = useMutation({
        mutationFn: exportBadgeCollection,
        onSuccess: () => {
            toast.success('Badge collection exported successfully!', {
                icon: '📄',
                duration: 4000
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to export badge collection', {
                icon: '❌'
            });
        }
    });

    // Share badge collection mutation
    const { mutate: shareBadges, isPending: isSharing } = useMutation({
        mutationFn: shareBadgeCollection,
        onSuccess: (data) => {
            if (navigator.share && data.shareUrl) {
                navigator.share({
                    title: 'My Impact ID Badge Collection',
                    text: 'Check out my achievements on Impact ID!',
                    url: data.shareUrl
                });
            } else if (data.shareUrl) {
                navigator.clipboard.writeText(data.shareUrl);
                toast.success('Share link copied to clipboard!', {
                    icon: '🔗'
                });
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to share badge collection', {
                icon: '❌'
            });
        }
    });

    // Auto-check for badges on mount and periodically
    useEffect(() => {
        checkBadges();
        
        if (autoRefresh) {
            const interval = setInterval(() => {
                checkBadges();
            }, 5 * 60 * 1000); // Check every 5 minutes
            
            return () => clearInterval(interval);
        }
    }, [checkBadges, autoRefresh]);

    // Enhanced filter management
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            category: null,
            rarity: null,
            sortBy: 'awarded_at',
            order: 'desc'
        });
        setSearchTerm('');
    }, []);

    const saveFilterPreset = useCallback(() => {
        const preset = {
            name: `Filter ${favoriteFilters.length + 1}`,
            filters: { ...filters, search: searchTerm },
            createdAt: new Date().toISOString()
        };
        setFavoriteFilters(prev => [...prev, preset]);
        toast.success('Filter preset saved!', { icon: '💾' });
    }, [filters, searchTerm, favoriteFilters.length]);

    const loadFilterPreset = useCallback((preset) => {
        setFilters(preset.filters);
        setSearchTerm(preset.filters.search || '');
        toast.success(`Loaded filter: ${preset.name}`, { icon: '📂' });
    }, []);

    // Enhanced badge selection
    const toggleBadgeSelection = useCallback((badgeId) => {
        setSelectedBadges(prev => {
            const newSet = new Set(prev);
            if (newSet.has(badgeId)) {
                newSet.delete(badgeId);
            } else {
                newSet.add(badgeId);
            }
            return newSet;
        });
    }, []);

    const selectAllBadges = useCallback(() => {
        setSelectedBadges(new Set(badges.map(badge => badge.id)));
    }, [badges]);

    const clearSelection = useCallback(() => {
        setSelectedBadges(new Set());
    }, []);

    // Get category configuration
    const getCategoryConfig = useCallback((category) => {
        return Object.values(BADGE_CATEGORIES).find(cat => cat.value === category) || BADGE_CATEGORIES.TASKS;
    }, []);

    // Get rarity configuration
    const getRarityConfig = useCallback((rarity) => {
        return Object.values(BADGE_RARITIES).find(r => r.value === rarity) || BADGE_RARITIES.COMMON;
    }, []);

    // Enhanced loading skeleton
    const LoadingSkeleton = useCallback(() => (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className={`grid gap-6 ${viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    ), [viewMode]);

    // Enhanced error display
    if (error) {
        return (
            <div className="max-w-md mx-auto text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Failed to Load Badges
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error.message || 'Something went wrong while loading your badges.'}
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => refetch()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                        Try Again
                    </button>
                    <button
                        onClick={clearFilters}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        );
    }

    // Enhanced loading state
    if (isLoading && !badges.length) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Stats */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2 flex items-center">
                            <TrophyIconSolid className="h-8 w-8 mr-3 text-yellow-300" />
                            Your Badge Collection
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Showcase your achievements and track your progress
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Auto-refresh toggle */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="auto-refresh"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="auto-refresh" className="text-sm text-blue-100">
                                Auto-refresh
                            </label>
                        </div>
                        
                        {/* Action buttons */}
                        <button
                            onClick={() => checkBadges()}
                            disabled={isCheckingBadges}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${isCheckingBadges ? 'animate-spin' : ''}`} />
                            <span>{isCheckingBadges ? 'Checking...' : 'Check New'}</span>
                        </button>
                        
                        <button
                            onClick={() => shareBadges()}
                            disabled={isSharing}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                        >
                            <ShareIcon className="h-4 w-4" />
                            <span>{isSharing ? 'Sharing...' : 'Share'}</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced Badge Statistics */}
                {badgeStats && !statsLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">{badgeStats.total_badges_earned}</div>
                            <div className="text-sm text-blue-100">Badges Earned</div>
                            <div className="text-xs text-blue-200 mt-1">
                                {badgeStats.total_badges_earned > 0 && 
                                    `Rank: Top ${Math.round((1 - badgeStats.user_percentile || 0) * 100)}%`
                                }
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">{Math.round(badgeStats.completion_percentage)}%</div>
                            <div className="text-sm text-blue-100">Collection Complete</div>
                            <div className="text-xs text-blue-200 mt-1">
                                {badgeStats.total_badges_available - badgeStats.total_badges_earned} remaining
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">{badgeStats.total_badges_available}</div>
                            <div className="text-sm text-blue-100">Total Available</div>
                            <div className="text-xs text-blue-200 mt-1">
                                Platform total
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">
                                {badgeStats.most_recent_badge ? '🆕' : '—'}
                            </div>
                            <div className="text-sm text-blue-100">Latest Badge</div>
                            <div className="text-xs text-blue-200 mt-1">
                                {badgeStats.most_recent_awarded_at 
                                    ? new Date(badgeStats.most_recent_awarded_at).toLocaleDateString()
                                    : 'None yet'
                                }
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state for stats */}
                {statsLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white bg-opacity-20 rounded-lg p-4 animate-pulse">
                                <div className="h-8 bg-white bg-opacity-30 rounded mb-2"></div>
                                <div className="h-4 bg-white bg-opacity-20 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced Controls and Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Enhanced Tabs */}
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        {[
                            { key: 'earned', label: 'My Badges', icon: TrophyIconSolid, count: badgeStats?.total_badges_earned },
                            { key: 'available', label: 'Available', icon: StarIcon, count: badgeStats ? badgeStats.total_badges_available - badgeStats.total_badges_earned : null },
                            { key: 'all', label: 'All Badges', icon: Squares2X2Icon, count: badgeStats?.total_badges_available }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === tab.key
                                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                    {tab.count !== null && tab.count !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            activeTab === tab.key
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search badges..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                showFilter
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                            <span>Filters</span>
                            {(filters.category || filters.rarity) && (
                                <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs">
                                    {[filters.category, filters.rarity].filter(Boolean).length}
                                </span>
                            )}
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-l-lg transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                                title="Grid View"
                            >
                                <Squares2X2Icon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-r-lg transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                                title="List View"
                            >
                                <ListBulletIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={() => exportBadges('pdf')}
                            disabled={isExporting}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            title="Export Badge Collection"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced Filters Panel */}
                {showFilter && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.category || ''}
                                    onChange={(e) => updateFilter('category', e.target.value || null)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">All Categories</option>
                                    {Object.values(BADGE_CATEGORIES).map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rarity Filter */}
                            {activeTab !== 'earned' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rarity
                                    </label>
                                    <select
                                        value={filters.rarity || ''}
                                        onChange={(e) => updateFilter('rarity', e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">All Rarities</option>
                                        {Object.values(BADGE_RARITIES).map(rarity => (
                                            <option key={rarity.value} value={rarity.value}>
                                                {rarity.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                    {Object.entries(SORT_OPTIONS).map(([value, config]) => (
                                        <option key={value} value={value}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Order
                                </label>
                                <select
                                    value={filters.order}
                                    onChange={(e) => updateFilter('order', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={saveFilterPreset}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    Save Filter
                                </button>
                                {favoriteFilters.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">|</span>
                                        {favoriteFilters.slice(0, 3).map((preset, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadFilterPreset(preset)}
                                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedBadges.size > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800 dark:text-blue-200">
                                {selectedBadges.size} badge{selectedBadges.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => shareBadges(Array.from(selectedBadges))}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    Share Selected
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Badge Grid/List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {/* Loading overlay */}
                {isFetching && badges.length > 0 && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-medium">Updating badges...</span>
                        </div>
                    </div>
                )}

                {badges.length > 0 ? (
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                            : 'space-y-4'
                    }>
                        {badges.map(badge => (
                            <div key={badge.id} className="relative">
                                {/* Selection checkbox */}
                                <div className="absolute top-2 right-2 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedBadges.has(badge.id)}
                                        onChange={() => toggleBadgeSelection(badge.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <BadgeItem 
                                    badge={badge} 
                                    viewMode={viewMode}
                                    showProgress={activeTab !== 'earned'}
                                    onClick={() => navigate(`/badges/${badge.id}`)}
                                    isSelected={selectedBadges.has(badge.id)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {searchTerm ? 'No badges found' : 
                             activeTab === 'earned' ? 'No badges earned yet' : 'No badges found'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchTerm ? 'Try adjusting your search terms or filters.' :
                             activeTab === 'earned' 
                                ? 'Complete tasks and activities to earn your first badges!'
                                : 'Try adjusting your filters to see more badges.'
                            }
                        </p>
                        <div className="space-y-3">
                            {activeTab === 'earned' && !searchTerm && (
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Browse Available Badges
                                </button>
                            )}
                            {(searchTerm || filters.category || filters.rarity) && (
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Badge Progress Summary */}
            {badgeStats && activeTab === 'earned' && !statsError && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Badge Collection Progress
                    </h3>
                    <div className="space-y-6">
                        {/* Overall Progress */}
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span>Collection Completion</span>
                                <span>{Math.round(badgeStats.completion_percentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out relative"
                                    style={{ width: `${badgeStats.completion_percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{badgeStats.total_badges_earned} earned</span>
                                <span>{badgeStats.total_badges_available - badgeStats.total_badges_earned} remaining</span>
                            </div>
                        </div>

                        {/* Rarity Breakdown */}
                        {badgeStats.rarity_breakdown && Object.keys(badgeStats.rarity_breakdown).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Badges by Rarity
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {Object.entries(badgeStats.rarity_breakdown).map(([rarity, count]) => {
                                        const rarityConfig = getRarityConfig(rarity);
                                        return (
                                            <div 
                                                key={rarity} 
                                                className={`text-center p-3 rounded-lg bg-${rarityConfig.color}-50 dark:bg-${rarityConfig.color}-900/20 border border-${rarityConfig.color}-200 dark:border-${rarityConfig.color}-800`}
                                            >
                                                <div className={`font-bold text-xl text-${rarityConfig.color}-600 dark:text-${rarityConfig.color}-400`}>
                                                    {count}
                                                </div>
                                                <div className={`text-xs capitalize text-${rarityConfig.color}-600 dark:text-${rarityConfig.color}-400`}>
                                                    {rarity}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Most Recent Badge */}
                        {badgeStats.most_recent_badge && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                            Most Recent Badge
                                        </h4>
                                        <p className="text-blue-800 dark:text-blue-200 font-semibold">
                                            {badgeStats.most_recent_badge}
                                        </p>
                                        {badgeStats.most_recent_awarded_at && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                Earned {new Date(badgeStats.most_recent_awarded_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <CheckCircleIconSolid className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        )}

                        {/* Next Milestone */}
                        {badgeStats.next_milestone && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                            Next Milestone
                                        </h4>
                                        <p className="text-yellow-800 dark:text-yellow-200">
                                            {badgeStats.next_milestone.description}
                                        </p>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                                                <span>Progress</span>
                                                <span>{badgeStats.next_milestone.progress}%</span>
                                            </div>
                                            <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                                                <div 
                                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${badgeStats.next_milestone.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}