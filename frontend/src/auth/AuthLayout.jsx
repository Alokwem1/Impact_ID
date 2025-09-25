import React from "react";

// Reusable authentication layout wrapper
// Provides consistent container, theming, spacing, and heading area
export default function AuthLayout({
  icon,
  title,
  subtitle,
  children,
  footer,
  variant = "default",
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center px-4 py-10">
      <main
        className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-7 space-y-5 transition-colors"
        aria-labelledby="auth-heading"
      >
        <div className="text-center space-y-2">
          <div
            className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md"
            aria-hidden="true"
          >
            {icon}
          </div>
          <h1
            id="auth-heading"
            className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children}
        {footer && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            {footer}
          </div>
        )}
      </main>
    </div>
  );
}
