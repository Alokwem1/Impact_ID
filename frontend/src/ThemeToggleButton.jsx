import { useState } from "react";
import { useTheme } from "./ThemeContext";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function ThemeToggleButton({
  showDropdown = false,
  size = "md",
}) {
  const {
    theme,
    isSystemTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    useSystemTheme,
  } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sizeClasses = {
    sm: "p-1.5 h-8 w-8",
    md: "p-2 h-10 w-10",
    lg: "p-3 h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (showDropdown) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${sizeClasses[size]} rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center space-x-1`}
          aria-label="Theme options"
        >
          {theme === "dark" ? (
            <MoonIcon className={iconSizes[size]} />
          ) : (
            <SunIcon className={iconSizes[size]} />
          )}
          {showDropdown && <ChevronDownIcon className="h-3 w-3" />}
        </button>

        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    setLightTheme();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                    theme === "light" && !isSystemTheme
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <SunIcon className="h-4 w-4" />
                  <span>Light</span>
                </button>

                <button
                  onClick={() => {
                    setDarkTheme();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                    theme === "dark" && !isSystemTheme
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <MoonIcon className="h-4 w-4" />
                  <span>Dark</span>
                </button>

                <button
                  onClick={() => {
                    useSystemTheme();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                    isSystemTheme
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <ComputerDesktopIcon className="h-4 w-4" />
                  <span>System</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Simple toggle button
  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center group`}
      aria-label={
        theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
      }
    >
      <div className="relative">
        {theme === "dark" ? (
          <MoonIcon
            className={`${iconSizes[size]} transform transition-transform duration-200 group-hover:scale-110`}
          />
        ) : (
          <SunIcon
            className={`${iconSizes[size]} transform transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12`}
          />
        )}
      </div>
    </button>
  );
}
