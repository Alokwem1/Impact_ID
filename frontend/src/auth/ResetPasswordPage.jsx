import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    LockClosedIcon,
    SparklesIcon,
    ArrowLeftIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValidated, setTokenValidated] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);

    // Validate token on component mount
    useEffect(() => {
        if (token) {
            validateResetToken();
        } else {
            setValidatingToken(false);
        }
    }, [token]);

    // Redirect to login after successful password reset
    useEffect(() => {
        if (status.type === 'success') {
            const timer = setTimeout(() => {
                navigate('/login?reset=true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    const validateResetToken = async () => {
        try {
            setValidatingToken(true);
            // Validate token with backend
            await apiClient.post('/auth/validate-reset-token', { token });
            setTokenValidated(true);
        } catch (err) {
            console.error('Token validation error:', err);
            const detail = err.response?.data?.detail;
            
            if (detail && detail.includes('expired')) {
                setStatus({
                    message: 'This password reset link has expired. Please request a new one.',
                    type: 'error'
                });
            } else {
                setStatus({
                    message: 'Invalid or expired reset link. Please request a new one.',
                    type: 'error'
                });
            }
        } finally {
            setValidatingToken(false);
        }
    };

    // Enhanced password validation matching your backend requirements
    const validateForm = () => {
        const newErrors = {};

        // Password validation (matches your backend security requirements)
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (formData.password.length > 128) {
            newErrors.password = 'Password must be less than 128 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear field-specific errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Clear status messages when user starts typing
        if (status.message) {
            setStatus({ message: '', type: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setStatus({ message: '', type: '' });

        try {
            // Use the correct backend endpoint
            await apiClient.post('/auth/reset-password', {
                token,
                new_password: formData.password,
            });
            
            setStatus({ 
                message: 'Password reset successful! Redirecting to login...', 
                type: 'success' 
            });
            
            // Clear form
            setFormData({ password: '', confirmPassword: '' });
            
            // Show toast notification
            toast.success('Password reset successfully! You can now log in.');
            
        } catch (err) {
            console.error('Password reset error:', err);
            
            const detail = err.response?.data?.detail;
            
            if (detail) {
                if (detail.includes('expired')) {
                    setStatus({
                        message: 'This reset link has expired. Please request a new one.',
                        type: 'error'
                    });
                } else if (detail.includes('invalid')) {
                    setStatus({
                        message: 'Invalid reset token. Please request a new password reset.',
                        type: 'error'
                    });
                } else if (detail.includes('used')) {
                    setStatus({
                        message: 'This reset link has already been used. Please request a new one.',
                        type: 'error'
                    });
                } else {
                    setStatus({ message: detail, type: 'error' });
                }
            } else {
                setStatus({
                    message: 'Failed to reset password. Please try again or request a new reset link.',
                    type: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        let criteria = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[^a-zA-Z\d]/.test(password)
        };

        strength = Object.values(criteria).filter(Boolean).length;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
        
        return { 
            strength, 
            label: labels[strength - 1] || '', 
            color: colors[strength - 1] || '',
            criteria
        };
    };

    const passwordStrength = getPasswordStrength();

    // Loading state while validating token
    if (validatingToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Validating Reset Link</h2>
                    <p className="mt-2 text-sm text-gray-600">Please wait while we verify your reset token...</p>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!token || (status.type === 'error' && !tokenValidated)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600">Invalid Reset Link</h2>
                        <p className="mt-2 text-gray-600">
                            {status.message || 'This password reset link is invalid or has expired.'}
                        </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex">
                            <InformationCircleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-red-800">
                                <p className="mb-1"><strong>Possible reasons:</strong></p>
                                <ul className="space-y-1">
                                    <li>• The link has expired (links expire after 2 hours)</li>
                                    <li>• The link has already been used</li>
                                    <li>• The link was copied incorrectly</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                        <Link 
                            to="/forgot-password" 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out text-center transform hover:scale-105"
                        >
                            Request New Reset Link
                        </Link>
                        <Link 
                            to="/login" 
                            className="inline-flex items-center justify-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheckIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Reset Your Password</h2>
                    <p className="mt-2 text-sm text-gray-600">Choose a new, strong password for your Impact ID account</p>
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
                    {/* New Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your new password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.password
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                disabled={loading || status.type === 'success'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                disabled={loading || status.type === 'success'}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-3">
                                <div className="flex space-x-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 w-full rounded ${
                                                level <= passwordStrength.strength 
                                                    ? passwordStrength.color 
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-600">
                                        Strength: <span className="font-medium">{passwordStrength.label}</span>
                                    </p>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    <ul className="space-y-1">
                                        <li className={passwordStrength.criteria.length ? 'text-green-600' : 'text-gray-500'}>
                                            ✓ At least 8 characters
                                        </li>
                                        <li className={passwordStrength.criteria.uppercase ? 'text-green-600' : 'text-gray-500'}>
                                            ✓ One uppercase letter
                                        </li>
                                        <li className={passwordStrength.criteria.lowercase ? 'text-green-600' : 'text-gray-500'}>
                                            ✓ One lowercase letter
                                        </li>
                                        <li className={passwordStrength.criteria.number ? 'text-green-600' : 'text-gray-500'}>
                                            ✓ One number
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.confirmPassword
                                        ? 'border-red-300 focus:ring-red-500'
                                        : formData.confirmPassword && formData.password === formData.confirmPassword
                                        ? 'border-green-300 focus:ring-green-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                disabled={loading || status.type === 'success'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                disabled={loading || status.type === 'success'}
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <p className="text-green-600 text-xs mt-1">Passwords match!</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || status.type === 'success'}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Resetting Password...</span>
                            </div>
                        ) : status.type === 'success' ? (
                            <div className="flex items-center justify-center space-x-2">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Password Reset Successfully!</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <ShieldCheckIcon className="h-4 w-4" />
                                <span>Reset Password</span>
                            </div>
                        )}
                    </button>
                </form>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                            <p className="mb-1"><strong>Security Tips:</strong></p>
                            <ul className="space-y-1">
                                <li>• Use a unique password you haven't used elsewhere</li>
                                <li>• Consider using a password manager</li>
                                <li>• This reset link will expire after use</li>
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
                                <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-gray-600">Security</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}