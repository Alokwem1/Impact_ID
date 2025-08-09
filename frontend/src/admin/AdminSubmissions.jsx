import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    FlagIcon, 
    EyeIcon,
    ClockIcon,
    UserIcon,
    DocumentTextIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

// ✅ CRITICAL FIX: Enhanced data-fetching function with correct API prefix
const fetchSubmissions = async ({ status, userId, taskId, daysBack, limit, offset }) => {
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (userId) params.append('user_id', userId);
    if (taskId) params.append('task_id', taskId);
    if (daysBack) params.append('days_back', daysBack);
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    
    // ✅ FIXED: Add /api prefix
    const { data } = await apiClient.get(`/api/admin/submissions?${params}`);
    return data;
};

// ✅ CRITICAL FIX: Individual submission review function with correct API prefix
const reviewSubmission = async ({ submissionId, reviewData }) => {
    // ✅ FIXED: Add /api prefix
    const { data } = await apiClient.post(`/api/tasks/review/${submissionId}`, reviewData);
    return data;
};

// ✅ CRITICAL FIX: Bulk review function with correct API prefix
const bulkReviewSubmissions = async ({ submissionIds, approve, notes }) => {
    // ✅ FIXED: Add /api prefix
    const { data } = await apiClient.post('/api/admin/submissions/bulk-review', {
        submission_ids: submissionIds,
        approve,
        notes
    });
    return data;
};

// ✅ CRITICAL FIX: Flag submission function with correct API prefix
const flagSubmission = async ({ submissionId, reason, category }) => {
    // ✅ FIXED: Add /api prefix
    const { data } = await apiClient.post(`/api/admin/submissions/${submissionId}/flag`, {
        reason,
        category
    });
    return data;
};

// ✅ NEW: Export submissions function
const exportSubmissions = async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    
    // ✅ FIXED: Add /api prefix
    const response = await apiClient.get(`/api/admin/submissions/export?${params}`, {
        responseType: 'blob'
    });
    
    return response.data;
};

