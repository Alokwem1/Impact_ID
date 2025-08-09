import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    EnvelopeIcon,
    SparklesIcon,
    ArrowRightIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState({ 
        message: 'Verifying your email address...', 
        type: 'loading' 
    });
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [userEmail, setUserEmail] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email'); // Optional email parameter
        
        if (email) {
            setUserEmail(email);
        }

        if (!token) {
            setStatus({ 
                message: 'Invalid or missing verification link. Please check your email for the correct link.', 
                type: 'error' 
            });
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    // Cooldown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const verifyEmail = async (token) => {
        try {
            setStatus({ 
                message: 'Verifying your email address...', 
                type: 'loading' 
            });

            // Call the correct backend endpoint
            const response = await apiClient.post('/auth/verify-email', { token });
            
            setStatus({ 
                message: 'Email verified successfully! You can now access all features of Impact ID.', 
                type: 'success' 
            });
            
            // Show success toast
            toast.success('Email verified successfully!');
            
            // Redirect to login with success parameter
            setTimeout(() => {
                navigate('/login?verified=true');
            }, 3000);
            
        } catch (err) {
            console.error('Email verification error:', err);
            
            const detail = err.response?.data?.detail;
            
            if (detail) {
                if (detail.includes('expired')) {
                    setStatus({ 
                        message: 'This verification link has expired. Please request a new verification email.', 
                        type: 'expired' 
                    });
                } else if (detail.includes('invalid')) {
                    setStatus({ 
                        message: 'Invalid verification link. Please check your email for the correct link.', 
                        type: 'error' 
                    });
                } else if (detail.includes('already verified')) {
                    setStatus({ 
                        message: 'This email has already been verified. You can now log in to your account.', 
                        type: 'already_verified' 
                    });
                    setTimeout(() => {
                        navigate('/login?verified=true');
                    }, 3000);
                } else {
                    setStatus({ message: detail, type: 'error' });
                }
            } else {
                setStatus({ 
                    message: 'Verification failed. The link may be invalid or has expired.', 
                    type: 'error' 
                });
            }
        }
    };

    const handleResendVerification = async () => {
        if (!userEmail) {
            toast.error('Please provide your email address to resend verification.');
            return;
        }

        try {
            setResendLoading(true);
            
            // Call resend verification endpoint
            await apiClient.post('/auth/resend-verification', { email: userEmail });
            
            toast.success('Verification email sent! Please check your inbox.');
            setResendCooldown(60); // 60 second cooldown
            
        } catch (err) {
            console.error('Resend verification error:', err);
            const detail = err.response?.data?.detail;
            
            if (detail && detail.includes('rate limit')) {
                toast.error('Please wait before requesting another verification email.');
            } else {
                toast.error('Failed to resend verification email. Please try again later.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    const getStatusIcon = () => {
        switch (status.type) {
            case 'success':
            case 'already_verified':
                return <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />;
            case 'error':
            case 'expired':
                return <XCircleIcon className="h-16 w-16 text-red-600 mx-auto" />;
            case 'loading':
                return (
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                );
            default:
                return <InformationCircleIcon className="h-16 w-16 text-blue-600 mx-auto" />;
        }
    };

    const getStatusColor = () => {
        switch (status.type) {
            case 'success':
            case 'already_verified':
                return 'text-green-800';
            case 'error':
            case 'expired':
                return 'text-red-800';
            case 'loading':
                return 'text-blue-800';
            default:
                return 'text-gray-800';
        }
    };

    const getBackgroundColor = () => {
        switch (status.type) {
            case 'success':
            case 'already_verified':
                return 'bg-green-50 border-green-200';
            case 'error':
            case 'expired':
                return 'bg-red-50 border-red-200';
            case 'loading':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                {/* Header */}
                <div className="text-center">
                    <div className="mb-4">
                        {getStatusIcon()}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Email Verification</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {status.type === 'loading' 
                            ? 'Please wait while we verify your email address...'
                            : 'Secure your Impact ID account'
                        }
                    </p>
                </div>

                {/* Status Message */}
                <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
                    <p className={`text-sm font-medium ${getStatusColor()} text-center`}>
                        {status.message}
                    </p>
                </div>

                {/* Email Input for Resend (if no email in URL) */}
                {(status.type === 'expired' || status.type === 'error') && !userEmail && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {status.type === 'success' && (
                        <Link
                            to="/login?verified=true"
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>Continue to Login</span>
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    )}

                    {status.type === 'already_verified' && (
                        <Link
                            to="/login?verified=true"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>Go to Login</span>
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    )}

                    {(status.type === 'expired' || status.type === 'error') && (
                        <button
                            onClick={handleResendVerification}
                            disabled={resendLoading || resendCooldown > 0 || !userEmail}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                        >
                            {resendLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Sending...</span>
                                </div>
                            ) : resendCooldown > 0 ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Resend in {resendCooldown}s</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    <span>Resend Verification Email</span>
                                </div>
                            )}
                        </button>
                    )}

                    <Link
                        to="/login"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out text-center block"
                    >
                        Return to Login
                    </Link>
                </div>

                {/* Help Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                            <p className="mb-1"><strong>Need help?</strong></p>
                            <ul className="space-y-1">
                                <li>• Check your spam/junk folder</li>
                                <li>• Verification links expire after 24 hours</li>
                                <li>• Make sure to click the link from the same device</li>
                                <li>• Contact support if issues persist</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Additional Actions */}
                <div className="text-center">
                    <div className="flex justify-center space-x-4 text-sm">
                        <Link 
                            to="/register" 
                            className="text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Create New Account
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link 
                            to="/support" 
                            className="text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-center text-xs text-gray-500 mb-3">Complete verification to unlock:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <SparklesIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-gray-600">Earn XP</p>
                        </div>
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <p className="text-gray-600">Get Badges</p>
                        </div>
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <EnvelopeIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-gray-600">Notifications</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}