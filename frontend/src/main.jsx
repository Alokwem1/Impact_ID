import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ================================
// 🔧 ENHANCED ERROR BOUNDARY FOR ROOT LEVEL
// ================================
class RootErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('🔥 Root Error Boundary caught an error:', error, errorInfo);
        }

        // In production, you would send this to an error reporting service
        if (!import.meta.env.DEV) {
            // Example: Sentry.captureException(error, { extra: errorInfo });
            console.error('Production error captured:', error.message);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
                        {/* Impact ID Logo/Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L3.09 8.26L4 21L12 22L20 21L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                            </svg>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        
                        <p className="text-gray-600 mb-6">
                            Impact ID encountered an unexpected error. Don't worry - your data is safe.
                        </p>
                        
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                🔄 Try Again
                            </button>
                            
                            <button
                                onClick={this.handleReload}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                🔃 Reload Page
                            </button>
                        </div>
                        
                        {/* Development Error Details */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                    🐛 Development Error Details
                                </summary>
                                <div className="text-xs font-mono">
                                    <div className="text-red-600 mb-2">
                                        <strong>Error:</strong> {this.state.error.message}
                                    </div>
                                    <div className="text-gray-600 mb-2">
                                        <strong>Stack:</strong>
                                        <pre className="whitespace-pre-wrap text-xs mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                                            {this.state.error.stack}
                                        </pre>
                                    </div>
                                    {this.state.errorInfo.componentStack && (
                                        <div className="text-gray-600">
                                            <strong>Component Stack:</strong>
                                            <pre className="whitespace-pre-wrap text-xs mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-4">
                            If this problem persists, please contact support with the error details.
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ================================
// 🚀 ENHANCED APPLICATION BOOTSTRAPPING
// ================================

// Enhanced initialization function
const initializeApp = async () => {
    // Set up global error handlers
    window.addEventListener('error', (event) => {
        console.error('🔥 Global error:', event.error);
        
        // Don't show error overlay for script loading errors in production
        if (!import.meta.env.DEV && event.error?.message?.includes('Loading chunk')) {
            window.location.reload();
        }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('🔥 Unhandled promise rejection:', event.reason);
        
        // Prevent the default browser behavior
        event.preventDefault();
    });

    // ================================
    // 🔍 PERFORMANCE MONITORING
    // ================================
    
    // Performance observer for Core Web Vitals (development only)
    if (import.meta.env.DEV && 'PerformanceObserver' in window) {
        try {
            // Measure Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('📊 LCP:', lastEntry.startTime.toFixed(2) + 'ms');
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Measure First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('📊 FID:', entry.processingStart - entry.startTime + 'ms');
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Measure Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        console.log('📊 CLS:', clsValue.toFixed(4));
                    }
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('Performance monitoring setup failed:', error);
        }
    }

    // ================================
    // 🌐 BACKEND CONNECTION VERIFICATION
    // ================================
    
    if (import.meta.env.DEV) {
        try {
            // Quick health check to verify backend is running
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/health`,
                { 
                    signal: controller.signal,
                    mode: 'cors'
                }
            );
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('✅ Backend connection verified');
            } else {
                console.warn('⚠️ Backend health check failed:', response.status);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⚠️ Backend connection timeout - is your backend running on port 8000?');
            } else {
                console.warn('⚠️ Backend connection failed:', error.message);
            }
            
            // Show a non-blocking warning in development
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fbbf24;
                color: #92400e;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                max-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px;">⚠️</span>
                    <span>Backend not responding. Check if it's running on port 8000.</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            requestAnimationFrame(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            });
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
    }

    // ================================
    // 📱 PWA SETUP
    // ================================
    
    // Register service worker in production
    if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered');
        } catch (error) {
            console.warn('⚠️ Service Worker registration failed:', error);
        }
    }

    // PWA install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        
        // Show custom install button (you can implement this in your UI)
        console.log('📱 PWA install prompt available');
        
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('pwaInstallAvailable', { detail: e }));
    });

    // ================================
    // 🎨 THEME INITIALIZATION
    // ================================
    
    // Set initial theme based on localStorage or system preference
    const savedTheme = localStorage.getItem('impactid-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    document.documentElement.classList.add(initialTheme);
    
    // Update meta theme-color
    const themeColor = initialTheme === 'dark' ? '#18181b' : '#2563eb';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
};

// ================================
// 🎯 ENHANCED ROOT RENDERING
// ================================

const renderApp = () => {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        throw new Error('Root element not found. Please ensure your HTML has a div with id="root".');
    }

    // Enhanced root element setup
    rootElement.setAttribute('data-app', 'impact-id');
    rootElement.setAttribute('data-version', import.meta.env.VITE_APP_VERSION || '1.0.0');
    
    const root = ReactDOM.createRoot(rootElement);

    // Render with enhanced error boundary
    root.render(
        <React.StrictMode>
            <RootErrorBoundary>
                <App />
            </RootErrorBoundary>
        </React.StrictMode>
    );

    // ================================
    // 🔍 DEVELOPMENT TOOLS
    // ================================
    
    if (import.meta.env.DEV) {
        // Add development helpers to window
        window.__IMPACT_ID_DEV__ = {
            version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
            wsUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws',
            
            // Helper functions for debugging
            testBackend: async () => {
                try {
                    const response = await fetch(`${window.__IMPACT_ID_DEV__.apiUrl}/health`);
                    console.log('Backend Status:', response.ok ? '✅ Online' : '❌ Offline');
                    return response.ok;
                } catch (error) {
                    console.log('Backend Status: ❌ Error -', error.message);
                    return false;
                }
            },
            
            clearCache: () => {
                localStorage.clear();
                sessionStorage.clear();
                console.log('🧹 Cache cleared');
            },
            
            toggleTheme: () => {
                const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.classList.remove(current);
                document.documentElement.classList.add(next);
                localStorage.setItem('impactid-theme', next);
                console.log(`🎨 Theme switched to ${next}`);
            },
            
            showInfo: () => {
                console.log(`
🌟 Impact ID Development Console
================================
Version: ${window.__IMPACT_ID_DEV__.version}
API URL: ${window.__IMPACT_ID_DEV__.apiUrl}
WebSocket: ${window.__IMPACT_ID_DEV__.wsUrl}

Available Commands:
- __IMPACT_ID_DEV__.testBackend() - Test backend connection
- __IMPACT_ID_DEV__.clearCache() - Clear all cache
- __IMPACT_ID_DEV__.toggleTheme() - Toggle dark/light theme
- __IMPACT_ID_DEV__.showInfo() - Show this help

Happy coding! 🚀
                `);
            }
        };
        
        // Auto-show info on first load
        console.log('🌟 Impact ID loaded in development mode');
        console.log('Type __IMPACT_ID_DEV__.showInfo() for development tools');
        
        // Add React DevTools detection
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            console.log('🔧 React DevTools detected');
        }
    }

    return root;
};

// ================================
// 🚀 APPLICATION STARTUP
// ================================

const startApp = async () => {
    try {
        // Show initial loading
        const loadingElement = document.getElementById('initial-loader');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }

        // Initialize application
        await initializeApp();

        // Hide loading and render app
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 300);
        }

        // Render the application
        const root = renderApp();

        // ================================
        // 📊 STARTUP PERFORMANCE LOGGING
        // ================================
        
        if (import.meta.env.DEV) {
            // Log startup performance
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log(`
🚀 Impact ID Startup Performance
================================
DOM Content Loaded: ${perfData.domContentLoadedEventEnd.toFixed(2)}ms
Page Load Complete: ${perfData.loadEventEnd.toFixed(2)}ms
Total Startup Time: ${(Date.now() - perfData.fetchStart).toFixed(2)}ms
                    `);
                }, 100);
            });
        }

        return root;
        
    } catch (error) {
        console.error('🔥 Failed to start Impact ID:', error);
        
        // Fallback error display
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                padding: 20px;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                    width: 100%;
                ">
                    <h1 style="
                        margin: 0 0 16px 0;
                        color: #dc2626;
                        font-size: 24px;
                        font-weight: 700;
                    ">⚠️ Startup Failed</h1>
                    
                    <p style="
                        margin: 0 0 24px 0;
                        color: #374151;
                        line-height: 1.5;
                    ">Impact ID failed to start. Please refresh the page or check the console for details.</p>
                    
                    <button 
                        onclick="window.location.reload()" 
                        style="
                            background: #dc2626;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        "
                        onmouseover="this.style.background='#b91c1c'"
                        onmouseout="this.style.background='#dc2626'"
                    >🔄 Reload Page</button>
                    
                    ${import.meta.env.DEV ? `
                        <details style="margin-top: 20px; text-align: left;">
                            <summary style="cursor: pointer; font-weight: 600; color: #6b7280;">
                                🐛 Error Details
                            </summary>
                            <pre style="
                                margin-top: 8px;
                                padding: 12px;
                                background: #f3f4f6;
                                border-radius: 4px;
                                font-size: 12px;
                                overflow: auto;
                                max-height: 200px;
                            ">${error.stack || error.message}</pre>
                        </details>
                    ` : ''}
                </div>
            </div>
        `;
    }
};

// Start the application
startApp();