import axios from 'axios';
import toast from 'react-hot-toast';
import { authEvents, AUTH_EVENT } from '../utils/authEvents';

// ================================
// 🌐 CORRECTED AXIOS CONFIGURATION
// ================================

// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';
const isBrowser = typeof window !== 'undefined';

// Derive a robust API base URL with fallback strategy:
// 1. Explicit VITE_API_BASE_URL env
// 2. Browser origin (when frontend served by same host) — no trailing slash
// 3. Development fallback http://localhost:8000
function computeApiBaseUrl() {
    const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
    if (envUrl) return envUrl.replace(/\/$/, '');
    if (isBrowser && window.location?.origin) return window.location.origin.replace(/\/$/, '');
    return 'http://localhost:8000';
}

export const getApiBaseUrl = () => API_BASE_URL; // external helper (service workers, etc.)

const API_BASE_URL = computeApiBaseUrl();
if (isDevelopment && !isTest) {
    console.log('[axios] Using API base URL:', API_BASE_URL);
}

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
        if (isDevelopment && !isTest) {
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
            
            if (isDevelopment && !isTest) {
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
        
        if (isDevelopment && !isTest) {
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
                authEvents.emit(AUTH_EVENT.TOKEN_REFRESH, { token: newToken });
                
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return apiClient(originalRequest);
                
            } catch (refreshError) {
                processQueue(refreshError, null);
                authEvents.emit(AUTH_EVENT.TOKEN_REFRESH_FAILED, { error: refreshError });
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
    // Emit session expired event (central logic in AuthContext will react & redirect)
    authEvents.emit(AUTH_EVENT.SESSION_EXPIRED, { reason: 'auth_failure' });

    // Present a single persistent toast (id ensures de-duplication)
    if (!error.config?.url?.includes('/api/auth/refresh')) {
        toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
    }
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
if (!isDevelopment && !isTest) {
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

let connectionAttempt = 0;
const maxConnectionAttempts = 5;

const testConnection = async () => {
    try {
        if (isDevelopment) {
            console.log('🔍 Testing API connection (attempt %d)...', connectionAttempt + 1);
            console.log('📍 Base URL:', API_BASE_URL);
        }

        const healthResponse = await apiClient.get('/health', { timeout: 4000 });
        if (isDevelopment) console.log('✅ Health check successful:', healthResponse.data);

        // Optional root info
        try {
            await apiClient.get('/', { timeout: 3000 });
        } catch {
            // ignore
        }
        connectionAttempt = 0; // reset after success
    } catch (error) {
        if (isDevelopment) {
            console.error('❌ API connection failed:', error?.message || error);
            console.log('📝 Troubleshooting (attempt %d):', connectionAttempt + 1);
            console.log('   1. Backend running?');
            console.log('   2. CORS / network ok?');
            console.log('   3. Check VITE_API_BASE_URL or proxy config.');
        }
        if (connectionAttempt < maxConnectionAttempts - 1) {
            connectionAttempt += 1;
            const delay = Math.min(1000 * 2 ** connectionAttempt, 15000);
            setTimeout(testConnection, delay);
        }
    }
};

// Kick off initial connection probe (non-blocking)
if (isBrowser && !isTest) {
    testConnection();
}