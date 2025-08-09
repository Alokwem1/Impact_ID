import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    UserIcon,
    LockClosedIcon,
    SparklesIcon,
    WalletIcon,
    ArrowRightIcon,
    TrophyIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletLoading, setWalletLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    
    // ✅ FIXED: Use both login and walletLogin from AuthContext
    const { login, walletLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Enhanced URL parameter handling
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        
        // Success messages
        if (params.get('status') === 'success') {
            setSuccess('Registration successful! Please log in with your credentials.');
        }
        if (params.get('verified') === 'true') {
            setSuccess('Email verified successfully! You can now log in.');
        }
        if (params.get('reset') === 'true') {
            setSuccess('Password reset successfully! Please log in with your new password.');
        }
        if (params.get('logout') === 'true') {
            setSuccess('You have been logged out successfully.');
        }
        
        // Error messages
        if (params.get('error') === 'token_expired') {
            setErrors({ general: 'Your session has expired. Please log in again.' });
        }
        if (params.get('error') === 'unauthorized') {
            setErrors({ general: 'Please log in to access this page.' });
        }
    }, [location]);

    // Enhanced validation
    const validateForm = () => {
        const newErrors = {};

        if (!credentials.username.trim()) {
            newErrors.username = 'Username or email is required';
        }

        if (!credentials.password) {
            newErrors.password = 'Password is required';
        } else if (credentials.password.length < 1) {
            newErrors.password = 'Password cannot be empty';
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        
        // Clear field-specific errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Clear general errors
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
        
        setSuccess('');
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
        
        try {
            // ✅ FIXED: Use rememberMe parameter correctly
            await login(credentials.username, credentials.password, rememberMe);
            
            // Handle remember me functionality
            if (rememberMe) {
                localStorage.setItem('rememberLogin', 'true');
            } else {
                localStorage.removeItem('rememberLogin');
            }
            
            // Success is handled by AuthContext via navigation
            
        } catch (err) {
            // Enhanced error handling based on your #backend responses
            const detail = err.response?.data?.detail;
            
            if (detail) {
                if (detail.includes('Incorrect username or password')) {
                    setErrors({ 
                        general: 'Invalid username or password. Please check your credentials and try again.' 
                    });
                } else if (detail.includes('Account is suspended')) {
                    setErrors({ 
                        general: 'Your account has been suspended. Please contact support for assistance.' 
                    });
                } else if (detail.includes('Account is banned')) {
                    setErrors({ 
                        general: 'Your account has been banned. Please contact support for more information.' 
                    });
                } else if (detail.includes('temporarily unavailable')) {
                    setErrors({ 
                        general: 'Login service is temporarily unavailable. Please try again later.' 
                    });
                } else if (detail.includes('Email not verified')) {
                    setErrors({ 
                        general: 'Please verify your email address before logging in. Check your inbox for the verification link.' 
                    });
                } else {
                    setErrors({ general: detail });
                }
            } else {
                setErrors({ 
                    general: 'Login failed. Please check your internet connection and try again.' 
                });
            }
            
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ COMPLETELY FIXED: Wallet login with correct #backend integration
    const handleWalletLogin = async () => {
        if (typeof window.ethereum === 'undefined') {
            setErrors({ 
                general: 'MetaMask wallet is not installed. Please install MetaMask to connect your wallet.' 
            });
            return;
        }

        setWalletLoading(true);
        setErrors({});
        
        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                throw new Error('No wallet accounts found. Please unlock your MetaMask wallet.');
            }

            const address = accounts[0];

            // ✅ FIXED: Create verification message matching #backend expectations
            const timestamp = Date.now();
            const message = `Sign this message to log in to Impact ID.\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;

            // Request signature
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, address],
            });

            // ✅ FIXED: Use AuthContext walletLogin method instead of manual API call
            await walletLogin(address, signature, message);
            
            // Success message and navigation are handled by AuthContext

        } catch (err) {
            console.error('Wallet login error:', err);
            
            // Enhanced error handling for wallet-specific errors
            if (err.code === 4001) {
                setErrors({ 
                    general: 'Wallet connection was cancelled. Please try again and approve the connection.' 
                });
            } else if (err.code === -32602) {
                setErrors({ 
                    general: 'Invalid wallet request. Please make sure MetaMask is properly installed.' 
                });
            } else if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (detail.includes('not found') || detail.includes('not associated')) {
                    setErrors({ 
                        general: 'This wallet is not linked to any Impact ID account. Please register first or link your wallet in your profile settings.' 
                    });
                } else if (detail.includes('Invalid signature')) {
                    setErrors({ 
                        general: 'Wallet signature verification failed. Please try again.' 
                    });
                } else {
                    setErrors({ general: detail });
                }
            } else {
                setErrors({ 
                    general: err.message || 'Wallet login failed. Please try again or use username/password login.' 
                });
            }
        } finally {
            setWalletLoading(false);
        }
    };

    // Auto-fill username if remembered
    useEffect(() => {
        const rememberedLogin = localStorage.getItem('rememberLogin');
        if (rememberedLogin === 'true') {
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <SparklesIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">Log in to your Impact ID account</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800 text-sm">{success}</p>
                    </div>
                )}

                {/* Error Messages */}
                {errors.general && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800 text-sm">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username/Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username or Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username or email"
                                value={credentials.username}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.username 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                autoComplete="username"
                            />
                        </div>
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
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
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.password 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                                autoComplete="current-password"
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
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>
                        <Link 
                            to="/forgot-password" 
                            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading || walletLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Logging In...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <span>Log In</span>
                                <ArrowRightIcon className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Wallet Login Button */}
                <button
                    onClick={handleWalletLogin}
                    disabled={loading || walletLoading}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed space-x-3 transform hover:scale-105 active:scale-95"
                >
                    {walletLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Connecting Wallet...</span>
                        </div>
                    ) : (
                        <>
                            <WalletIcon className="h-5 w-5" />
                            <span>Connect MetaMask Wallet</span>
                        </>
                    )}
                </button>

                {/* ✅ ENHANCED: More informative wallet info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                            <p className="font-medium mb-1">Web3 Login with MetaMask</p>
                            <p>
                                Connect your MetaMask wallet to log in securely without a password. 
                                Your wallet must be linked to your Impact ID account first.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Create Your Impact ID
                        </Link>
                    </p>
                </div>

                {/* ✅ COMPLETED: Features Preview */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-center text-xs text-gray-500 mb-3">Access your Impact ID benefits:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <SparklesIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-gray-600">Earn XP</p>
                        </div>
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <TrophyIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <p className="text-gray-600">Win Badges</p>
                        </div>
                        <div className="text-xs">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                <StarIcon className="h-4 w-4 text-yellow-600" />
                            </div>
                            <p className="text-gray-600">Track Impact</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}