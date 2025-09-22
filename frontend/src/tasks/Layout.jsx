import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    ClipboardDocumentListIcon,
    TrophyIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BellIcon,
    UserIcon,
    BoltIcon,
    SparklesIcon,
    FireIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    StarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
    BellIcon as BellIconSolid,
    TrophyIcon as TrophyIconSolid,
    BoltIcon as BoltIconSolid,
    SparklesIcon as SparklesIconSolid,
    FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import { queryKeys } from '../api/queryKeys';
import toast from 'react-hot-toast';

// Fetch user profile with stats
const fetchUserProfile = async () => {
    const { data } = await apiClient.get('/api/users/me');
    return data;
};

// Fetch unread notifications count
const fetchNotificationsCount = async () => {
    try {
        const { data } = await apiClient.get('/api/notifications/unread-count');
        return data.count || 0;
    } catch (error) {
        return 0; // Return 0 if notifications endpoint is not available
    }
};

export default function Layout({ children, showBreadcrumbs = false, breadcrumbItems = [] }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Fetch user profile data
    const { data: userProfile } = useQuery({
        queryKey: queryKeys.user.me(),
        queryFn: fetchUserProfile,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
    });

    // Fetch notifications count
    const { data: notificationsCount = 0 } = useQuery({
        queryKey: queryKeys.notifications.count(),
        queryFn: fetchNotificationsCount,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // 10 seconds
        refetchOnWindowFocus: false
    });

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.user-menu') && !event.target.closest('.mobile-menu')) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    // Helper function to determine if a link is active
    const isActiveLink = (path) => {
        if (path === '/dashboard' && location.pathname === '/') return true;
        if (path === '/tasks' && location.pathname.startsWith('/tasks')) return true;
        if (path === '/badges' && location.pathname.startsWith('/badges')) return true;
        if (path === '/leaderboard' && location.pathname.startsWith('/leaderboard')) return true;
        if (path === '/activities' && location.pathname.startsWith('/activities')) return true;
        if (path === '/weaving' && location.pathname.startsWith('/weaving')) return true;
        return location.pathname === path;
    };

    // Define navigation items based on your backend routers
    const navigation = [
        { 
            name: 'Dashboard', 
            href: '/dashboard', 
            icon: HomeIcon,
            current: isActiveLink('/dashboard'),
            description: 'Overview and stats'
        },
        { 
            name: 'Tasks', 
            href: '/tasks', 
            icon: ClipboardDocumentListIcon,
            current: isActiveLink('/tasks'),
            description: 'Complete tasks and earn rewards'
        },
        { 
            name: 'Badges', 
            href: '/badges', 
            icon: TrophyIcon,
            current: isActiveLink('/badges'),
            description: 'View your achievements'
        },
        { 
            name: 'Leaderboard', 
            href: '/leaderboard', 
            icon: ChartBarIcon,
            current: isActiveLink('/leaderboard'),
            description: 'See rankings and top performers'
        },
        { 
            name: 'Activities', 
            href: '/activities', 
            icon: GlobeAltIcon,
            current: isActiveLink('/activities'),
            description: 'Recent platform activity'
        },
        { 
            name: 'Weaving', 
            href: '/weaving', 
            icon: SparklesIcon,
            current: isActiveLink('/weaving'),
            description: 'Impact weaving and connections'
        }
    ];

    // User menu items
    const userMenuItems = [
        {
            name: 'Profile',
            href: '/profile',
            icon: UserIcon,
            description: 'View and edit your profile'
        },
        {
            name: 'My Submissions',
            href: '/submissions',
            icon: DocumentTextIcon,
            description: 'Track your submission history'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Cog6ToothIcon,
            description: 'Account and preferences'
        }
    ];

    // Get user display info
    const getUserDisplayInfo = () => {
        const displayUser = userProfile || user;
        return {
            username: displayUser?.username || 'User',
            level: displayUser?.level || 1,
            xp: displayUser?.xp || 0,
            essence: displayUser?.essence || 0,
            streak: displayUser?.current_streak || 0,
            avatar: displayUser?.avatar_url,
            initials: displayUser?.username?.charAt(0)?.toUpperCase() || 'U'
        };
    };

    const userInfo = getUserDisplayInfo();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Enhanced Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Desktop Navigation */}
                        <div className="flex items-center space-x-8">
                            <Link to="/dashboard" className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">ID</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Impact ID
                                </span>
                            </Link>
                            
                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex items-center space-x-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`group relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                item.current
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                                            }`}
                                            title={item.description}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                                                <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                                                    {item.description}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop User Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* User Stats */}
                            <div className="flex items-center space-x-4 text-sm">
                                {/* XP */}
                                <div className="flex items-center space-x-1 text-yellow-600">
                                    <BoltIconSolid className="h-4 w-4" />
                                    <span className="font-semibold">{userInfo.xp.toLocaleString()}</span>
                                </div>
                                
                                {/* Essence */}
                                {userInfo.essence > 0 && (
                                    <div className="flex items-center space-x-1 text-purple-600">
                                        <SparklesIconSolid className="h-4 w-4" />
                                        <span className="font-semibold">{userInfo.essence}</span>
                                    </div>
                                )}
                                
                                {/* Streak */}
                                {userInfo.streak > 0 && (
                                    <div className="flex items-center space-x-1 text-red-600">
                                        <FireIconSolid className="h-4 w-4" />
                                        <span className="font-semibold">{userInfo.streak}</span>
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <Link
                                to="/notifications"
                                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                {notificationsCount > 0 ? (
                                    <BellIconSolid className="h-6 w-6 text-blue-600" />
                                ) : (
                                    <BellIcon className="h-6 w-6" />
                                )}
                                
                                {notificationsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notificationsCount > 9 ? '9+' : notificationsCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu */}
                            <div className="relative user-menu">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        {userInfo.avatar ? (
                                            <img
                                                src={userInfo.avatar}
                                                alt={userInfo.username}
                                                className="h-8 w-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">
                                                    {userInfo.initials}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {userInfo.username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Level {userInfo.level}
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* User Dropdown */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                        {userMenuItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-xs text-gray-500">{item.description}</div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                        
                                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                        
                                        {/* Admin Link */}
                                        {user?.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <ShieldCheckIcon className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Admin Panel</div>
                                                    <div className="text-xs text-red-500">System administration</div>
                                                </div>
                                            </Link>
                                        )}
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <div>
                                                <div className="font-medium">Logout</div>
                                                <div className="text-xs text-red-500">Sign out of your account</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
                            >
                                {mobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 mobile-menu">
                            <div className="space-y-2">
                                {/* User Info Mobile */}
                                <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                                    {userInfo.avatar ? (
                                        <img
                                            src={userInfo.avatar}
                                            alt={userInfo.username}
                                            className="h-10 w-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {userInfo.initials}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {userInfo.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Level {userInfo.level} • {userInfo.xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Items */}
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium ${
                                                item.current
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}

                                {/* User Menu Items Mobile */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {userMenuItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}

                                    {/* Admin Link Mobile */}
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center space-x-3 px-3 py-3 text-base font-bold text-red-600 hover:text-red-700"
                                        >
                                            <ShieldCheckIcon className="h-5 w-5" />
                                            <span>Admin Panel</span>
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 w-full px-3 py-3 text-base font-medium text-red-600 hover:text-red-700"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Breadcrumbs */}
            {showBreadcrumbs && breadcrumbItems.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            {breadcrumbItems.map((item, index) => (
                                <li key={index} className="flex items-center">
                                    {index > 0 && (
                                        <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {item.href ? (
                                        <Link
                                            to={item.href}
                                            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                        >
                                            {item.name}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-900 text-sm font-medium">
                                            {item.name}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}