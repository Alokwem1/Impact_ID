import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh for better development experience
        fastRefresh: !isProduction,
        // Include .jsx files for Fast Refresh
        include: "**/*.jsx",
        // Babel options for production optimization
        babel: isProduction ? {
          plugins: [
            ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
          ]
        } : undefined,
      }),
      process.env.ANALYZE === 'true' && visualizer({
        filename: 'dist/bundle-analysis.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      })
    ],
    
    // ================================
    // 🔧 DEVELOPMENT SERVER CONFIG
    // ================================
    server: {
      port: 5173,
      host: true,
      open: false,
      cors: true,
      proxy: {
        // 🚨 CRITICAL FIX: Remove rewrite rule to preserve /api prefix
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          // REMOVED: rewrite rule that was breaking API calls
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('🔥 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('📡 Proxying:', req.method, req.url);
            });
          }
        },
        // Proxy WebSocket connections
        '/ws': {
          target: 'ws://localhost:8000',
          ws: true,
          changeOrigin: true,
          rewriteWsOrigin: true,
        },
      },
      // Watch additional files for changes
      watch: {
        usePolling: process.env.VITE_USE_POLLING === 'true',
        interval: 100,
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
      // Development middleware
      middlewareMode: false,
    },
    
    // ================================
    // 🔍 DEVELOPMENT OPTIMIZATIONS
    // ================================
    esbuild: {
      // Enable source maps in development
      sourcemap: isDevelopment,
      // Drop console statements in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Target modern browsers
      target: 'es2020',
      // Optimize for development speed
      minify: isProduction,
    },
    
    // ================================
    // 📁 PATH RESOLUTION
    // ================================
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@api': resolve(__dirname, 'src/api'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@admin': resolve(__dirname, 'src/admin'),
        '@auth': resolve(__dirname, 'src/auth'),
        '@tasks': resolve(__dirname, 'src/tasks'),
        '@user': resolve(__dirname, 'src/user'),
        '@features': resolve(__dirname, 'src/features'),
        '@badges': resolve(__dirname, 'src/badges'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    
    // ================================
    // 🎯 ENVIRONMENT VARIABLES
    // ================================
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      // Global constants for Impact ID
      __IMPACT_ID_API_VERSION__: JSON.stringify('v1'),
      __IMPACT_ID_BUILD__: JSON.stringify(mode),
    },
    
    // ================================
    // 🚀 BUILD OPTIMIZATIONS
    // ================================
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment ? true : 'hidden',
      minify: isProduction ? 'terser' : false,
      // Emit manifest for backend integration
      manifest: true,
      // Generate service worker friendly output
      ssrManifest: false,
      
      // ================================
      // 📦 ADVANCED CHUNKING STRATEGY
      // ================================
      rollupOptions: {
        // Optimize bundle size
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
        },
        
        output: {
          // Impact ID specific chunk splitting
          manualChunks: (id) => {
            // Vendor chunks for core dependencies
            if (id.includes('node_modules')) {
              // React ecosystem (critical for app)
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              
              // Router (loaded on every page)
              if (id.includes('react-router')) {
                return 'router-vendor';
              }
              
              // React Query (API management)
              if (id.includes('@tanstack/react-query')) {
                return 'query-vendor';
              }
              
              // HTTP client (API calls)
              if (id.includes('axios')) {
                return 'http-vendor';
              }
              
              // UI libraries (loaded frequently)
              if (id.includes('react-hot-toast') || id.includes('@heroicons') || 
                  id.includes('headlessui')) {
                return 'ui-vendor';
              }
              
              // Date/time libraries
              if (id.includes('date-fns') || id.includes('moment')) {
                return 'date-vendor';
              }
              
              // Other vendor libraries
              return 'vendor';
            }
            
            // Impact ID application chunks
            if (id.includes('/src/')) {
              // Admin functionality (lazy-loaded)
              if (id.includes('/admin/') || id.includes('Admin')) {
                return 'admin-chunk';
              }
              
              // Dashboard (main app entry)
              if (id.includes('Dashboard') || id.includes('/dashboard/')) {
                return 'dashboard-chunk';
              }
              
              // Authentication (critical path)
              if (id.includes('/auth/') || id.includes('Auth')) {
                return 'auth-chunk';
              }
              
              // Gamification features (badges, leaderboards)
              if (id.includes('/badges/') || id.includes('Badge') || 
                  id.includes('Leaderboard') || id.includes('Progress') || 
                  id.includes('Achievement')) {
                return 'gamification-chunk';
              }
              
              // Task management (core feature)
              if (id.includes('/tasks/') || id.includes('Task') || 
                  id.includes('Submission') || id.includes('Quiz')) {
                return 'tasks-chunk';
              }
              
              // User profile and settings
              if (id.includes('/user/') || id.includes('Profile')) {
                return 'user-chunk';
              }
              
              // Weaving/Impact features
              if (id.includes('/features/') || id.includes('Weaving') || 
                  id.includes('Loom')) {
                return 'features-chunk';
              }
              
              // Utilities and contexts (shared)
              if (id.includes('/utils/') || id.includes('/contexts/') || 
                  id.includes('/api/')) {
                return 'utils-chunk';
              }
            }
          },
          
          // Optimize file naming for caching
          chunkFileNames: (chunkInfo) => {
            return `js/[name]-[hash:8].js`;
          },
          entryFileNames: 'js/impact-id-[hash:8].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.fileName || '';
            const parts = name.split('.');
            const ext = parts.length > 1 ? parts.pop() : 'asset';

            // Organize assets by type
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
              return `images/[name]-[hash:8].${ext}`;
            }

            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return `fonts/[name]-[hash:8].${ext}`;
            }

            if (/\.css$/i.test(name)) {
              return `css/[name]-[hash:8].${ext}`;
            }

            return `assets/[name]-[hash:8].${ext}`;
          },
          
          // Ensure consistent chunk ordering
          exports: 'named',
          interop: 'auto',
        },
      },
      
      // ================================
      // 🔧 TERSER OPTIMIZATION
      // ================================
      terserOptions: {
        compress: {
          // Remove console logs in production
          drop_console: isProduction,
          drop_debugger: isProduction,
          // Remove specific console methods
          pure_funcs: isProduction ? [
            'console.log', 
            'console.info', 
            'console.debug',
            'console.trace'
          ] : [],
          // Advanced optimizations
          passes: 2,
          unsafe: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_symbols: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,
          // Keep function names for debugging
          keep_fnames: !isProduction,
        },
        mangle: {
          safari10: true,
          // Keep class names for React DevTools
          keep_classnames: !isProduction,
          keep_fnames: !isProduction,
        },
        format: {
          comments: false,
          // Keep license comments
          preserve_annotations: true,
        },
      },
      
      // ================================
      // 📊 BUILD ANALYSIS
      // ================================
      reportCompressedSize: isProduction,
      chunkSizeWarningLimit: 1000, // 1MB warning
      
      // ================================
      // 🎯 TARGET OPTIMIZATION
      // ================================
      target: [
        'es2020',
        'edge88',
        'firefox78', 
        'chrome87',
        'safari14'
      ],
      
      // ================================
      // 📱 CSS OPTIMIZATION
      // ================================
      cssCodeSplit: true,
      cssMinify: isProduction,
      
      // ================================
      // 🔧 WORKER OPTIMIZATION
      // ================================
      worker: {
        format: 'es',
        plugins: []
      },
    },
    
    // ================================
    // 🔄 DEPENDENCY OPTIMIZATION
    // ================================
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'react-hot-toast',
        '@heroicons/react/24/outline',
        '@heroicons/react/24/solid',
      ],
      exclude: [
        // Exclude large or problematic dependencies
        '@vite/client',
        '@vite/env',
      ],
      // Force optimization of these packages
      force: isDevelopment,
    },
    
    // ================================
    // 📋 PREVIEW SERVER CONFIG
    // ================================
    preview: {
      port: 4173,
      host: true,
      strictPort: true,
      cors: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'cross-origin',
        'Cross-Origin-Opener-Policy': 'cross-origin',
      },
    },

    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // ✅ ENHANCEMENT: Add better error handling
        configure: (proxy, options) => {
          proxy.on('error', (err, _req) => {
            console.log('🔥 Proxy error:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('📤 Proxying request:', req.method, req.url);
          });
        }
      }
    },

    // ================================
    // 🎨 CSS CONFIGURATION
    // ================================
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";',
        },
      },
      postcss: {
        plugins: [
          // PostCSS plugins loaded from postcss.config.js
        ],
      },
    },
    
    // ================================
    // 🔧 ADVANCED CONFIGURATION
    // ================================
    
    // Worker handling
    worker: {
      format: 'es',
    },
    
    // JSON handling
    json: {
      namedExports: true,
      stringify: false,
    },
    
    // App type configuration
    appType: 'spa',
    
    // Base URL configuration
    base: '/',
    
  // Public directory (ensure PWA assets like site.webmanifest & sw.js are copied)
  publicDir: 'public',
    
    // Cache directory
    cacheDir: 'node_modules/.vite',
    
    // Clear screen in development
    clearScreen: false,
    
    // Log level
    logLevel: isDevelopment ? 'info' : 'warn',
  }
});