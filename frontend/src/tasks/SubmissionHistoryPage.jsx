import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    StarIcon,
    BoltIcon,
    SparklesIcon,
    TrophyIcon,
    DocumentTextIcon,
    CalendarIcon,
    ArrowPathIcon,
    ChartBarIcon,
    AcademicCapIcon,
    TagIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleIconSolid,
    XCircleIcon as XCircleIconSolid,
    ExclamationCircleIcon as ExclamationCircleIconSolid,
    StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import Layout from '../tasks/Layout';

// Enhanced StatusBadge component with icons and better styling
const StatusBadge = ({ status, score, showScore = false }) => {
    const baseClasses = "inline-flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full";
    let specificClasses = "";
    let Icon = ClockIcon;

    switch (status) {
        case "approved":
            specificClasses = "bg-green-100 text-green-800";
            Icon = CheckCircleIconSolid;
            break;
        case "declined":
        case "rejected":
            specificClasses = "bg-red-100 text-red-800";
            Icon = XCircleIconSolid;
            break;
        case "flagged":
            specificClasses = "bg-orange-100 text-orange-800";
            Icon = ExclamationCircleIconSolid;
            break;
        default: // pending
            specificClasses = "bg-yellow-100 text-yellow-800";
            Icon = ClockIcon;
            break;
    }

    return (
        <span className={`${baseClasses} ${specificClasses}`}>
            <Icon className="h-3 w-3" />
            <span>{status.toUpperCase()}</span>
            {showScore && score && (
                <span className="ml-1 font-bold">({score}/100)</span>
            )}
        </span>
    );
};

// Define the data-fetching function with filters
const fetchSubmissions = async (filters) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const { data } = await apiClient.get(`/tasks/my-submissions?${params.toString()}`);
    return data;
};

