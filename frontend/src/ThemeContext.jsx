import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const THEME_KEY = "impactid-theme";
const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            return savedTheme;
        }
        
        // Fall back to system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    const [isSystemTheme, setIsSystemTheme] = useState(() => {
        return !localStorage.getItem(THEME_KEY);
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        
        // Apply current theme
        root.classList.add(theme);
        
        // Save to localStorage if not using system preference
        if (!isSystemTheme) {
            localStorage.setItem(THEME_KEY, theme);
        }

        // Update meta theme-color for mobile browsers
        const themeColorMeta = document.querySelector('meta[name="theme-color"]') || 
                               document.createElement('meta');
        
        if (!themeColorMeta.parentNode) {
            themeColorMeta.setAttribute('name', 'theme-color');
            document.head.appendChild(themeColorMeta);
        }
        
        // Impact ID brand colors for theme-color
        const themeColors = {
            light: '#2563eb', // Impact ID blue
            dark: '#18181b'   // Dark gray
        };
        
        themeColorMeta.setAttribute('content', themeColors[theme]);

        // Update Safari status bar style
        let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!statusBarMeta) {
            statusBarMeta = document.createElement('meta');
            statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
            document.head.appendChild(statusBarMeta);
        }
        statusBarMeta.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');

    }, [theme, isSystemTheme]);

    // Listen for system theme changes when using system preference
    useEffect(() => {
        if (!isSystemTheme) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        
        const handleSystemThemeChange = (e) => {
            setTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [isSystemTheme]);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === "light" ? "dark" : "light";
            setIsSystemTheme(false); // User manually toggled, so stop following system
            return newTheme;
        });
    };

    const setLightTheme = () => {
        setTheme("light");
        setIsSystemTheme(false);
    };

    const setDarkTheme = () => {
        setTheme("dark");
        setIsSystemTheme(false);
    };

    const useSystemTheme = () => {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(systemTheme);
        setIsSystemTheme(true);
        localStorage.removeItem(THEME_KEY); // Remove saved preference
    };

    const value = useMemo(() => ({
        theme,
        isSystemTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        useSystemTheme,
        // Theme-aware color utilities
        colors: {
            primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
            background: theme === 'dark' ? '#0f172a' : '#ffffff',
            surface: theme === 'dark' ? '#1e293b' : '#f8fafc',
            text: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            muted: theme === 'dark' ? '#64748b' : '#6b7280'
        }
    }), [theme, isSystemTheme, toggleTheme, setLightTheme, setDarkTheme, useSystemTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// PropTypes for ThemeProvider
ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Custom hooks for specific theme needs
export const useThemeColors = () => {
    const { theme } = useTheme();
    
    return {
        primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
        secondary: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
        success: theme === 'dark' ? '#10b981' : '#059669',
        warning: theme === 'dark' ? '#f59e0b' : '#d97706',
        error: theme === 'dark' ? '#ef4444' : '#dc2626',
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        surface: theme === 'dark' ? '#1e293b' : '#f8fafc',
        border: theme === 'dark' ? '#374151' : '#e5e7eb',
        text: {
            primary: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            secondary: theme === 'dark' ? '#cbd5e1' : '#374151',
            muted: theme === 'dark' ? '#64748b' : '#6b7280'
        }
    };
};

export const useIsDarkMode = () => {
    const { theme } = useTheme();
    return theme === 'dark';
};

export default function ThemeDebug() {
    const { theme, toggleTheme } = useTheme();
    
    console.log('🎨 Current theme:', theme);
    
    return (
        <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
            <h3>Theme Debug: {theme}</h3>
            <button onClick={toggleTheme} className="btn-primary">
                Toggle Theme
            </button>
        </div>
    );
}