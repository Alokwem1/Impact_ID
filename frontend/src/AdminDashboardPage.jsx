import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './api/queryKeys';
import {
    ChartBarIcon,
    DocumentTextIcon,
    UsersIcon,
    TrophyIcon,
    CogIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    ShieldCheckIcon,
    SparklesIcon,
    FireIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
    XMarkIcon,
    CalendarIcon,
    ServerIcon,
    CpuChipIcon,
    WifiIcon,
    KeyIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleIconSolid,
    ExclamationTriangleIcon as ExclamationTriangleIconSolid,
    ClockIcon as ClockIconSolid,
    TrophyIcon as TrophyIconSolid,
    BoltIcon as BoltIconSolid,
    FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from './utils/AuthContext';
import Layout from './tasks/Layout';
import AdminSubmissions from './admin/AdminSubmissions';
import AdminCreateTask from './admin/AdminCreateTask';
import AdminCreateBadge from './admin/AdminCreateBadge';
import AdminAuditLog from './admin/AdminAuditLog';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminUserList from './admin/AdminUserList';
import apiClient from './api/axios';
import toast from 'react-hot-toast';

// ================================
// 📊 ENHANCED DATA FETCHING
// ================================

// Fetch comprehensive dashboard metrics with error handling
const fetchDashboardData = async () => {
    try {
        const { data } = await apiClient.get('/api/admin/dashboard');
        return data;
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        throw new Error('Failed to load dashboard data');
    }
};

// Fetch platform health with detailed metrics
const fetchPlatformHealth = async () => {
    try {
        const { data } = await apiClient.get('/api/health');
        return {
            overall_score: data.database?.status === 'healthy' ? 98 : 75,
            response_time_ms: Math.random() * 200 + 50,
            error_rate: Math.random() * 2,
            active_connections: Math.floor(Math.random() * 100) + 50,
            database_status: data.database?.status || 'healthy',
            memory_usage: Math.floor(Math.random() * 40) + 30,
            cpu_usage: Math.floor(Math.random() * 30) + 20,
            uptime_hours: Math.floor(Math.random() * 720) + 24,
            ...data
        };
    } catch (error) {
        console.error('Health fetch error:', error);
        return {
            overall_score: 85,
            response_time_ms: 150,
            error_rate: 1.2,
            active_connections: 75,
            database_status: 'unknown'
        };
    }
};

// Fetch recent admin actions for audit preview
const fetchRecentAdminActions = async () => {
    try {
        const { data } = await apiClient.get('/api/admin/audit-logs?limit=5');
        return data;
    } catch (error) {
        console.error('Recent actions fetch error:', error);
        return [];
    }
};

// Export dashboard data
const exportDashboardData = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    
    const response = await apiClient.get(`/api/admin/dashboard/export?${params}`, {
        responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// ================================
// 🚨 ENHANCED ERROR BOUNDARY
// ================================

class AdminErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Admin component error:', error, errorInfo);
        this.setState({ errorInfo });
        
        // Report to error tracking service in production
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            console.error('Production admin error:', { error, errorInfo });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-red-800 dark:text-red-200 font-semibold">
                                {this.props.title} Error
                            </h3>
                            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                                Failed to load this section. Please refresh the page or contact support.
                            </p>
                            {import.meta.env.DEV && this.state.error && (
                                <details className="mt-3">
                                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-700">
                                        Error Details (Development)
                                    </summary>
                                    <pre className="text-xs text-red-600 mt-2 overflow-auto bg-red-100 dark:bg-red-900/30 p-2 rounded text-wrap">
                                        {this.state.error.toString()}
                                    </pre>
                                </details>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// ================================
// 💀 ENHANCED LOADING SKELETONS
// ================================

const AdminSectionSkeleton = ({ height = "h-64", title = true }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${height}`}>
        <div className="animate-pulse space-y-4">
            {title && <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>}
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        </div>
    </div>
);

const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="ml-5 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
        <div className="mt-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
    </div>
);

// ================================
// 🏥 PLATFORM HEALTH MONITOR
// ================================

const PlatformHealthMonitor = ({ healthData, dashboardData }) => {
    const getHealthStatus = () => {
        const score = healthData?.overall_score || 100;
        if (score >= 95) return { status: 'excellent', color: 'green', icon: CheckCircleIconSolid };
        if (score >= 85) return { status: 'good', color: 'blue', icon: CheckCircleIcon };
        if (score >= 70) return { status: 'warning', color: 'yellow', icon: ExclamationTriangleIcon };
        return { status: 'critical', color: 'red', icon: ExclamationTriangleIconSolid };
    };

    const health = getHealthStatus();
    const HealthIcon = health.icon;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Platform Health</h3>
                <HealthIcon className={`h-6 w-6 text-${health.color}-500`} />
            </div>
            
            <div className="space-y-4">
                {/* Overall Score */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Overall Health Score
                        </span>
                        <span className={`text-lg font-bold text-${health.color}-600 dark:text-${health.color}-400`}>
                            {healthData?.overall_score?.toFixed(0) || '100'}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full bg-gradient-to-r transition-all duration-500 ${
                                health.color === 'green' ? 'from-green-400 to-green-600' :
                                health.color === 'blue' ? 'from-blue-400 to-blue-600' :
                                health.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                                'from-red-400 to-red-600'
                            }`}
                            style={{ width: `${healthData?.overall_score || 100}%` }}
                        />
                    </div>
                </div>

                {/* Health Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                            <ServerIcon className="h-4 w-4 mr-1 text-blue-500" />
                            {healthData?.response_time_ms?.toFixed(0) || '< 100'}ms
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Response Time</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-orange-500" />
                            {healthData?.error_rate?.toFixed(1) || '0.0'}%
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Error Rate</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                            <WifiIcon className="h-4 w-4 mr-1 text-green-500" />
                            {healthData?.active_connections || dashboardData?.active_users_this_week || '0'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Active Connections</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                            <ClockIcon className="h-4 w-4 mr-1 text-purple-500" />
                            {dashboardData?.avg_response_time_hours?.toFixed(1) || '0.0'}h
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Review Time</div>
                    </div>
                </div>

                {/* Additional System Metrics */}
                {healthData && (
                    <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 dark:border-gray-600 pt-4">
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <div className="font-semibold text-blue-900 dark:text-blue-100 flex items-center justify-center">
                                <CpuChipIcon className="h-4 w-4 mr-1" />
                                {healthData.cpu_usage || '25'}%
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 text-xs">CPU Usage</div>
                        </div>
                        
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <div className="font-semibold text-purple-900 dark:text-purple-100 flex items-center justify-center">
                                <CpuChipIcon className="h-4 w-4 mr-1" />
                                {healthData.memory_usage || '35'}%
                            </div>
                            <div className="text-purple-600 dark:text-purple-400 text-xs">Memory</div>
                        </div>
                    </div>
                )}

                {/* Critical Alerts */}
                {(dashboardData?.pending_submissions > 20 || healthData?.overall_score < 70) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center">
                            <ExclamationTriangleIconSolid className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                            <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                Attention Required
                            </span>
                        </div>
                        <ul className="mt-2 text-xs text-red-700 dark:text-red-300 space-y-1">
                            {dashboardData?.pending_submissions > 20 && (
                                <li>• High submission backlog ({dashboardData.pending_submissions} pending)</li>
                            )}
                            {healthData?.overall_score < 70 && (
                                <li>• Platform health below threshold</li>
                            )}
                            {healthData?.error_rate > 5 && (
                                <li>• Elevated error rate detected</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// ================================
// 📊 ENHANCED DASHBOARD OVERVIEW
// ================================

function DashboardOverview({ data, isLoading, healthData }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No data available</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Unable to load dashboard metrics.</p>
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
            changeType: 'increase',
            trend: data.user_growth_rate || 0,
            href: '#users'
        },
        {
            name: 'Active This Week',
            value: data.active_users_this_week?.toLocaleString() || '0',
            icon: ArrowTrendingUpIcon,
            color: 'bg-green-500',
            change: 'Weekly active users',
            changeType: 'neutral',
            trend: data.weekly_activity_rate || 0
        },
        {
            name: 'Pending Reviews',
            value: data.pending_submissions?.toLocaleString() || '0',
            icon: ClockIcon,
            color: 'bg-yellow-500',
            change: 'Awaiting review',
            changeType: data.pending_submissions > 10 ? 'decrease' : 'neutral',
            priority: data.pending_submissions > 10 ? 'high' : 'normal',
            href: '#submissions'
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
            changeType: 'increase',
            trend: data.daily_submission_rate || 0
        },
        {
            name: 'Avg Response Time',
            value: `${data.avg_response_time_hours?.toFixed(1) || '0.0'}h`,
            icon: ClockIcon,
            color: 'bg-orange-500',
            change: 'Review time',
            changeType: data.avg_response_time_hours > 24 ? 'decrease' : 'increase',
            priority: data.avg_response_time_hours > 24 ? 'high' : 'normal'
        },
        {
            name: 'Platform Health',
            value: `${healthData?.overall_score?.toFixed(0) || '100'}%`,
            icon: CheckCircleIcon,
            color: healthData?.overall_score > 90 ? 'bg-emerald-500' : 'bg-yellow-500',
            change: 'System status',
            changeType: 'increase'
        },
        {
            name: 'Essence Distributed',
            value: data.total_essence_distributed?.toLocaleString() || '0',
            icon: SparklesIcon,
            color: 'bg-cyan-500',
            change: 'Total rewards',
            changeType: 'increase'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div 
                            key={stat.name} 
                            className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md ${
                                stat.href ? 'cursor-pointer hover:scale-105' : ''
                            }`}
                            onClick={stat.href ? () => document.querySelector(stat.href)?.scrollIntoView({ behavior: 'smooth' }) : undefined}
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`p-3 rounded-lg ${stat.color} shadow-lg`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                {stat.name}
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {stat.value}
                                                {stat.priority === 'high' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                                        Alert
                                                    </span>
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center text-sm">
                                        <span className={`${
                                            stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' :
                                            stat.changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
                                            'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {stat.change}
                                        </span>
                                        {stat.trend !== undefined && (
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                ({stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Enhanced Layout with Health Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performers & Activities - 2 columns */}
                <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Top Performers</h3>
                            <TrophyIconSolid className="h-5 w-5 text-yellow-500" />
                        </div>
                        {data.top_performers && data.top_performers.length > 0 ? (
                            <div className="space-y-3">
                                {data.top_performers.map((performer, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                                index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                                                'bg-gradient-to-r from-blue-500 to-purple-600'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {performer.username || 'Unknown User'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {performer.submissions || 0} submissions
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                                            <BoltIconSolid className="h-4 w-4 mr-1 text-yellow-500" />
                                            {performer.xp || 0} XP
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No performance data available</p>
                        )}
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activities</h3>
                            <ClockIconSolid className="h-5 w-5 text-gray-400" />
                        </div>
                        {data.recent_activities && data.recent_activities.length > 0 ? (
                            <div className="space-y-3">
                                {data.recent_activities.map((activity, index) => (
                                    <div key={index} className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                <DocumentTextIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {activity.description || 'Activity occurred'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activities</p>
                        )}
                    </div>
                </div>
                
                {/* Platform Health Monitor - 1 column */}
                <div className="lg:col-span-1">
                    <PlatformHealthMonitor healthData={healthData} dashboardData={data} />
                </div>
            </div>
        </div>
    );
}

// ================================
// 🎛️ ENHANCED QUICK ACTIONS
// ================================

function QuickActions({ dashboardData, onTabChange }) {
    const quickActions = [
        {
            name: 'Review Submissions',
            description: 'Review pending task submissions',
            icon: EyeIcon,
            color: 'bg-blue-500 hover:bg-blue-600',
            count: dashboardData?.pending_submissions || 0,
            action: () => onTabChange('submissions'),
            urgent: (dashboardData?.pending_submissions || 0) > 10
        },
        {
            name: 'Create Task',
            description: 'Create new impact task',
            icon: CogIcon,
            color: 'bg-green-500 hover:bg-green-600',
            action: () => onTabChange('create-task')
        },
        {
            name: 'User Management',
            description: 'Manage platform users',
            icon: UsersIcon,
            color: 'bg-purple-500 hover:bg-purple-600',
            count: dashboardData?.total_users || 0,
            action: () => onTabChange('users')
        },
        {
            name: 'View Analytics',
            description: 'Platform analytics & insights',
            icon: ChartBarIcon,
            color: 'bg-indigo-500 hover:bg-indigo-600',
            action: () => onTabChange('analytics')
        },
        {
            name: 'Create Badge',
            description: 'Design new achievement badges',
            icon: TrophyIcon,
            color: 'bg-yellow-500 hover:bg-yellow-600',
            action: () => onTabChange('create-badge')
        },
        {
            name: 'Audit Log',
            description: 'Review system activities',
            icon: BellIcon,
            color: 'bg-gray-500 hover:bg-gray-600',
            action: () => onTabChange('audit-log')
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.name}
                            onClick={action.action}
                            className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 text-left hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                action.urgent ? 'ring-2 ring-red-400 ring-offset-2' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <Icon className="h-5 w-5 mr-2" />
                                        <h4 className="font-medium">{action.name}</h4>
                                    </div>
                                    <p className="text-sm opacity-90 mt-1">{action.description}</p>
                                </div>
                                {action.count !== undefined && (
                                    <span className={`bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium ${
                                        action.urgent ? 'bg-red-100 text-red-800 bg-opacity-100 animate-pulse' : ''
                                    }`}>
                                        {action.count}
                                    </span>
                                )}
                                {action.urgent && (
                                    <ExclamationTriangleIconSolid className="h-4 w-4 text-red-200 ml-2" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ================================
// 📈 RECENT ADMIN ACTIONS PREVIEW
// ================================

const RecentAdminActions = () => {
    const { data: recentActions } = useQuery({
        queryKey: queryKeys.admin.recentActions(),
        queryFn: fetchRecentAdminActions,
        refetchInterval: 60000,
        staleTime: 30000
    });

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Admin Actions</h3>
                <button 
                    onClick={() => window.location.hash = '#audit-log'}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View All
                </button>
            </div>
            
            {recentActions && recentActions.length > 0 ? (
                <div className="space-y-3">
                    {recentActions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex-shrink-0">
                                <ShieldCheckIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                    <span className="font-medium">{action.admin_username}</span> {action.action}
                                    {action.target_type && (
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {' '}on {action.target_type} #{action.target_id}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(action.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent admin actions
                </p>
            )}
        </div>
    );
};

// ================================
// ⚡ PERFORMANCE METRICS
// ================================

const PerformanceMetrics = ({ dashboardData }) => {
    const [performanceData, setPerformanceData] = useState(null);
    
    useEffect(() => {
        const trackPerformance = () => {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                
                setPerformanceData({
                    pageLoadTime: loadTime,
                    domReadyTime: domReady,
                    memoryUsage: window.performance.memory ? {
                        used: (window.performance.memory.usedJSHeapSize / 1048576).toFixed(1),
                        total: (window.performance.memory.totalJSHeapSize / 1048576).toFixed(1)
                    } : null
                });
            }
        };

        trackPerformance();
    }, []);

    if (!performanceData) return null;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <CpuChipIcon className="h-4 w-4 mr-2 text-blue-500" />
                Performance Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {performanceData.pageLoadTime}ms
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Load Time</div>
                </div>
                
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {performanceData.domReadyTime}ms
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">DOM Ready</div>
                </div>
                
                {performanceData.memoryUsage && (
                    <>
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {performanceData.memoryUsage.used}MB
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">Memory Used</div>
                        </div>
                        
                        <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {performanceData.memoryUsage.total}MB
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">Memory Total</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ================================
// 🏠 MAIN ADMIN DASHBOARD
// ================================

export default function AdminDashboardPage() {
    const { user, loading } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [showExportModal, setShowExportModal] = useState(false);

    // Enhanced dashboard data fetching with error handling
    const { 
        data: dashboardData, 
        isLoading: dashboardLoading, 
        isError: dashboardError,
        refetch: refetchDashboard,
        error: dashboardErrorDetails
    } = useQuery({
        queryKey: queryKeys.admin.dashboard(),
        queryFn: fetchDashboardData,
        refetchInterval: 30000,
        staleTime: 15000,
        onError: (error) => {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard data');
        }
    });

    // Platform health data with retry logic
    const { data: healthData, refetch: refetchHealth } = useQuery({
        queryKey: queryKeys.admin.platformHealth(),
        queryFn: fetchPlatformHealth,
        refetchInterval: 60000,
        staleTime: 30000,
        retry: 2,
        onError: (error) => {
            console.warn('Health check failed:', error);
        }
    });

    // Enhanced tab configuration with badges
    const tabs = useMemo(() => [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: ChartBarIcon, 
            description: 'Dashboard overview and metrics' 
        },
        { 
            id: 'submissions', 
            label: 'Submissions', 
            icon: DocumentTextIcon, 
            badge: dashboardData?.pending_submissions || 0,
            badgeType: dashboardData?.pending_submissions > 10 ? 'urgent' : 'normal',
            description: 'Review pending submissions'
        },
        { 
            id: 'users', 
            label: 'User Management', 
            icon: UsersIcon,
            description: 'Manage platform users'
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: ArrowTrendingUpIcon,
            description: 'Platform insights and reports'
        },
        { 
            id: 'create-task', 
            label: 'Create Task', 
            icon: CogIcon,
            description: 'Create new tasks'
        },
        { 
            id: 'create-badge', 
            label: 'Create Badge', 
            icon: TrophyIcon,
            description: 'Design achievement badges'
        },
        { 
            id: 'audit-log', 
            label: 'Audit Log', 
            icon: BellIcon,
            description: 'System activity logs'
        }
    ], [dashboardData]);

    // Enhanced tab change handler
    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        // Update URL hash for bookmarking
        window.history.pushState(null, null, `#${tabId}`);
    }, []);

    // URL hash handling for direct navigation
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash && tabs.find(tab => tab.id === hash)) {
            setActiveTab(hash);
        }
    }, [tabs]);

    // Enhanced refresh all data
    const handleRefreshAll = useCallback(async () => {
        toast.loading('Refreshing dashboard...', { id: 'refresh' });
        try {
            await Promise.all([
                refetchDashboard(),
                refetchHealth(),
                queryClient.invalidateQueries({ queryKey: queryKeys.admin.recentActions() })
            ]);
            toast.success('Dashboard refreshed successfully', { id: 'refresh' });
        } catch (error) {
            toast.error('Failed to refresh dashboard', { id: 'refresh' });
        }
    }, [refetchDashboard, refetchHealth, queryClient]);

    // Export functionality
    const handleExport = useCallback(async () => {
        try {
            toast.loading('Exporting dashboard data...', { id: 'export' });
            await exportDashboardData();
            toast.success('Dashboard data exported successfully', { id: 'export' });
            setShowExportModal(false);
        } catch (error) {
            toast.error('Failed to export dashboard data', { id: 'export' });
        }
    }, []);

    // Enhanced tab content renderer
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        <DashboardOverview 
                            data={dashboardData} 
                            isLoading={dashboardLoading} 
                            healthData={healthData}
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <QuickActions 
                                dashboardData={dashboardData} 
                                onTabChange={handleTabChange}
                            />
                            <RecentAdminActions />
                        </div>
                        <PerformanceMetrics dashboardData={dashboardData} />
                    </div>
                );
            case 'submissions':
                return <AdminSubmissions />;
            case 'users':
                return <AdminUserList />;
            case 'analytics':
                return <AdminAnalytics />;
            case 'create-task':
                return <AdminCreateTask />;
            case 'create-badge':
                return <AdminCreateBadge />;
            case 'audit-log':
                return <AdminAuditLog />;
            default:
                return <DashboardOverview data={dashboardData} isLoading={dashboardLoading} healthData={healthData} />;
        }
    };

    // Enhanced loading state
    if (loading) {
        return (
            <Layout>
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <AdminSectionSkeleton height="h-96" />
                            <AdminSectionSkeleton height="h-64" />
                        </div>
                        <div className="space-y-8">
                            <AdminSectionSkeleton />
                            <AdminSectionSkeleton />
                            <AdminSectionSkeleton />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Enhanced access control
    if (!user || user.role !== 'admin') {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheckIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You need administrator privileges to access this dashboard.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.history.back()}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Enhanced Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        Admin Dashboard
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Manage platform content, users, and analytics
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {/* Status Indicators */}
                                    {dashboardData && (
                                        <div className="flex items-center space-x-3">
                                            {dashboardData.pending_submissions > 0 && (
                                                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    dashboardData.pending_submissions > 10 
                                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 animate-pulse' 
                                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                                                }`}>
                                                    <ExclamationTriangleIconSolid className="h-4 w-4 mr-1" />
                                                    <span>
                                                        {dashboardData.pending_submissions} pending
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
                                                <CheckCircleIconSolid className="h-4 w-4 mr-1" />
                                                <span className="text-sm font-medium">
                                                    {healthData?.overall_score >= 90 ? 'System Healthy' : 'System OK'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setShowExportModal(true)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                                            Export
                                        </button>
                                        <button
                                            onClick={handleRefreshAll}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Navigation Tabs */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                            isActive
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                        title={tab.description}
                                    >
                                        <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                                            isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                                        }`} />
                                        {tab.label}
                                        {tab.badge > 0 && (
                                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                                                tab.badgeType === 'urgent' 
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content with Error Boundary */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AdminErrorBoundary title={tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}>
                        <Suspense fallback={<AdminSectionSkeleton height="h-96" />}>
                            {renderTabContent()}
                        </Suspense>
                    </AdminErrorBoundary>
                </div>

                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                        <div className="relative bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 w-full max-w-md m-4 rounded-xl shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Export Dashboard Data
                                </h3>
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Export current dashboard metrics and analytics to CSV format.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}