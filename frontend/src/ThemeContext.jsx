import React from "react";
import PropTypes from "prop-types";

const THEME_KEY = "impactid-theme";
const ThemeContext = React.createContext();

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export class ThemeProvider extends React.Component {
  constructor(props) {
    super(props);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme && (savedTheme === "light" || savedTheme === "dark")
      ? savedTheme
      : (systemPrefersDark ? "dark" : "light");
    this.state = {
      theme: initialTheme,
      isSystemTheme: !savedTheme,
    };
    this.handleSystemChange = this.handleSystemChange.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.setLightTheme = this.setLightTheme.bind(this);
    this.setDarkTheme = this.setDarkTheme.bind(this);
    this.useSystemTheme = this.useSystemTheme.bind(this);
  }

  componentDidMount() {
    this.applyThemeSideEffects();
    if (this.state.isSystemTheme) {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mediaQuery.addEventListener("change", this.handleSystemChange);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.theme !== this.state.theme ||
      prevState.isSystemTheme !== this.state.isSystemTheme
    ) {
      this.applyThemeSideEffects();
      if (!prevState.isSystemTheme && this.state.isSystemTheme) {
        this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        this.mediaQuery.addEventListener("change", this.handleSystemChange);
      }
      if (prevState.isSystemTheme && !this.state.isSystemTheme && this.mediaQuery) {
        this.mediaQuery.removeEventListener("change", this.handleSystemChange);
      }
    }
  }

  componentWillUnmount() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleSystemChange);
    }
  }

  handleSystemChange(e) {
    this.setState({ theme: e.matches ? "dark" : "light" });
  }

  applyThemeSideEffects() {
    const { theme, isSystemTheme } = this.state;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    if (!isSystemTheme) {
      localStorage.setItem(THEME_KEY, theme);
    } else {
      localStorage.removeItem(THEME_KEY);
    }

    const themeColorMeta =
      document.querySelector('meta[name="theme-color"]') ||
      document.createElement("meta");
    if (!themeColorMeta.parentNode) {
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    const themeColors = { light: "#2563eb", dark: "#18181b" };
    themeColorMeta.setAttribute("content", themeColors[theme]);

    let statusBarMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]',
    );
    if (!statusBarMeta) {
      statusBarMeta = document.createElement("meta");
      statusBarMeta.setAttribute(
        "name",
        "apple-mobile-web-app-status-bar-style",
      );
      document.head.appendChild(statusBarMeta);
    }
    statusBarMeta.setAttribute(
      "content",
      theme === "dark" ? "black-translucent" : "default",
    );
  }

  toggleTheme() {
    this.setState((s) => ({ theme: s.theme === "light" ? "dark" : "light", isSystemTheme: false }));
  }

  setLightTheme() {
    this.setState({ theme: "light", isSystemTheme: false });
  }

  setDarkTheme() {
    this.setState({ theme: "dark", isSystemTheme: false });
  }

  useSystemTheme() {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    this.setState({ theme: systemTheme, isSystemTheme: true });
  }

  render() {
    const { theme, isSystemTheme } = this.state;
    const value = {
      theme,
      isSystemTheme,
      toggleTheme: this.toggleTheme,
      setLightTheme: this.setLightTheme,
      setDarkTheme: this.setDarkTheme,
      useSystemTheme: this.useSystemTheme,
      colors: {
        primary: theme === "dark" ? "#3b82f6" : "#2563eb",
        background: theme === "dark" ? "#0f172a" : "#ffffff",
        surface: theme === "dark" ? "#1e293b" : "#f8fafc",
        text: theme === "dark" ? "#f1f5f9" : "#0f172a",
        muted: theme === "dark" ? "#64748b" : "#6b7280",
      },
    };
    return (
      <ThemeContext.Provider value={value}>{this.props.children}</ThemeContext.Provider>
    );
  }
}

// PropTypes for ThemeProvider
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hooks for specific theme needs
export const useThemeColors = () => {
  const { theme } = useTheme();

  return {
    primary: theme === "dark" ? "#3b82f6" : "#2563eb",
    secondary: theme === "dark" ? "#8b5cf6" : "#7c3aed",
    success: theme === "dark" ? "#10b981" : "#059669",
    warning: theme === "dark" ? "#f59e0b" : "#d97706",
    error: theme === "dark" ? "#ef4444" : "#dc2626",
    background: theme === "dark" ? "#0f172a" : "#ffffff",
    surface: theme === "dark" ? "#1e293b" : "#f8fafc",
    border: theme === "dark" ? "#374151" : "#e5e7eb",
    text: {
      primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
      secondary: theme === "dark" ? "#cbd5e1" : "#374151",
      muted: theme === "dark" ? "#64748b" : "#6b7280",
    },
  };
};

export const useIsDarkMode = () => {
  const { theme } = useTheme();
  return theme === "dark";
};

export default function ThemeDebug() {
  const { theme, toggleTheme } = useTheme();

  console.log("🎨 Current theme:", theme);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
      <h3>Theme Debug: {theme}</h3>
      <button onClick={toggleTheme} className="btn-primary">
        Toggle Theme
      </button>
    </div>
  );
}
