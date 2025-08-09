import axios from 'axios';
import toast from 'react-hot-toast';

// ================================
// 🌐 CORRECTED AXIOS CONFIGURATION
// ================================

// Environment configuration
const isDevelopment = import.meta.env.DEV;
// ✅ FIXED: Removed /api from base URL since backend includes it in routes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create enhanced Axios instance with comprehensive configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL, // Now correctly points to http://127.0.0.1:8000
    timeout: isDevelopment ? 30000 : 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    // Enhanced retry configuration
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
        return axios.isNetworkError(error) || 
               (error.response && [408, 429, 500, 502, 503, 504].includes(error.response.status));
    }
});

// ================================
// 🔐 TOKEN MANAGEMENT UTILITIES
// ================================

const getStoredToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

const clearStoredToken = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
};

const storeToken = (token, rememberMe = false) => {
    if (rememberMe) {
        localStorage.setItem('accessToken', token);
        sessionStorage.removeItem('accessToken');
    } else {
        sessionStorage.setItem('accessToken', token);
        localStorage.removeItem('accessToken');
    }
};

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    
    failedQueue = [];
};

// ================================
// 📤 REQUEST INTERCEPTOR
// ================================

apiClient.interceptors.request.use(
    (config) => {
        // Add authorization token
        const token = getStoredToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        // Add CSRF protection for state-changing operations
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            config.headers['X-CSRF-Token'] = 'impact-id-csrf';
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = generateRequestId();
        
        // Log request in development
        if (isDevelopment) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
                headers: config.headers,
                data: config.data,
                params: config.params
            });
        }
        
        return config;
    },
    (error) => {
        if (isDevelopment) {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// ================================
// 📥 ENHANCED RESPONSE INTERCEPTOR
// ================================

apiClient.interceptors.response.use(
    (response) => {
        // Calculate request duration
        if (response.config.metadata) {
            const duration = new Date() - response.config.metadata.startTime;
            response.duration = duration;
            
            if (isDevelopment) {
                console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
                    status: response.status,
                    data: response.data
                });
            }
        }
        
        // Handle success messages from backend
        if (response.data?.message && response.status >= 200 && response.status < 300) {
            // Don't show automatic toasts for GET requests to avoid spam
            if (response.config.method !== 'get' && !response.config.suppressSuccessToast) {
                toast.success(response.data.message);
            }
        }
        
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (isDevelopment) {
            console.error('❌ API Error:', {
                url: originalRequest?.url,
                method: originalRequest?.method,
                status: error.response?.status,
                data: error.response?.data,
                fullUrl: `${originalRequest?.baseURL}${originalRequest?.url}`
            });
        }
        
        // ================================
        // 🔄 TOKEN REFRESH LOGIC (CORRECTED)
        // ================================
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                // ✅ FIXED: Correct refresh endpoint path
                const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
                    headers: {
                        'Authorization': `Bearer ${getStoredToken()}`
                    }
                });
                
                const newToken = refreshResponse.data.access_token;
                const rememberMe = localStorage.getItem('accessToken') !== null;
                
                storeToken(newToken, rememberMe);
                processQueue(null, newToken);
                
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return apiClient(originalRequest);
                
            } catch (refreshError) {
                processQueue(refreshError, null);
                await handleAuthenticationFailure(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // ================================
        // 🔥 ENHANCED ERROR HANDLING
        // ================================
        
        if (error.response) {
            handleServerError(error);
        } else if (error.request) {
            handleNetworkError(error);
        } else {
            handleUnknownError(error);
        }
        
        return Promise.reject(error);
    }
);

// ================================
// 🚨 ENHANCED ERROR HANDLERS
// ================================

const handleServerError = (error) => {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
        case 400:
            if (data?.detail) {
                toast.error(`Validation Error: ${data.detail}`);
            } else {
                toast.error('Invalid request. Please check your input.');
            }
            break;
            
        case 401:
            // Handled by token refresh logic
            break;
            
        case 403:
            toast.error('Access denied. You don\'t have permission for this action.');
            break;
            
        case 404:
            if (!error.config.suppressNotFoundToast) {
                toast.error('The requested resource was not found.');
            }
            break;
            
        case 409:
            toast.error(data?.detail || 'Conflict: Resource already exists.');
            break;
            
        case 422:
            // Handle FastAPI validation errors
            if (data?.detail) {
                if (Array.isArray(data.detail)) {
                    const errors = data.detail.map(err => 
                        `${err.loc?.join('.')}: ${err.msg}`
                    ).join(', ');
                    toast.error(`Validation Error: ${errors}`);
                } else {
                    toast.error(`Validation Error: ${data.detail}`);
                }
            }
            break;
            
        case 429:
            toast.error('Too many requests. Please try again later.');
            break;
            
        case 500:
            toast.error('Server error. Please try again later.');
            break;
            
        case 502:
        case 503:
        case 504:
            toast.error('Service temporarily unavailable. Please try again.');
            break;
            
        default:
            if (data?.detail) {
                toast.error(data.detail);
            } else {
                toast.error(`Request failed with status ${status}`);
            }
    }
};