export default function AdminSubmissions() {
    const queryClient = useQueryClient();

    // Filter and pagination state
    const [filters, setFilters] = useState({
        status: 'pending',
        userId: '',
        taskId: '',
        daysBack: 7,
        limit: 20,
        offset: 0
    });

    // UI state
    const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
    const [previewSubmission, setPreviewSubmission] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [reviewData, setReviewData] = useState({
        approve: true,
        feedback: '',
        score: null,
        bonus_xp: 0,
        bonus_essence: 0
    });
    const [flagData, setFlagData] = useState({
        reason: '',
        category: 'inappropriate'
    });

    // Fetch submissions with filters
    const { 
        data: submissions = [], 
        isLoading, 
        isError, 
        refetch 
    } = useQuery({
        queryKey: ['adminSubmissions', filters],
        queryFn: () => fetchSubmissions(filters),
        refetchInterval: 30000, // Auto-refresh every 30 seconds
    });

    // Individual review mutation
    const reviewMutation = useMutation({
        mutationFn: reviewSubmission,
        onSuccess: () => {
            toast.success('Submission reviewed successfully!');
            queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
            setIsReviewModalOpen(false);
            setSelectedSubmission(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || 'Failed to review submission.');
        },
    });

    // Bulk review mutation
    const bulkReviewMutation = useMutation({
        mutationFn: bulkReviewSubmissions,
        onSuccess: (data) => {
            toast.success(data.message || 'Bulk review completed!');
            queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
            setIsBulkModalOpen(false);
            setSelectedSubmissions(new Set());
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || 'Failed to bulk review submissions.');
        },
    });

    // Flag submission mutation
    const flagMutation = useMutation({
        mutationFn: flagSubmission,
        onSuccess: () => {
            toast.success('Submission flagged successfully!');
            queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
            setIsFlagModalOpen(false);
            setSelectedSubmission(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || 'Failed to flag submission.');
        },
    });

    // Export mutation
    const exportMutation = useMutation({
        mutationFn: () => exportSubmissions(filters),
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `submissions-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Submissions exported successfully!');
        },
        onError: (err) => {
            toast.error('Failed to export submissions');
        },
    });

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            offset: 0 // Reset pagination when filters change
        }));
    };

    // Handle individual submission selection
    const handleSubmissionSelect = (submissionId) => {
        setSelectedSubmissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(submissionId)) {
                newSet.delete(submissionId);
            } else {
                newSet.add(submissionId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedSubmissions.size === submissions.length) {
            setSelectedSubmissions(new Set());
        } else {
            setSelectedSubmissions(new Set(submissions.map(s => s.id)));
        }
    };

    // Open review modal
    const openReviewModal = (submission, approve = true) => {
        setSelectedSubmission(submission);
        setReviewData({
            approve,
            feedback: '',
            score: null,
            bonus_xp: 0,
            bonus_essence: 0
        });
        setIsReviewModalOpen(true);
    };

    // Open flag modal
    const openFlagModal = (submission) => {
        setSelectedSubmission(submission);
        setFlagData({
            reason: '',
            category: 'inappropriate'
        });
        setIsFlagModalOpen(true);
    };

    // Submit review
    const submitReview = () => {
        if (!selectedSubmission) return;
        
        reviewMutation.mutate({
            submissionId: selectedSubmission.id,
            reviewData
        });
    };

    // Submit bulk review
    const submitBulkReview = (approve) => {
        if (selectedSubmissions.size === 0) return;
        
        bulkReviewMutation.mutate({
            submissionIds: Array.from(selectedSubmissions),
            approve,
            notes: reviewData.feedback || ''
        });
    };

    // Submit flag
    const submitFlag = () => {
        if (!selectedSubmission) return;
        
        flagMutation.mutate({
            submissionId: selectedSubmission.id,
            ...flagData
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            rejected: 'bg-red-100 text-red-800',
            flagged: 'bg-orange-100 text-orange-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // ✅ FIXED: Add useEffect for keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Only when no modal is open
            if (isReviewModalOpen || isBulkModalOpen || isFlagModalOpen || previewSubmission) return;
            
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                refetch();
            }
            if (e.key === 'a' && e.ctrlKey && selectedSubmissions.size > 0) {
                e.preventDefault();
                setIsBulkModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isReviewModalOpen, isBulkModalOpen, isFlagModalOpen, previewSubmission, selectedSubmissions.size, refetch]);

    // Quick filters configuration
    const quickFilters = [
        { 
            label: 'Pending', 
            status: 'pending', 
            count: submissions.filter(s => s.status === 'pending').length 
        },
        { 
            label: 'Today', 
            daysBack: 1, 
            count: null 
        },
        { 
            label: 'This Week', 
            daysBack: 7, 
            count: null 
        },
        { 
            label: 'Flagged', 
            status: 'flagged', 
            count: submissions.filter(s => s.status === 'flagged').length 
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Loading submissions...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Submissions</h3>
                <p className="mt-1 text-sm text-gray-500">Unable to load submission data.</p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Submission Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Review and manage user submissions
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                    <button
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isPending}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        {exportMutation.isPending ? 'Exporting...' : 'Export'}
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Refresh
                    </button>
                    {selectedSubmissions.size > 0 && (
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Bulk Review ({selectedSubmissions.size})
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center mb-3">
                    <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                            <option value="rejected">Rejected</option>
                            <option value="flagged">Flagged</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">User ID</label>
                        <input
                            type="number"
                            placeholder="User ID"
                            value={filters.userId}
                            onChange={(e) => handleFilterChange('userId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Task ID</label>
                        <input
                            type="number"
                            placeholder="Task ID"
                            value={filters.taskId}
                            onChange={(e) => handleFilterChange('taskId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Days Back</label>
                        <select
                            value={filters.daysBack}
                            onChange={(e) => handleFilterChange('daysBack', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={1}>Last 24 hours</option>
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>
                </div>

                {/* ✅ NEW: Quick filter buttons */}
                <div className="flex items-center space-x-2 mt-3">
                    <span className="text-xs font-medium text-gray-500">Quick Filters:</span>
                    {quickFilters.map((filter) => (
                        <button
                            key={filter.label}
                            onClick={() => {
                                if (filter.status) handleFilterChange('status', filter.status);
                                if (filter.daysBack) handleFilterChange('daysBack', filter.daysBack);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                            {filter.label}
                            {filter.count !== null && filter.count > 0 && (
                                <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs">
                                    {filter.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                            Submissions ({submissions.length})
                        </h3>
                        {submissions.length > 0 && (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedSubmissions.size === submissions.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">Select All</label>
                            </div>
                        )}
                    </div>
                </div>

                {submissions.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {submissions.map((submission) => (
                            <div key={submission.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubmissions.has(submission.id)}
                                            onChange={() => handleSubmissionSelect(submission.id)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <UserIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {submission.username}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    ({submission.user_email})
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                                    {submission.status}
                                                </span>
                                            </div>
                                            
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                                {submission.task_title}
                                            </h4>
                                            
                                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {submission.response?.length > 200 
                                                        ? `${submission.response.substring(0, 200)}...` 
                                                        : submission.response
                                                    }
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                                </div>
                                                {submission.reviewed_at && (
                                                    <div className="flex items-center">
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                        Reviewed: {new Date(submission.reviewed_at).toLocaleString()}
                                                    </div>
                                                )}
                                                {submission.time_spent_minutes && (
                                                    <div>
                                                        Time spent: {submission.time_spent_minutes}m
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {submission.feedback && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Feedback:</strong> {submission.feedback}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-2">
                                        {/* ✅ NEW: Preview button for all submissions */}
                                        <button
                                            onClick={() => setPreviewSubmission(submission)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <EyeIcon className="h-3 w-3 mr-1" />
                                            Preview
                                        </button>
                                        
                                        {submission.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => openReviewModal(submission, true)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openReviewModal(submission, false)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                                >
                                                    <XCircleIcon className="h-3 w-3 mr-1" />
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => openFlagModal(submission)}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <FlagIcon className="h-3 w-3 mr-1" />
                                                    Flag
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No submissions match your current filters.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {submissions.length >= filters.limit && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => handleFilterChange('offset', Math.max(0, filters.offset - filters.limit))}
                        disabled={filters.offset === 0}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Showing {filters.offset + 1}-{filters.offset + submissions.length}
                    </span>
                    <button
                        onClick={() => handleFilterChange('offset', filters.offset + filters.limit)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* ✅ NEW: Submission Preview Modal */}
            {previewSubmission && (
                <SubmissionPreviewModal
                    submission={previewSubmission}
                    onClose={() => setPreviewSubmission(null)}
                    onReview={(approve) => {
                        setPreviewSubmission(null);
                        openReviewModal(previewSubmission, approve);
                    }}
                />
            )}

            {/* Review Modal */}
            {isReviewModalOpen && (
                <ReviewModal
                    submission={selectedSubmission}
                    reviewData={reviewData}
                    setReviewData={setReviewData}
                    onSubmit={submitReview}
                    onClose={() => setIsReviewModalOpen(false)}
                    isLoading={reviewMutation.isPending}
                />
            )}

            {/* Bulk Review Modal */}
            {isBulkModalOpen && (
                <BulkReviewModal
                    selectedCount={selectedSubmissions.size}
                    onApprove={() => submitBulkReview(true)}
                    onDecline={() => submitBulkReview(false)}
                    onClose={() => setIsBulkModalOpen(false)}
                    isLoading={bulkReviewMutation.isPending}
                />
            )}

            {/* Flag Modal */}
            {isFlagModalOpen && (
                <FlagModal
                    submission={selectedSubmission}
                    flagData={flagData}
                    setFlagData={setFlagData}
                    onSubmit={submitFlag}
                    onClose={() => setIsFlagModalOpen(false)}
                    isLoading={flagMutation.isPending}
                />
            )}
        </div>
    );
}

// ✅ NEW: Enhanced Submission Preview Modal Component
function SubmissionPreviewModal({ submission, onClose, onReview }) {
    if (!submission) return null;
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        Submission Preview
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                {/* Enhanced submission details */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">User</label>
                            <p className="text-lg">{submission.username}</p>
                            <p className="text-sm text-gray-500">{submission.user_email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Task</label>
                            <p className="text-lg">{submission.task_title}</p>
                            <p className="text-sm text-gray-500">Task ID: {submission.task_id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {submission.status}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Submitted</label>
                            <p className="text-sm">{new Date(submission.submitted_at).toLocaleString()}</p>
                        </div>
                        {submission.time_spent_minutes && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Time Spent</label>
                                <p className="text-sm">{submission.time_spent_minutes} minutes</p>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-gray-500">Response</label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                            <p className="whitespace-pre-wrap">{submission.response}</p>
                        </div>
                    </div>
                    
                    {submission.attachments?.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Attachments</label>
                            <div className="mt-2 space-y-2">
                                {submission.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm">{attachment}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {submission.feedback && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Admin Feedback</label>
                            <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                                <p className="text-blue-800">{submission.feedback}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    {submission.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onReview(false)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => onReview(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                            >
                                Approve
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Review Modal Component
function ReviewModal({ submission, reviewData, setReviewData, onSubmit, onClose, isLoading }) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {reviewData.approve ? 'Approve' : 'Decline'} Submission
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback (optional)
                        </label>
                        <textarea
                            value={reviewData.feedback}
                            onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Provide feedback to the user..."
                        />
                    </div>
                    
                    {reviewData.approve && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Score (0-100, optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={reviewData.score || ''}
                                    onChange={(e) => setReviewData(prev => ({ ...prev, score: e.target.value ? parseFloat(e.target.value) : null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bonus XP
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="500"
                                        value={reviewData.bonus_xp}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, bonus_xp: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bonus Essence
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={reviewData.bonus_essence}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, bonus_essence: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isLoading}
                        className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                            reviewData.approve ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        } disabled:opacity-50`}
                    >
                        {isLoading ? 'Processing...' : (reviewData.approve ? 'Approve' : 'Decline')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Bulk Review Modal Component
function BulkReviewModal({ selectedCount, onApprove, onDecline, onClose, isLoading }) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Bulk Review {selectedCount} Submissions
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                    This action will affect {selectedCount} selected submissions. This cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDecline}
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Decline All'}
                    </button>
                    <button
                        onClick={onApprove}
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Approve All'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Flag Modal Component
function FlagModal({ submission, flagData, setFlagData, onSubmit, onClose, isLoading }) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Flag Submission
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={flagData.category}
                            onChange={(e) => setFlagData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="inappropriate">Inappropriate Content</option>
                            <option value="spam">Spam</option>
                            <option value="abuse">Abuse</option>
                            <option value="plagiarism">Plagiarism</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason *
                        </label>
                        <textarea
                            value={flagData.reason}
                            onChange={(e) => setFlagData(prev => ({ ...prev, reason: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Explain why this submission is being flagged..."
                            required
                        />
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isLoading || !flagData.reason.trim()}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Flagging...' : 'Flag Submission'}
                    </button>
                </div>
            </div>
        </div>
    );
}