export default function SubmissionHistoryPage() {
    const [filters, setFilters] = useState({
        status: '',
        limit: 20,
        offset: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Replace useState, useEffect, and useCallback with a single useQuery hook
    const { 
        data: submissions, 
        isLoading, 
        isError, 
        error, 
        refetch,
        isFetching 
    } = useQuery({
        queryKey: ['submissions', filters],
        queryFn: () => fetchSubmissions(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            offset: 0 // Reset pagination when filters change
        }));
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const clearFilters = useCallback(() => {
        setFilters({
            status: '',
            limit: 20,
            offset: 0
        });
        setSearchTerm('');
    }, []);

    // Filter submissions by search term locally
    const filteredSubmissions = submissions?.filter(submission => 
        !searchTerm || 
        submission.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.response.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Calculate statistics
    const getSubmissionStats = () => {
        if (!submissions) return { total: 0, approved: 0, pending: 0, declined: 0 };
        
        return submissions.reduce((stats, sub) => {
            stats.total++;
            stats[sub.status] = (stats[sub.status] || 0) + 1;
            return stats;
        }, { total: 0, approved: 0, pending: 0, declined: 0 });
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const submissionDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - submissionDate) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return submissionDate.toLocaleDateString();
    };

    const getRewardText = (submission) => {
        const rewards = [];
        if (submission.xp_awarded > 0) rewards.push(`${submission.xp_awarded} XP`);
        if (submission.essence_awarded > 0) rewards.push(`${submission.essence_awarded} Essence`);
        return rewards.length > 0 ? rewards.join(', ') : null;
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-16 bg-gray-300 rounded"></div>
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        if (isLoading && !submissions) {
            return <LoadingSkeleton />;
        }

        if (isError) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-center">
                        <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-800 mb-4">
                            {error?.message || 'Failed to fetch submission history.'}
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        if (!filteredSubmissions || filteredSubmissions.length === 0) {
            return (
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || filters.status 
                            ? 'No submissions match your criteria' 
                            : 'No submissions yet'
                        }
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || filters.status
                            ? 'Try adjusting your filters or search terms.'
                            : 'Start completing tasks to see your submission history here.'
                        }
                    </p>
                    {searchTerm || filters.status ? (
                        <button
                            onClick={clearFilters}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    ) : (
                        <Link
                            to="/tasks"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
                        >
                            Browse Tasks
                        </Link>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {submission.task_title}
                                        </h3>
                                        <Link
                                            to={`/tasks/${submission.task_id}`}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            title="View task details"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </Link>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                        <span className="flex items-center space-x-1">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>Submitted {formatTimeAgo(submission.submitted_at)}</span>
                                        </span>
                                        
                                        {submission.reviewed_at && (
                                            <span className="flex items-center space-x-1">
                                                <CheckCircleIcon className="h-4 w-4" />
                                                <span>Reviewed {formatTimeAgo(submission.reviewed_at)}</span>
                                            </span>
                                        )}
                                        
                                        {submission.attempt_number > 1 && (
                                            <span className="flex items-center space-x-1">
                                                <ArrowPathIcon className="h-4 w-4" />
                                                <span>Attempt #{submission.attempt_number}</span>
                                            </span>
                                        )}
                                        
                                        {submission.time_spent_minutes && (
                                            <span className="flex items-center space-x-1">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>{submission.time_spent_minutes}min</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <StatusBadge 
                                    status={submission.status} 
                                    score={submission.score}
                                    showScore={submission.score !== null}
                                />
                            </div>

                            {/* Rewards Display */}
                            {(submission.xp_awarded > 0 || submission.essence_awarded > 0) && (
                                <div className="flex items-center space-x-4 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-2 text-green-800">
                                        <TrophyIcon className="h-5 w-5" />
                                        <span className="font-medium">Rewards Earned:</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {submission.xp_awarded > 0 && (
                                            <div className="flex items-center space-x-1 text-yellow-700">
                                                <BoltIcon className="h-4 w-4" />
                                                <span className="font-medium">{submission.xp_awarded} XP</span>
                                            </div>
                                        )}
                                        {submission.essence_awarded > 0 && (
                                            <div className="flex items-center space-x-1 text-purple-700">
                                                <SparklesIcon className="h-4 w-4" />
                                                <span className="font-medium">{submission.essence_awarded} Essence</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Response */}
                            {submission.response && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                                        <span>Your Response:</span>
                                    </h4>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                                            {submission.response}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {submission.attachments && submission.attachments.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {submission.attachments.map((attachment, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                                {attachment}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {submission.feedback && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Feedback:</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            {submission.feedback}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Score */}
                        {submission.score !== null && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Score:</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                            <StarIconSolid className="h-4 w-4 text-yellow-500" />
                                            <span className="font-bold text-gray-900">{submission.score}/100</span>
                                        </div>
                                        {submission.score >= 90 && (
                                            <span className="text-xs text-green-600 font-medium">Excellent!</span>
                                        )}
                                        {submission.score >= 70 && submission.score < 90 && (
                                            <span className="text-xs text-blue-600 font-medium">Good work</span>
                                        )}
                                        {submission.score < 70 && (
                                            <span className="text-xs text-orange-600 font-medium">Needs improvement</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const stats = getSubmissionStats();

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                            <span>My Submissions</span>
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Track your task submissions and progress
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors ${
                                showFilters || filters.status
                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <FunnelIcon className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                        
                        <button
                            onClick={handleRefresh}
                            disabled={isFetching}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh submissions"
                        >
                            <ArrowPathIcon className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                {stats.total > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-2 text-gray-600 mb-1">
                                <ChartBarIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-2 text-green-600 mb-1">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Approved</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">{stats.approved || 0}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-2 text-yellow-600 mb-1">
                                <ClockIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Pending</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-700">{stats.pending || 0}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-2 text-red-600 mb-1">
                                <XCircleIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Declined</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{stats.declined || 0}</p>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search submissions by task title or response..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Filter Submissions</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="declined">Declined</option>
                                    <option value="flagged">Flagged</option>
                                </select>
                            </div>

                            {/* Limit Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Show
                                </label>
                                <select
                                    value={filters.limit}
                                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={10}>10 submissions</option>
                                    <option value={20}>20 submissions</option>
                                    <option value={50}>50 submissions</option>
                                    <option value={100}>100 submissions</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {(filters.status || searchTerm) && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        
                        {filters.status && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                <TagIcon className="h-3 w-3" />
                                <span>{filters.status}</span>
                                <button
                                    onClick={() => handleFilterChange('status', '')}
                                    className="ml-1 hover:text-blue-600"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        
                        {searchTerm && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                <MagnifyingGlassIcon className="h-3 w-3" />
                                <span>"{searchTerm}"</span>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="ml-1 hover:text-purple-600"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Content */}
                {renderContent()}

                {/* Loading overlay for filtering */}
                {isFetching && submissions && (
                    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="text-gray-700">Updating submissions...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}