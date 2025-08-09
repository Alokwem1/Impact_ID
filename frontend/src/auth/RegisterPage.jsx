import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../api/axios';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    InformationCircleIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '' // ✅ ADDED: Missing full name field
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    // Show success message if redirected from email verification
    const verificationSuccess = searchParams.get('verified') === 'true';

    // Enhanced validation matching your backend requirements
    const validateForm = () => {
        const newErrors = {};

        // Username validation (matches your backend UserCreate schema)
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 50) {
            newErrors.username = 'Username must be less than 50 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (formData.email.length > 255) {
            newErrors.email = 'Email must be less than 255 characters';
        }

        // ✅ ADDED: Full name validation
        if (formData.fullName.trim() && formData.fullName.length > 100) {
            newErrors.fullName = 'Full name must be less than 100 characters';
        }

        // Enhanced password validation matching your backend
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

    // ✅ FIXED: Real API calls for availability checks
    const checkUsernameAvailability = async () => {
        if (!formData.username || formData.username.length < 3) return;
        
        try {
            setCheckingAvailability(true);
            
            // ✅ FIXED: Real API call to your backend
            const response = await apiClient.get(`/api/auth/check-username?username=${encodeURIComponent(formData.username.toLowerCase())}`);
            setUsernameAvailable(response.data.available);
            
        } catch (error) {
            console.error('Username availability check failed:', error);
            setUsernameAvailable(null);
            
            // Handle API errors gracefully
            if (error.response?.status !== 404) {
                console.warn('Username check API unavailable, proceeding without validation');
            }
        } finally {
            setCheckingAvailability(false);
        }
    };

    const checkEmailAvailability = async () => {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return;
        
        try {
            setCheckingAvailability(true);
            
            // ✅ FIXED: Real API call to your backend
            const response = await apiClient.get(`/api/auth/check-email?email=${encodeURIComponent(formData.email.toLowerCase())}`);
            setEmailAvailable(response.data.available);
            
        } catch (error) {
            console.error('Email availability check failed:', error);
            setEmailAvailable(null);
            
            // Handle API errors gracefully
            if (error.response?.status !== 404) {
                console.warn('Email check API unavailable, proceeding without validation');
            }
        } finally {
            setCheckingAvailability(false);
        }
    };

    // Debounced availability check
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.username.length >= 3) {
                checkUsernameAvailability();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                checkEmailAvailability();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear specific field error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Reset availability checks when input changes
        if (name === 'username') {
            setUsernameAvailable(null);
        }
        if (name === 'email') {
            setEmailAvailable(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Check availability before submitting (if checks were performed)
        if (usernameAvailable === false) {
            setErrors({ username: 'Username is already taken' });
            return;
        }

        if (emailAvailable === false) {
            setErrors({ email: 'Email is already registered' });
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            
            // ✅ FIXED: Call register function with all required parameters
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.fullName || '' // Include full name (optional)
            );
            
            // Success message and navigation are handled by AuthContext
            
        } catch (err) {
            // ✅ ENHANCED: Better error handling based on your backend responses
            console.error('Registration error:', err);
            
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                
                // Handle specific backend validation errors
                if (detail.includes('Username already registered') || detail.includes('username')) {
                    setErrors({ username: detail });
                } else if (detail.includes('Email already registered') || detail.includes('email')) {
                    setErrors({ email: detail });
                } else if (detail.includes('Password')) {
                    setErrors({ password: detail });
                } else {
                    // Generic error
                    setErrors({ general: detail });
                    toast.error(detail);
                }
            } else if (err.response?.data?.message) {
                // Alternative error format
                setErrors({ general: err.response.data.message });
                toast.error(err.response.data.message);
            } else {
                // Network or unknown errors
                const errorMessage = 'Registration failed. Please check your connection and try again.';
                setErrors({ general: errorMessage });
                toast.error(errorMessage);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                {/* Success message for email verification */}
                {verificationSuccess && (
                    <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 text-sm">Email verified successfully! Please create your account.</p>
                    </div>
                )}

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <SparklesIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Create Your Impact ID</h2>
                    <p className="mt-2 text-sm text-gray-600">Join the community and start building your reputation</p>
                </div>

                {/* ✅ ENHANCED: Show general errors */}
                {errors.general && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800 text-sm">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ✅ ADDED: Full Name Field (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.fullName 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                autoComplete="name"
                            />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Username Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Choose a unique username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.username 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : usernameAvailable === true
                                        ? 'border-green-300 focus:ring-green-500'
                                        : usernameAvailable === false
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                autoComplete="username"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {checkingAvailability ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : usernameAvailable === true ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : usernameAvailable === false ? (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                ) : null}
                            </div>
                        </div>
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        {usernameAvailable === true && (
                            <p className="text-green-600 text-xs mt-1">Username is available!</p>
                        )}
                        {usernameAvailable === false && !errors.username && (
                            <p className="text-red-500 text-xs mt-1">Username is already taken</p>
                        )}
                    </div>

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
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.email 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : emailAvailable === true
                                        ? 'border-green-300 focus:ring-green-500'
                                        : emailAvailable === false
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                autoComplete="email"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {checkingAvailability ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : emailAvailable === true ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : emailAvailable === false ? (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                ) : null}
                            </div>
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        {emailAvailable === false && !errors.email && (
                            <p className="text-red-500 text-xs mt-1">Email is already registered</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.password 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        
                        {/* Enhanced Password Strength Indicator */}
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
                                    <div className="flex space-x-1">
                                        {Object.entries(passwordStrength.criteria).map(([key, met]) => (
                                            <div
                                                key={key}
                                                className={`w-2 h-2 rounded-full ${met ? 'bg-green-500' : 'bg-gray-300'}`}
                                                title={key}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Requirements:</p>
                                    <ul className="text-xs space-y-1 mt-1">
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
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your password"
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
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <p className="text-green-600 text-xs mt-1">Passwords match!</p>
                        )}
                    </div>

                    {/* Terms and Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex">
                            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800">
                                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                                Your data will be securely stored and used only to provide our services.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || usernameAvailable === false || emailAvailable === false}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Creating Account...</span>
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Log In
                        </Link>
                    </p>
                </div>

                {/* Features Preview */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-center text-xs text-gray-500 mb-3">What you'll get with Impact ID:</p>
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
                                <UserIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-gray-600">Build Reputation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}