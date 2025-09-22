import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';
import { 
    UsersIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    TrophyIcon,
    FireIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    EyeIcon,
    TrashIcon,
    ClockIcon,
    DocumentArrowDownIcon,
    Bars3Icon,
    ChevronUpDownIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

// ================================
// 📊 CORRECTED API FUNCTIONS
// ================================

// ✅ FIXED: Corrected API endpoint to match your #backend admin router
const fetchUsers = async ({ status, search, sort_by, order, min_xp, include_inactive, limit, offset }) => {
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (sort_by) params.append('sort_by', sort_by);
    if (order) params.append('order', order);
    if (min_xp !== null && min_xp !== undefined) params.append('min_xp', min_xp);
    if (include_inactive) params.append('include_inactive', 'true');
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    
    try {
        const { data } = await apiClient.get(`/api/admin/users?${params}`);
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
};

// ✅ FIXED: Corrected API endpoints to match your #backend admin router
const updateUserStatus = async ({ userId, status, reason }) => {
    const { data } = await apiClient.put(`/api/admin/users/${userId}/status`, {
        status,
        reason
    });
    return data;
};

const updateUserRole = async ({ userId, role }) => {
    const { data } = await apiClient.patch(`/api/admin/users/${userId}/role`, {
        role
    });
    return data;
};

// ✅ ENHANCED: More sophisticated user deletion with confirmation
const deleteUser = async ({ userId }) => {
    const { data } = await apiClient.delete(`/api/admin/users/${userId}`);
    return data;
};

// ✅ NEW: Fetch user statistics
const fetchUserStats = async () => {
    try {
        const { data } = await apiClient.get('/api/admin/analytics/overview');
        return {
            total_users: data.total_users || 0,
            active_users: data.active_users_this_week || 0,
            new_users_today: data.new_users_today || 0,
            avg_xp: Math.round(data.platform_stats?.avg_user_xp || 0)
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            total_users: 0,
            active_users: 0,
            new_users_today: 0,
            avg_xp: 0
        };
    }
};

// ✅ NEW: Fetch user activity timeline
const fetchUserActivity = async (userId) => {
    try {
        const { data } = await apiClient.get(`/api/activities/`, {
            params: { 
                user_id: userId, 
                limit: 20,
                filter_type: 'all'
            }
        });
        return data;
    } catch (error) {
        console.error('Error fetching user activity:', error);
        return [];
    }
};

// ✅ NEW: Export users data
const exportUsers = async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    
    const response = await apiClient.get(`/api/admin/reports/user-progress?${params}`, {
        responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// ✅ NEW: Bulk operations
const bulkUpdateStatus = async ({ userIds, status, reason }) => {
    const { data } = await apiClient.post('/api/admin/users/bulk-status', {
        user_ids: userIds,
        status,
        reason
    });
    return data;
};

// ================================
// 🎨 ENHANCED COMPONENTS
// ================================

// User Statistics Cards Component
const UserStatsCards = ({ stats, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-300 rounded mr-3"></div>
                            <div className="flex-1">
                                <div className="h-6 bg-gray-300 rounded w-16 mb-1"></div>
                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) return null;
    
    const statCards = [
        {
            icon: UsersIcon,
            value: stats.total_users?.toLocaleString() || '0',
            label: 'Total Users',
            color: 'text-blue-600'
        },
        {
            icon: CheckCircleIcon,
            value: stats.active_users?.toLocaleString() || '0',
            label: 'Active Users',
            color: 'text-green-600'
        },
        {
            icon: CalendarIcon,
            value: stats.new_users_today?.toLocaleString() || '0',
            label: 'New Today',
            color: 'text-purple-600'
        },
        {
            icon: TrophyIcon,
            value: stats.avg_xp?.toLocaleString() || '0',
            label: 'Avg XP',
            color: 'text-yellow-600'
        }
    ];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <Icon className={`h-8 w-8 ${stat.color} mr-3`} />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Bulk Actions Component
const BulkActions = ({ selectedCount, onBulkAction, onClearSelection }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Bars3Icon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                    {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onBulkAction('active')}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                    Activate
                </button>
                <button
                    onClick={() => onBulkAction('suspended')}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                >
                    Suspend
                </button>
                <button
                    onClick={() => onBulkAction('banned')}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                    Ban
                </button>
                <button
                    onClick={onClearSelection}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                    Clear
                </button>
            </div>
        </div>
    </div>
);

// Sortable Header Component
const SortableHeader = ({ field, currentSort, onSort, children }) => (
    <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => onSort(field)}
    >
        <div className="flex items-center space-x-1">
            <span>{children}</span>
            {currentSort.field === field && (
                <span className="text-blue-600">
                    {currentSort.direction === 'desc' ? (
                        <ChevronDownIcon className="h-3 w-3" />
                    ) : (
                        <ChevronUpIcon className="h-3 w-3" />
                    )}
                </span>
            )}
            {currentSort.field !== field && (
                <ChevronUpDownIcon className="h-3 w-3 text-gray-400" />
            )}
        </div>
    </th>
);

// User Activity Modal Component
const UserActivityModal = ({ user, activity, isLoading, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-6 border max-w-4xl shadow-lg rounded-md bg-white m-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                    Activity Timeline - {user?.username}
                </h3>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading activity...</span>
                    </div>
                ) : (() => {
                    if (activity && activity.length > 0) {
                        return (
                            <div className="space-y-3">
                                {activity.map((item) => (
                                    <div key={`${item.id || item.created_at}-${item.action}`} className="flex items-start space-x-3 p-3 border-l-2 border-blue-200 bg-gray-50 rounded-r-lg">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <ClockIcon className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.detail || item.action.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(item.created_at).toLocaleString()}
                                            </p>
                                            {item.meta_data?.xp_gained && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                                    +{item.meta_data.xp_gained} XP
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    
                    return (
                        <div className="text-center py-8 text-gray-500">
                            <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No recent activity found</p>
                        </div>
                    );
                })()}
            </div>
        </div>
    </div>
);

// ================================
// 🏠 MAIN COMPONENT
// ================================

export default function AdminUserList() {
    const queryClient = useQueryClient();

    // Enhanced filter state
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        min_xp: null,
        include_inactive: false,
        limit: 25,
        offset: 0
    });

    // Enhanced sorting state
    const [sortConfig, setSortConfig] = useState({
        field: 'created_at',
        direction: 'desc'
    });

    // UI state
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [actionData, setActionData] = useState({
        status: 'active',
        role: 'user',
        reason: ''
    });

    // Activity modal state
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedUserActivity, setSelectedUserActivity] = useState(null);

    // ✅ ENHANCED: Fetch users with improved error handling
    const { 
        data: users = [], 
        isLoading, 
        isError, 
        error,
        refetch 
    } = useQuery({
        queryKey: queryKeys.admin.usersList(filters, sortConfig),
        queryFn: () => fetchUsers({ 
            ...filters, 
            sort_by: sortConfig.field, 
            order: sortConfig.direction 
        }),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        onError: (error) => {
            console.error('Users fetch error:', error);
            toast.error('Failed to load users');
        }
    });

    // ✅ ENHANCED: Fetch user statistics
    const { 
        data: userStats, 
        isLoading: statsLoading 
    } = useQuery({
        queryKey: queryKeys.admin.userStats(),
        queryFn: fetchUserStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    // ✅ ENHANCED: Fetch user activity
    const { 
        data: userActivity, 
        isLoading: activityLoading 
    } = useQuery({
        queryKey: selectedUserActivity?.id ? queryKeys.activities.userId(selectedUserActivity.id) : ['activities','user-id',undefined],
        queryFn: () => fetchUserActivity(selectedUserActivity.id),
        enabled: !!selectedUserActivity,
        staleTime: 1 * 60 * 1000 // 1 minute
    });

    // ✅ ENHANCED: Status update mutation
    const statusMutation = useMutation({
        mutationFn: updateUserStatus,
        onSuccess: (data, variables) => {
            toast.success(`User status updated to ${variables.status}`);
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.userStats() });
            setIsModalOpen(false);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update user status');
        },
    });

    // ✅ ENHANCED: Role update mutation
    const roleMutation = useMutation({
        mutationFn: updateUserRole,
        onSuccess: (data, variables) => {
            toast.success(`User role updated to ${variables.role}`);
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            setIsModalOpen(false);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update user role');
        },
    });

    // ✅ ENHANCED: Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.userStats() });
            setIsModalOpen(false);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete user');
        },
    });

    // ✅ NEW: Export mutation
    const exportMutation = useMutation({
        mutationFn: exportUsers,
        onSuccess: () => {
            toast.success('User data exported successfully!');
        },
        onError: (err) => {
            toast.error('Failed to export user data');
        }
    });

    // ✅ NEW: Bulk status update mutation
    const bulkStatusMutation = useMutation({
        mutationFn: bulkUpdateStatus,
        onSuccess: (data, variables) => {
            toast.success(`${variables.userIds.length} users updated to ${variables.status}`);
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            setSelectedUsers(new Set());
        },
        onError: (err) => {
            toast.error('Failed to update users');
        },
    });

    // Enhanced filter change handler
    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            offset: 0 // Reset pagination
        }));
    }, []);

    // Enhanced sorting handler
    const handleSort = useCallback((field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    }, []);

    // User selection handlers
    const handleSelectAll = useCallback(() => {
        if (selectedUsers.size === users.length && users.length > 0) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(u => u.id)));
        }
    }, [users, selectedUsers.size]);

    const handleUserSelect = useCallback((userId) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    }, []);

    // Modal handlers
    const openModal = useCallback((type, user) => {
        setSelectedUser(user);
        setModalType(type);
        setActionData({
            status: user?.status || 'active',
            role: user?.role || 'user',
            reason: ''
        });
        setIsModalOpen(true);
    }, []);

    // Action handlers
    const handleAction = useCallback(() => {
        if (!selectedUser) return;

        switch (modalType) {
            case 'status':
                statusMutation.mutate({
                    userId: selectedUser.id,
                    status: actionData.status,
                    reason: actionData.reason
                });
                break;
            case 'role':
                roleMutation.mutate({
                    userId: selectedUser.id,
                    role: actionData.role
                });
                break;
            case 'delete':
                deleteMutation.mutate({
                    userId: selectedUser.id
                });
                break;
        }
    }, [selectedUser, modalType, actionData, statusMutation, roleMutation, deleteMutation]);

    // Bulk action handler
    const handleBulkAction = useCallback((status) => {
        if (selectedUsers.size === 0) return;

        const reason = `Bulk ${status} action by admin`;
        bulkStatusMutation.mutate({
            userIds: Array.from(selectedUsers),
            status,
            reason
        });
    }, [selectedUsers, bulkStatusMutation]);

    // Utility functions
    const getStatusColor = useCallback((status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            banned: 'bg-red-100 text-red-800',
            inactive: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }, []);

    const getRoleColor = useCallback((role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            moderator: 'bg-blue-100 text-blue-800',
            user: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }, []);

    // Pagination helper
    const handlePagination = useCallback((direction) => {
        if (direction === 'prev') {
            handleFilterChange('offset', Math.max(0, filters.offset - filters.limit));
        } else {
            handleFilterChange('offset', filters.offset + filters.limit);
        }
    }, [filters, handleFilterChange]);

    // Loading state
    if (isLoading && users.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Users</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {error?.message || 'Unable to load user data.'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <UserStatsCards stats={userStats} isLoading={statsLoading} />

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center">
                            <UsersIcon className="h-6 w-6 text-gray-400 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                                <p className="text-sm text-gray-500">
                                    Manage platform users and their permissions
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <button
                                onClick={() => exportMutation.mutate(filters)}
                                disabled={exportMutation.isPending}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                                {exportMutation.isPending ? 'Exporting...' : 'Export'}
                            </button>
                            <button
                                onClick={() => refetch()}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-1" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center mb-3">
                        <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Filters</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="search-input" className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <input
                                    id="search-input"
                                    type="text"
                                    placeholder="Username or email..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <select
                                id="status-filter"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="banned">Banned</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="min-xp" className="block text-xs font-medium text-gray-700 mb-1">Min XP</label>
                            <input
                                id="min-xp"
                                type="number"
                                placeholder="0"
                                value={filters.min_xp || ''}
                                onChange={(e) => handleFilterChange('min_xp', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="includeInactive"
                                checked={filters.include_inactive}
                                onChange={(e) => handleFilterChange('include_inactive', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="includeInactive" className="ml-2 text-sm text-gray-700">
                                Include inactive
                            </label>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.size > 0 && (
                    <BulkActions
                        selectedCount={selectedUsers.size}
                        onBulkAction={handleBulkAction}
                        onClearSelection={() => setSelectedUsers(new Set())}
                    />
                )}

                {/* User List */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.size === users.length && users.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </th>
                                <SortableHeader field="username" currentSort={sortConfig} onSort={handleSort}>
                                    User
                                </SortableHeader>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status & Role
                                </th>
                                <SortableHeader field="xp" currentSort={sortConfig} onSort={handleSort}>
                                    Progress
                                </SortableHeader>
                                <SortableHeader field="created_at" currentSort={sortConfig} onSort={handleSort}>
                                    Activity
                                </SortableHeader>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => handleUserSelect(user.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                    {user.is_verified && (
                                                        <div className="flex items-center mt-1">
                                                            <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                                                            <span className="text-xs text-green-600">Verified</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm">
                                                    <TrophyIcon className="h-4 w-4 text-yellow-500 mr-1" />
                                                    <span className="text-gray-900">{user.xp?.toLocaleString() || '0'} XP</span>
                                                    <span className="ml-2 text-gray-500">Lvl {user.level || 1}</span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                                                    <span className="text-gray-900">{user.streak || 0} day streak</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.task_count || 0} tasks • {user.badge_count || 0} badges
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-900">
                                                    Joined: {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                                {user.last_active && (
                                                    <div className="text-sm text-gray-500">
                                                        Last active: {new Date(user.last_active).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {user.essence_balance > 0 && (
                                                    <div className="text-sm text-purple-600">
                                                        {user.essence_balance} essence
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => openModal('view', user)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUserActivity(user);
                                                        setShowActivityModal(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    title="View Activity"
                                                >
                                                    <ClockIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal('status', user)}
                                                    className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                                    title="Change Status"
                                                >
                                                    <ShieldExclamationIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal('role', user)}
                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                    title="Change Role"
                                                >
                                                    <ShieldCheckIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal('delete', user)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            No users match your current filters.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.length >= filters.limit && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => handlePagination('prev')}
                            disabled={filters.offset === 0}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Showing {filters.offset + 1}-{filters.offset + users.length}
                            {userStats?.total_users && ` of ${userStats.total_users.toLocaleString()}`}
                        </span>
                        <button
                            onClick={() => handlePagination('next')}
                            disabled={users.length < filters.limit}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Action Modal */}
                {isModalOpen && (
                    <ActionModal
                        type={modalType}
                        user={selectedUser}
                        actionData={actionData}
                        setActionData={setActionData}
                        onSubmit={handleAction}
                        onClose={() => setIsModalOpen(false)}
                        isLoading={statusMutation.isPending || roleMutation.isPending || deleteMutation.isPending}
                    />
                )}

                {/* Activity Modal */}
                {showActivityModal && (
                    <UserActivityModal
                        user={selectedUserActivity}
                        activity={userActivity}
                        isLoading={activityLoading}
                        onClose={() => {
                            setShowActivityModal(false);
                            setSelectedUserActivity(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ================================
// 🎨 ACTION MODAL COMPONENT
// ================================

function ActionModal({ type, user, actionData, setActionData, onSubmit, onClose, isLoading }) {
    const getModalConfig = () => {
        switch (type) {
            case 'status':
                return {
                    title: 'Change User Status',
                    description: `Update status for ${user?.username}`,
                    confirmText: 'Update Status',
                    confirmColor: 'bg-yellow-600 hover:bg-yellow-700'
                };
            case 'role':
                return {
                    title: 'Change User Role',
                    description: `Update role for ${user?.username}`,
                    confirmText: 'Update Role',
                    confirmColor: 'bg-blue-600 hover:bg-blue-700'
                };
            case 'delete':
                return {
                    title: 'Delete User',
                    description: `This will permanently delete ${user?.username} and all their data. This action cannot be undone.`,
                    confirmText: 'Delete User',
                    confirmColor: 'bg-red-600 hover:bg-red-700'
                };
            case 'view':
                return {
                    title: 'User Details',
                    description: `Detailed information for ${user?.username}`,
                    confirmText: 'Close',
                    confirmColor: 'bg-gray-600 hover:bg-gray-700'
                };
            default:
                return {
                    title: 'Action',
                    description: '',
                    confirmText: 'Confirm',
                    confirmColor: 'bg-blue-600 hover:bg-blue-700'
                };
        }
    };

    const config = getModalConfig();

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{config.description}</p>
                
                {type === 'view' && (
                    <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                            <div><strong>ID:</strong></div>
                            <div>{user?.id}</div>
                            <div><strong>Username:</strong></div>
                            <div>{user?.username}</div>
                            <div><strong>Email:</strong></div>
                            <div>{user?.email}</div>
                            <div><strong>Status:</strong></div>
                            <div>{user?.status}</div>
                            <div><strong>Role:</strong></div>
                            <div>{user?.role}</div>
                            <div><strong>XP:</strong></div>
                            <div>{user?.xp?.toLocaleString() || '0'}</div>
                            <div><strong>Level:</strong></div>
                            <div>{user?.level || 1}</div>
                            <div><strong>Streak:</strong></div>
                            <div>{user?.streak || 0} days</div>
                            <div><strong>Tasks:</strong></div>
                            <div>{user?.task_count || 0}</div>
                            <div><strong>Badges:</strong></div>
                            <div>{user?.badge_count || 0}</div>
                            <div><strong>Verified:</strong></div>
                            <div>{user?.is_verified ? 'Yes' : 'No'}</div>
                            <div><strong>Joined:</strong></div>
                            <div>{new Date(user?.created_at).toLocaleString()}</div>
                            {user?.wallet_address && (
                                <>
                                    <div><strong>Wallet:</strong></div>
                                    <div className="truncate">{user.wallet_address}</div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {type === 'status' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                            <select
                                id="status-select"
                                value={actionData.status}
                                onChange={(e) => setActionData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="banned">Banned</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reason-textarea" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                id="reason-textarea"
                                value={actionData.reason}
                                onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Reason for status change..."
                            />
                        </div>
                    </div>
                )}
                
                {type === 'role' && (
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                        <select
                            id="role-select"
                            value={actionData.role}
                            onChange={(e) => setActionData(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}

                {type === 'delete' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800">
                                <p className="font-medium mb-1">This action is irreversible!</p>
                                <p>All user data, submissions, and progress will be permanently deleted.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    {type !== 'view' && (
                        <button
                            onClick={onSubmit}
                            disabled={isLoading}
                            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${config.confirmColor} disabled:opacity-50 transition-colors`}
                        >
                            {isLoading ? 'Processing...' : config.confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// PropTypes for components
UserStatsCards.propTypes = {
    stats: PropTypes.object,
    isLoading: PropTypes.bool.isRequired
};

BulkActions.propTypes = {
    selectedCount: PropTypes.number.isRequired,
    onBulkAction: PropTypes.func.isRequired,
    onClearSelection: PropTypes.func.isRequired
};

SortableHeader.propTypes = {
    field: PropTypes.string.isRequired,
    currentSort: PropTypes.shape({
        field: PropTypes.string,
        direction: PropTypes.oneOf(['asc', 'desc'])
    }).isRequired,
    onSort: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};

UserActivityModal.propTypes = {
    user: PropTypes.object,
    activity: PropTypes.array,
    isLoading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

ActionModal.propTypes = {
    type: PropTypes.oneOf(['status', 'role', 'delete', 'view']).isRequired,
    user: PropTypes.object,
    actionData: PropTypes.shape({
        status: PropTypes.string,
        role: PropTypes.string,
        reason: PropTypes.string
    }).isRequired,
    setActionData: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
};