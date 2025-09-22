import { useState, useEffect } from 'react';
import { 
    ChartBarIcon, 
    UsersIcon, 
    DocumentTextIcon, 
    TrophyIcon,
    CogIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';
import Layout from '../tasks/Layout';
import AdminSubmissions from '../admin/AdminSubmissions';
import AdminCreateTask from '../admin/AdminCreateTask';
import AdminCreateBadge from '../admin/AdminCreateBadge';
import AdminAuditLog from '../admin/AdminAuditLog';
import AdminAnalytics from '../admin/AdminAnalytics';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

// ✅ CRITICAL FIX: Fetch dashboard data with correct API prefix
const fetchDashboardData = async () => {
    const { data } = await apiClient.get('/api/admin/dashboard');
    return data;
};

/**
 * AdminDashboardPage serves as the main control panel for administrators.
 * It aggregates all administrative tasks into a single, cohesive view,
 * allowing for efficient management of platform content and user submissions.
 */
export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch dashboard metrics from your backend
    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: queryKeys.admin.dashboard(),
        queryFn: fetchDashboardData,
        refetchInterval: 30000, // Refresh every 30 seconds
        onError: (error) => {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard data');
        }
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
        { id: 'submissions', label: 'Submissions', icon: DocumentTextIcon },
        { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon },
        { id: 'create-task', label: 'Create Task', icon: CogIcon },
        { id: 'create-badge', label: 'Create Badge', icon: TrophyIcon },
        { id: 'audit-log', label: 'Audit Log', icon: BellIcon }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview data={dashboardData} isLoading={isLoading} />;
            case 'submissions':
                return <AdminSubmissions />;
            case 'analytics':
                return <AdminAnalytics />;
            case 'create-task':
                return <AdminCreateTask />;
            case 'create-badge':
                return <AdminCreateBadge />;
            case 'audit-log':
                return <AdminAuditLog />;
            default:
                return <DashboardOverview data={dashboardData} isLoading={isLoading} />;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage platform content, users, and analytics
                                    </p>
                                </div>
                                {dashboardData && (
                                    <div className="flex items-center space-x-4">
                                        {dashboardData.pending_submissions > 0 && (
                                            <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                                <span className="text-sm font-medium">
                                                    {dashboardData.pending_submissions} pending
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">System Healthy</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                                            activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`} />
                                        {tab.label}
                                        {tab.id === 'submissions' && dashboardData?.pending_submissions > 0 && (
                                            <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                                                {dashboardData.pending_submissions}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {renderTabContent()}
                </div>
            </div>
        </Layout>
    );
}

// Dashboard Overview Component
function DashboardOverview({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                <p className="mt-1 text-sm text-gray-500">Unable to load dashboard metrics.</p>
            </div>
        );
    }

    const stats = [
        {
            name: 'Total Users',
            value: data.total_users?.toLocaleString() || '0',
            icon: UsersIcon,
            color: 'bg-blue-500',
            change: `+${data.new_users_today || 0} today`,
            changeType: 'increase'
        },
        {
            name: 'Active This Week',
            value: data.active_users_this_week?.toLocaleString() || '0',
            icon: ArrowTrendingUpIcon,
            color: 'bg-green-500',
            change: 'Weekly active users',
            changeType: 'neutral'
        },
        {
            name: 'Pending Reviews',
            value: data.pending_submissions?.toLocaleString() || '0',
            icon: ClockIcon,
            color: 'bg-yellow-500',
            change: 'Awaiting review',
            changeType: data.pending_submissions > 10 ? 'decrease' : 'neutral'
        },
        {
            name: 'Active Tasks',
            value: data.total_active_tasks?.toLocaleString() || '0',
            icon: DocumentTextIcon,
            color: 'bg-purple-500',
            change: 'Published tasks',
            changeType: 'neutral'
        },
        {
            name: 'Submissions Today',
            value: data.submissions_today?.toLocaleString() || '0',
            icon: CheckCircleIcon,
            color: 'bg-indigo-500',
            change: 'Today\'s activity',
            changeType: 'increase'
        },
        {
            name: 'Avg Response Time',
            value: `${data.avg_response_time_hours?.toFixed(1) || '0.0'}h`,
            icon: ClockIcon,
            color: 'bg-orange-500',
            change: 'Review time',
            changeType: data.avg_response_time_hours > 24 ? 'decrease' : 'increase'
        },
        {
            name: 'Platform Health',
            value: `${data.platform_health_score?.toFixed(0) || '100'}%`,
            icon: CheckCircleIcon,
            color: 'bg-emerald-500',
            change: 'System status',
            changeType: 'increase'
        },
        {
            name: 'New Today',
            value: data.new_users_today?.toLocaleString() || '0',
            icon: UsersIcon,
            color: 'bg-cyan-500',
            change: 'New registrations',
            changeType: 'increase'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`p-3 rounded-md ${stat.color}`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                {stat.name}
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stat.value}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center text-sm">
                                        <span className={`${
                                            stat.changeType === 'increase' ? 'text-green-600' :
                                            stat.changeType === 'decrease' ? 'text-red-600' :
                                            'text-gray-600'
                                        }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Top Performers & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
                    {data.top_performers && data.top_performers.length > 0 ? (
                        <div className="space-y-3">
                            {data.top_performers.map((performer, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                            {performer.username?.charAt(0).toUpperCase() || '#'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {performer.username || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {performer.submissions || 0} submissions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-blue-600">
                                        {performer.xp || 0} XP
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No performance data available</p>
                    )}
                </div>

                {/* Recent Activities */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                    {data.recent_activities && data.recent_activities.length > 0 ? (
                        <div className="space-y-3">
                            {data.recent_activities.map((activity, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-gray-900">
                                            {activity.description || 'Activity occurred'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No recent activities</p>
                    )}
                </div>
            </div>
        </div>
    );
}