const handleNetworkError = (error) => {
    if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please check your connection.');
    } else {
        toast.error('Network error. Please check your internet connection.');
    }
};

const handleUnknownError = (error) => {
    console.error('Unknown error:', error);
    toast.error('An unexpected error occurred. Please try again.');
};

const handleAuthenticationFailure = async (error) => {
    clearStoredToken();
    
    if (!error.config?.url?.includes('/api/auth/refresh')) {
        toast.error('Your session has expired. Please log in again.');
    }
    
    setTimeout(() => {
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/'].includes(currentPath)) {
            window.location.href = '/login';
        }
    }, 1000);
};

// ================================
// 🔧 UTILITY FUNCTIONS
// ================================

const generateRequestId = () => {
    return 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// ================================
// 🎯 ENHANCED API CLIENT METHODS
// ================================

// Override default methods to ensure consistent behavior
const originalRequest = apiClient.request;

apiClient.request = async (config) => {
    try {
        return await originalRequest.call(apiClient, config);
    } catch (error) {
        if (config.retries && config.retryCondition && config.retryCondition(error)) {
            await new Promise(resolve => 
                setTimeout(resolve, config.retryDelay || 1000)
            );
            return apiClient.request({ ...config, retries: config.retries - 1 });
        }
        throw error;
    }
};

// Specialized methods for common Impact ID use cases
apiClient.upload = async (url, file, onUploadProgress, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
        ...config
    });
};

apiClient.download = async (url, filename, config = {}) => {
    const response = await apiClient.get(url, {
        responseType: 'blob',
        ...config
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    return response;
};

// ================================
// 🔍 ENHANCED HEALTH CHECK
// ================================

apiClient.healthCheck = async () => {
    try {
        // ✅ FIXED: Correct health endpoint
        const response = await apiClient.get('/health', { 
            suppressNotFoundToast: true,
            timeout: 5000 
        });
        return { healthy: true, data: response.data };
    } catch (error) {
        return { healthy: false, error: error.message };
    }
};

// Connection monitoring with corrected endpoints
let connectionCheckInterval;

const startConnectionMonitoring = () => {
    if (connectionCheckInterval) return;
    
    connectionCheckInterval = setInterval(async () => {
        const health = await apiClient.healthCheck();
        if (!health.healthy) {
            toast.error('Connection to server lost. Retrying...', { id: 'connection-lost' });
        } else {
            toast.dismiss('connection-lost');
        }
    }, 30000);
};

const stopConnectionMonitoring = () => {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
    }
};

// Start monitoring in production
if (!isDevelopment) {
    startConnectionMonitoring();
}

// ================================
// 📤 EXPORTS
// ================================

export {
    getStoredToken,
    clearStoredToken,
    storeToken,
    startConnectionMonitoring,
    stopConnectionMonitoring
};

export default apiClient;

// ================================
// 🔍 ENHANCED CONNECTION TEST
// ================================

const testConnection = async () => {
    try {
        console.log('🔍 Testing API connection...');
        console.log('📍 Base URL:', API_BASE_URL);
        
        // Test health endpoint
        const healthResponse = await apiClient.get('/health');
        console.log('✅ Health check successful:', healthResponse.data);
        
        // Test API info endpoint if available
        try {
            const infoResponse = await apiClient.get('/');
            console.log('✅ API info successful:', infoResponse.data);
        } catch (infoError) {
            console.log('ℹ️ API info endpoint not available (normal in some setups)');
        }
        
    } catch (error) {
        console.error('❌ API connection failed:', error);
        console.log('📝 Troubleshooting:');
        console.log('   1. Make sure your backend is running on port 8000');
        console.log('   2. Check if CORS is properly configured');
        console.log('   3. Verify the backend health endpoint: http://localhost:8000/health');
        console.log('   4. Check your .env file for VITE_API_BASE_URL');
    }
};

// Test connection on load
testConnection();