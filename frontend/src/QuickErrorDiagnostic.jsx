console.log('🔍 Running Impact ID Diagnostics...');

// 1. Check environment variables
console.log('📋 Environment Variables:');
console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('WS_BASE_URL:', import.meta.env.VITE_WS_BASE_URL);

// 2. Check if running in development
console.log('🔧 Development Mode:', import.meta.env.DEV);

// 3. Check browser compatibility
console.log('🌐 Browser Support:');
console.log('WebSocket:', 'WebSocket' in window);
console.log('Local Storage:', 'localStorage' in window);
console.log('Service Worker:', 'serviceWorker' in navigator);

// 4. Check critical APIs
const checkAPIs = async () => {
    try {
        const response = await fetch('http://localhost:8000/health');
        console.log('✅ Backend health check:', response.status);
    } catch (error) {
        console.error('❌ Backend not responding:', error.message);
    }
};

checkAPIs();