import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production";
  const isDevelopment = mode === "development";

  return {
    plugins: [
      react({
        fastRefresh: !isProduction,
        include: "**/*.jsx",
        babel: isProduction
          ? {
              plugins: [["babel-plugin-react-remove-properties", { properties: ["data-testid"] }]],
            }
          : undefined,
      }),
      process.env.ANALYZE === "true" &&
        visualizer({
          filename: "dist/bundle-analysis.html",
          template: "treemap",
          gzipSize: true,
          brotliSize: true,
        }),
    ],

    server: {
      port: 5173,
      host: true,
      open: false,
      cors: true,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (err) => console.log("🔥 Proxy error:", err));
            proxy.on("proxyReq", (_proxyReq, req) => console.log("📡 Proxying:", req.method, req.url));
          },
        },
        "/ws": {
          target: "ws://localhost:8000",
          ws: true,
          changeOrigin: true,
          rewriteWsOrigin: true,
        },
      },
      watch: {
        usePolling: process.env.VITE_USE_POLLING === "true",
        interval: 100,
        ignored: ["**/node_modules/**", "**/.git/**"],
      },
      middlewareMode: false,
    },

    esbuild: {
      sourcemap: isDevelopment,
      drop: isProduction ? ["console", "debugger"] : [],
      target: "es2020",
      minify: isProduction,
    },

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@components": resolve(__dirname, "src/components"),
        "@utils": resolve(__dirname, "src/utils"),
        "@pages": resolve(__dirname, "src/pages"),
        "@hooks": resolve(__dirname, "src/hooks"),
        "@assets": resolve(__dirname, "src/assets"),
        "@api": resolve(__dirname, "src/api"),
        "@contexts": resolve(__dirname, "src/contexts"),
        "@styles": resolve(__dirname, "src/styles"),
        "@admin": resolve(__dirname, "src/admin"),
        "@auth": resolve(__dirname, "src/auth"),
        "@tasks": resolve(__dirname, "src/tasks"),
        "@user": resolve(__dirname, "src/user"),
        "@features": resolve(__dirname, "src/features"),
        "@badges": resolve(__dirname, "src/badges"),

        // Force a single React/ReactDOM identity even with symlinked deps
        react: resolve(__dirname, "node_modules/react"),
        "react-dom": resolve(__dirname, "node_modules/react-dom"),
        "react-dom/client": resolve(__dirname, "node_modules/react-dom/client"),
        "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime.js"),
        "react/jsx-dev-runtime": resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  dedupe: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      __IMPACT_ID_API_VERSION__: JSON.stringify("v1"),
      __IMPACT_ID_BUILD__: JSON.stringify(mode),
    },

    // ================================
    // 🚀 BUILD OPTIMIZATIONS
    // ================================
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: isDevelopment ? true : "hidden",
      minify: isProduction ? "terser" : false,
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
          // Minimal manual chunking (incremental restore) – expand later if stable
          manualChunks: isProduction ? {
            react: ["react", "react-dom"],
            vendor: [
              "react-router-dom",
              "@tanstack/react-query",
              "axios",
              "react-hot-toast"
            ]
          } : undefined,
          chunkFileNames: () => {
            return `js/[name]-[hash:8].js`;
          },
          entryFileNames: "js/impact-id-[hash:8].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.fileName || "";
            const parts = name.split(".");
            const ext = parts.length > 1 ? parts.pop() : "asset";

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
          exports: "named",
          interop: "auto",
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
          pure_funcs: isProduction
            ? ["console.log", "console.info", "console.debug", "console.trace"]
            : [],
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
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],

      // ================================
      // 📱 CSS OPTIMIZATION
      // ================================
      cssCodeSplit: true,
      cssMinify: isProduction,

      // ================================
      // 🔧 WORKER OPTIMIZATION
      // ================================
      worker: {
        format: "es",
        plugins: [],
      },
    },

    // ================================
    // 🔄 DEPENDENCY OPTIMIZATION
    // ================================
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-router-dom",
        "@tanstack/react-query",
        "axios",
        "react-hot-toast",
        "@heroicons/react/24/outline",
        "@heroicons/react/24/solid",
      ],
      exclude: [
        // Exclude large or problematic dependencies
        "@vite/client",
        "@vite/env",
      ],
      // Force optimization of these packages
      force: isDevelopment,
      // Ensure single instance of React to prevent dispatcher null errors
      dedupe: ["react", "react-dom"],
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
        "Cross-Origin-Embedder-Policy": "cross-origin",
        "Cross-Origin-Opener-Policy": "cross-origin",
      },
    },

    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // ✅ ENHANCEMENT: Add better error handling
        configure: (proxy, options) => {
          proxy.on("error", (err, _req) => {
            console.log("🔥 Proxy error:", err);
          });
          proxy.on("proxyReq", (_proxyReq, req, _res) => {
            console.log("📤 Proxying request:", req.method, req.url);
          });
        },
      },
    },

    // ================================
    // 🎨 CSS CONFIGURATION
    // ================================
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: "camelCase",
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
      format: "es",
    },

    // JSON handling
    json: {
      namedExports: true,
      stringify: false,
    },

    // App type configuration
    appType: "spa",

    // Base URL configuration
    base: "/",

    // Public directory (ensure PWA assets like site.webmanifest & sw.js are copied)
    publicDir: "public",

    // Cache directory
    cacheDir: "node_modules/.vite",

    // Clear screen in development
    clearScreen: false,

    // Log level
    logLevel: isDevelopment ? "info" : "warn",
  };
});
