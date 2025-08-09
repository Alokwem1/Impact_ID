import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
    ShieldExclamationIcon,
    ExclamationTriangleIcon,
    EnvelopeIcon,
    ClockIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

// Enhanced ProtectedRoute with comprehensive access control
const ProtectedRoute = ({ 
    children, 
    roles = null, 
    permissions = null,
    requireVerification = true,
    fallbackPath = '/login',
    showLoadingSpinner = false,
    customLoadingComponent = null,
    customUnauthorizedComponent = null
}) => {
    const { 
        user, 
        loading, 
        isAuthenticated, 
        hasRole, 
        hasPermission,
        resendVerificationEmail 
    } = useAuth();
    const location = useLocation();

    // Enhanced loading state
    if (loading) {
        if (customLoadingComponent) {
            return customLoadingComponent;
        }
        
        if (showLoadingSpinner) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Impact ID</h3>
                                <p className="text-gray-600">Verifying your access...</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        // Return null to let parent Suspense handle loading
        return null;
    }

    // Not authenticated - redirect to login with return path
    if (!isAuthenticated || !user) {
        return (
            <Navigate 
                to={fallbackPath} 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // Check email verification requirement
    if (requireVerification && !user.is_verified) {
        return <EmailVerificationRequired />;
    }

    // Check role-based access
    if (roles && !hasRole(roles)) {
        if (customUnauthorizedComponent) {
            return customUnauthorizedComponent;
        }
        return <UnauthorizedAccess requiredRoles={roles} userRole={user.role} />;
    }

    // Check permission-based access
    if (permissions) {
        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
        const hasRequiredPermission = permissionArray.some(permission => hasPermission(permission));
        
        if (!hasRequiredPermission) {
            if (customUnauthorizedComponent) {
                return customUnauthorizedComponent;
            }
            return <UnauthorizedAccess requiredPermissions={permissions} />;
        }
    }

    // Check account status
    if (user.status && user.status !== 'active') {
        return <AccountStatusRestricted status={user.status} />;
    }

    // All checks passed - render protected content
    return children;
};

// Email verification required component
const EmailVerificationRequired = () => {
    const { user, resendVerificationEmail } = useAuth();
    const [sending, setSending] = React.useState(false);
    const [sent, setSent] = React.useState(false);

    const handleResendVerification = async () => {
        setSending(true);
        try {
            await resendVerificationEmail();
            setSent(true);
        } catch (error) {
            console.error('Failed to resend verification email:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <EnvelopeIcon className="h-8 w-8 text-yellow-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Email Verification Required
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        Hi {user?.username}! Please verify your email address to access all Impact ID features.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Email:</strong> {user?.email}
                        </p>
                    </div>
                    
                    {sent ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800">
                                ✓ Verification email sent! Check your inbox and spam folder.
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleResendVerification}
                            disabled={sending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    )}
                    
                    <div className="mt-4 text-sm text-gray-500">
                        <p>Didn't receive the email? Check your spam folder or contact support.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Unauthorized access component
const UnauthorizedAccess = ({ requiredRoles, requiredPermissions, userRole }) => {
    const location = useLocation();

    const formatRoles = (roles) => {
        if (!roles) return '';
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.join(', ');
    };

    const formatPermissions = (permissions) => {
        if (!permissions) return '';
        const permArray = Array.isArray(permissions) ? permissions : [permissions];
        return permArray.join(', ');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Restricted
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this page.
                    </p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
                        {userRole && (
                            <p className="text-sm text-gray-700 mb-2">
                                <strong>Your Role:</strong> {userRole}
                            </p>
                        )}
                        {requiredRoles && (
                            <p className="text-sm text-gray-700 mb-2">
                                <strong>Required Role(s):</strong> {formatRoles(requiredRoles)}
                            </p>
                        )}
                        {requiredPermissions && (
                            <p className="text-sm text-gray-700">
                                <strong>Required Permission(s):</strong> {formatPermissions(requiredPermissions)}
                            </p>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Go Back
                        </button>
                        
                        <Navigate 
                            to="/dashboard" 
                            state={{ from: location }} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
                        >
                            Return to Dashboard
                        </Navigate>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Account status restriction component
const AccountStatusRestricted = ({ status }) => {
    const getStatusInfo = (status) => {
        const statusMap = {
            suspended: {
                icon: ExclamationTriangleIcon,
                color: 'red',
                title: 'Account Suspended',
                message: 'Your account has been temporarily suspended. Please contact support for assistance.',
                bgColor: 'from-red-50 to-rose-100',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600'
            },
            pending: {
                icon: ClockIcon,
                color: 'yellow',
                title: 'Account Pending',
                message: 'Your account is being reviewed. You\'ll receive an email once it\'s approved.',
                bgColor: 'from-yellow-50 to-orange-100',
                iconBg: 'bg-yellow-100',
                iconColor: 'text-yellow-600'
            },
            inactive: {
                icon: LockClosedIcon,
                color: 'gray',
                title: 'Account Inactive',
                message: 'Your account is currently inactive. Please contact support to reactivate.',
                bgColor: 'from-gray-50 to-slate-100',
                iconBg: 'bg-gray-100',
                iconColor: 'text-gray-600'
            }
        };
        
        return statusMap[status] || statusMap.suspended;
    };

    const statusInfo = getStatusInfo(status);
    const Icon = statusInfo.icon;

    return (
        <div className={`min-h-screen bg-gradient-to-br ${statusInfo.bgColor} flex items-center justify-center p-4`}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
                <div className="text-center">
                    <div className={`mx-auto w-16 h-16 ${statusInfo.iconBg} rounded-full flex items-center justify-center mb-6`}>
                        <Icon className={`h-8 w-8 ${statusInfo.iconColor}`} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {statusInfo.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        {statusInfo.message}
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <a
                            href="mailto:support@impactid.xyz"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
                        >
                            Contact Support
                        </a>
                        
                        <Navigate 
                            to="/login" 
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block text-center"
                        >
                            Back to Login
                        </Navigate>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Specialized route protection components
export const AdminRoute = ({ children, ...props }) => (
    <ProtectedRoute roles={['admin']} {...props}>
        {children}
    </ProtectedRoute>
);

export const ModeratorRoute = ({ children, ...props }) => (
    <ProtectedRoute roles={['admin', 'moderator']} {...props}>
        {children}
    </ProtectedRoute>
);

export const VerifiedRoute = ({ children, ...props }) => (
    <ProtectedRoute requireVerification={true} {...props}>
        {children}
    </ProtectedRoute>
);

export const GuestAllowedRoute = ({ children, ...props }) => (
    <ProtectedRoute requireVerification={false} roles={['user', 'admin', 'moderator', 'guest']} {...props}>
        {children}
    </ProtectedRoute>
);

// Higher-order component for route protection
export const withAuth = (Component, options = {}) => {
    return function AuthenticatedComponent(props) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
};

// Hook for conditional rendering based on auth status
export const useRouteAccess = (roles = null, permissions = null) => {
    const { user, isAuthenticated, hasRole, hasPermission } = useAuth();
    
    const hasAccess = React.useMemo(() => {
        if (!isAuthenticated || !user) return false;
        
        // Check role access
        if (roles && !hasRole(roles)) return false;
        
        // Check permission access
        if (permissions) {
            const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
            return permissionArray.some(permission => hasPermission(permission));
        }
        
        return true;
    }, [isAuthenticated, user, roles, permissions, hasRole, hasPermission]);
    
    return {
        hasAccess,
        isAuthenticated,
        user,
        isVerified: user?.is_verified || false,
        role: user?.role,
        status: user?.status
    };
};

export default ProtectedRoute;