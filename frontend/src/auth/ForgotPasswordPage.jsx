import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    EnvelopeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    LockClosedIcon,
    SparklesIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchParams] = useSearchParams();

    // Handle URL parameters for different states
    useEffect(() => {
        const error = searchParams.get('error');
        const message = searchParams.get('message');
        
        if (error === 'expired') {
            setStatus({
                message: 'Your password reset link has expired. Please request a new one.',
                type: 'error'
            });
        } else if (error === 'invalid') {
            setStatus({
                message: 'Invalid reset link. Please request a new password reset.',
                type: 'error'
            });
        } else if (message === 'reset_success') {
            setStatus({
                message: 'Password reset successfully! You can now log in with your new password.',
                type: 'success'
            });
        }
    }, [searchParams]);

    // Enhanced email validation
    const validateEmail = (email) => {
        const newErrors = {};
        
        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (email.length > 255) {
            newErrors.email = 'Email address is too long';
        }
        
        return newErrors;
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        
        // Clear errors when user starts typing
        if (errors.email) {
            setErrors({});
        }
        
        // Clear status messages when user starts typing
        if (status.message) {
            setStatus({ message: '', type: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email first
        const validationErrors = validateEmail(email);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        setErrors({});
        setStatus({ message: '', type: '' });

        try {
            // Call the correct backend endpoint
            await apiClient.post('/auth/forgot-password', { email });
            
            setStatus({
                message: 'If an account with that email exists, a reset link has been sent to your inbox.',
                type: 'success',
            });
            
            // Clear the email field on success
            setEmail('');
            
            // Show toast notification
            toast.success('Reset instructions sent! Check your email.');
            
        } catch (err) {
            console.error('Password reset error:', err);
            
            // Enhanced error handling based on backend responses
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                
                if (detail.includes('rate limit')) {
                    setStatus({
                        message: 'Too many reset requests. Please wait a few minutes before trying again.',
                        type: 'error'
                    });
                } else if (detail.includes('temporarily unavailable')) {
                    setStatus({
                        message: 'Password reset service is temporarily unavailable. Please try again later.',
                        type: 'error'
                    });
                } else {
                    // For security, still show generic message for most errors
                    setStatus({
                        message: 'If an account with that email exists, a reset link has been sent to your inbox.',
                        type: 'success',
                    });
                }
            } else {
                // Network or other errors - show generic success message for security
                setStatus({
                    message: 'If an account with that email exists, a reset link has been sent to your inbox.',
                    type: 'success',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-clear success messages after 10 seconds
    useEffect(() => {
        if (status.type === 'success' && status.message) {
            const timer = setTimeout(() => {
                setStatus({ message: '', type: '' });
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        No worries! Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {/* Status Messages */}
                {status.message && (
                    <div className={`flex items-start space-x-2 p-4 rounded-lg border ${
                        status.type === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        {status.type === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${
                            status.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {status.message}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
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
                                name="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.email
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                disabled={loading}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending Reset Link...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <EnvelopeIcon className="h-4 w-4" />
                                <span>Send Reset Link</span>
                            </div>
                        )}
                    </button>
                </form>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                            <p className="mb-1"><strong>Security Notice:</strong></p>
                            <ul className="space-y-1">
                                <li>• Reset links expire in 2 hours for security</li>
                                <li>• Check your spam folder if you don't see the email</li>
                                <li>• For security, we don't reveal if an email is registered</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Back to Login */}
                <div className="text-center">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>Back to Login</span>
                    </Link>
                </div>

                {/* Additional Help */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-500">Still need help?</p>
                        <div className="flex justify-center space-x-4 text-xs">
                            <Link 
                                to="/register" 
                                className="text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Create Account
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
                </div>

                {/* Features Preview */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-center text-xs text-gray-500 mb-3">Secure your Impact ID benefits:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <SparklesIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-gray-600">Your XP</p>
                        </div>
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <p className="text-gray-600">Achievements</p>
                        </div>
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <LockClosedIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-gray-600">Security</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}