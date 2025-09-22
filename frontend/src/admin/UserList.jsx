import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { 
    MagnifyingGlassIcon, 
    UserIcon, 
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    TrophyIcon,
    FireIcon,
    EyeIcon,
    CheckCircleIcon,
    FlagIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ApprovalConfirmationModal, InfoConfirmationModal } from './ConfirmationModal';

export default function AdminUserList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(''); // 'status', 'role', 'view', 'delete'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionData, setActionData] = useState({
        status: 'active',
        role: 'user',
        reason: ''
    });
    
    // Pagination
    const [limit] = useState(25);
    const [offset, setOffset] = useState(0);
    
    const queryClient = useQueryClient();

    // Enhanced fetch with your backend's exact parameters
    const { 
        data: usersData,
        isLoading, 
        isError, 
        error,
        refetch 
    } = useQuery({
        queryKey: queryKeys.admin.users({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchTerm || undefined,
            sort_by: sortBy,
            order: sortOrder,
            limit,
            offset
        }),
        queryFn: async () => {
            const params = new URLSearchParams();
            
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);
            params.append('sort_by', sortBy);
            params.append('order', sortOrder);
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());
            
            const response = await apiClient.get(`/admin/users?${params}`);
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const users = usersData || [];

    // User status update mutation (matches your backend)
    const updateUserStatusMutation = useMutation({
        mutationFn: async ({ userId, status, reason }) => {
            const response = await apiClient.put(`/admin/users/${userId}/status`, {
                status,
                reason
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success(`User status updated to ${variables.status}`);
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            setIsModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to update user status');
        },
    });

    // User role update mutation (matches your backend)
    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success(`User role updated to ${variables.role}`);
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            setIsModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to update user role');
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async ({ userId }) => {
            const response = await apiClient.delete(`/admin/users/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersBase() });
            setIsModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to delete user');
        },
    });

    // Action handlers
    const openModal = (type, user) => {
        setSelectedUser(user);
        setModalType(type);
        setActionData({
            status: user?.status || 'active',
            role: user?.role || 'user',
            reason: ''
        });
        setIsModalOpen(true);
    };

    const handleAction = () => {
        if (!selectedUser) return;

        switch (modalType) {
            case 'status':
                updateUserStatusMutation.mutate({
                    userId: selectedUser.id,
                    status: actionData.status,
                    reason: actionData.reason
                });
                break;
            case 'role':
                updateUserRoleMutation.mutate({
                    userId: selectedUser.id,
                    role: actionData.role
                });
                break;
            case 'delete':
                deleteUserMutation.mutate({
                    userId: selectedUser.id
                });
                break;
        }
    };

    // Status and role helper functions

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            banned: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
        return colors[status] || colors.active;
    };

    // Get role badge color
    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            user: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
        return colors[role] || colors.user;
    };

    // Enhanced loading state
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={`loading-skeleton-${i}`} className="grid grid-cols-6 gap-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Enhanced error state
    if (isError) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Failed to Load Users
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {error?.response?.data?.detail || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            User Management
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage platform users, roles, and permissions
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {users.length} user{users.length !== 1 ? 's' : ''} found
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Enhanced Search and Filter Controls */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setOffset(0); // Reset pagination on search
                            }}
                            aria-label="Search users by username or email"
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setOffset(0); // Reset pagination on filter
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Sort Options */}
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                            setOffset(0); // Reset pagination on sort
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="created_at-desc">Newest First</option>
                        <option value="created_at-asc">Oldest First</option>
                        <option value="username-asc">Username A-Z</option>
                        <option value="username-desc">Username Z-A</option>
                        <option value="xp-desc">Highest XP</option>
                        <option value="xp-asc">Lowest XP</option>
                        <option value="last_active-desc">Recently Active</option>
                    </select>
                </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                Status & Role
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                Progress
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                Activity
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {user.username}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                            <div className="flex items-center mt-1 space-x-2">
                                                {user.is_verified && (
                                                    <CheckCircleIcon className="h-3 w-3 text-green-500" title="Verified" />
                                                )}
                                                <span className="text-xs text-gray-500">ID: {user.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                        <br />
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm">
                                            <TrophyIcon className="h-4 w-4 text-yellow-500 mr-1" />
                                            <span className="text-gray-900 dark:text-gray-100">{user.xp} XP</span>
                                            <span className="ml-2 text-gray-500">Lvl {user.level}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                                            <span className="text-gray-900 dark:text-gray-100">{user.streak} day streak</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.task_count} tasks • {user.badge_count} badges
                                        </div>
                                        {user.essence_balance > 0 && (
                                            <div className="text-sm text-purple-600">
                                                {user.essence_balance} essence
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                            Joined: {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                        {user.last_active && (
                                            <div className="text-sm text-gray-500">
                                                Last active: {new Date(user.last_active).toLocaleDateString()}
                                            </div>
                                        )}
                                        {user.wallet_address && (
                                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                                Wallet connected
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => openModal('view', user)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            title="View Details"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openModal('status', user)}
                                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                            title="Change Status"
                                        >
                                            <FlagIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openModal('role', user)}
                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            title="Change Role"
                                        >
                                            <ShieldCheckIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State */}
                {users.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No users found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search criteria.'
                                : 'No users have registered yet.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {users.length >= limit && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <button
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                        disabled={offset === 0}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Showing {offset + 1}-{offset + users.length}
                    </span>
                    <button
                        onClick={() => setOffset(offset + limit)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Action Modals */}
            {isModalOpen && modalType === 'view' && (
                <InfoConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={() => setIsModalOpen(false)}
                    title="User Details"
                    confirmText="Close"
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>ID:</strong> {selectedUser?.id}</div>
                            <div><strong>Username:</strong> {selectedUser?.username}</div>
                            <div><strong>Email:</strong> {selectedUser?.email}</div>
                            <div><strong>Status:</strong> {selectedUser?.status}</div>
                            <div><strong>Role:</strong> {selectedUser?.role}</div>
                            <div><strong>XP:</strong> {selectedUser?.xp}</div>
                            <div><strong>Level:</strong> {selectedUser?.level}</div>
                            <div><strong>Streak:</strong> {selectedUser?.streak} days</div>
                            <div><strong>Tasks:</strong> {selectedUser?.task_count}</div>
                            <div><strong>Badges:</strong> {selectedUser?.badge_count}</div>
                            <div><strong>Essence:</strong> {selectedUser?.essence_balance}</div>
                            <div><strong>Verified:</strong> {selectedUser?.is_verified ? 'Yes' : 'No'}</div>
                            <div><strong>Joined:</strong> {new Date(selectedUser?.created_at).toLocaleString()}</div>
                            <div><strong>Last Active:</strong> {selectedUser?.last_active ? new Date(selectedUser.last_active).toLocaleString() : 'Never'}</div>
                        </div>
                        {selectedUser?.wallet_address && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm"><strong>Wallet Address:</strong></p>
                                <p className="text-xs font-mono break-all">{selectedUser.wallet_address}</p>
                            </div>
                        )}
                    </div>
                </InfoConfirmationModal>
            )}

            {isModalOpen && modalType === 'status' && (
                <ApprovalConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleAction}
                    isConfirming={updateUserStatusMutation.isPending}
                    title="Change User Status"
                    confirmText="Update Status"
                    variant="warning"
                >
                    <div className="space-y-4">
                        <p>Update status for <strong>{selectedUser?.username}</strong></p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-new-status">New Status</label>
                            <select
                                id="modal-new-status"
                                value={actionData.status}
                                onChange={(e) => setActionData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="banned">Banned</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-reason">Reason</label>
                            <textarea
                                id="modal-reason"
                                value={actionData.reason}
                                onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Reason for status change..."
                            />
                        </div>
                    </div>
                </ApprovalConfirmationModal>
            )}

            {isModalOpen && modalType === 'role' && (
                <ApprovalConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleAction}
                    isConfirming={updateUserRoleMutation.isPending}
                    title="Change User Role"
                    confirmText="Update Role"
                    variant="info"
                >
                    <div className="space-y-4">
                        <p>Update role for <strong>{selectedUser?.username}</strong></p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modal-new-role">New Role</label>
                            <select
                                id="modal-new-role"
                                value={actionData.role}
                                onChange={(e) => setActionData(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </ApprovalConfirmationModal>
            )}
        </div>
    );
}