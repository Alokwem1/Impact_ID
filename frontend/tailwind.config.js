/** @type {import('tailwindcss').Config} */
export default {
  // 1. Content paths for React/Vite project structure
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ================================
      // 🎨 IMPACT ID BRAND COLORS
      // ================================
      colors: {
        primary: "var(--color-primary)",
        "brand-blue": "var(--color-brand-blue)",
        "brand-purple": "var(--color-brand-purple)",
        success: "var(--color-success)",
        background: "var(--color-background)",
        "text-primary": "var(--color-text-primary)",
        // Primary brand colors
        brand: {
          blue: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6", // Primary brand blue
            600: "#2563eb", // DEFAULT brand blue
            700: "#1d4ed8", // Dark brand blue
            800: "#1e40af",
            900: "#1e3a8a",
            DEFAULT: "#2563eb",
            dark: "#1d4ed8",
            light: "#3b82f6",
          },
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            200: "#e9d5ff",
            300: "#d8b4fe",
            400: "#c084fc",
            500: "#a855f7",
            600: "#9333ea",
            700: "#7c3aed", // Secondary brand purple
            800: "#6b21a8",
            900: "#581c87",
            DEFAULT: "#7c3aed",
            dark: "#6d28d9",
          },
          green: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a", // Success green
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
            DEFAULT: "#16a34a",
            dark: "#15803d",
          },
          red: {
            50: "#fef2f2",
            100: "#fee2e2",
            200: "#fecaca",
            300: "#fca5a5",
            400: "#f87171",
            500: "#ef4444",
            600: "#dc2626", // Error red
            700: "#b91c1c",
            800: "#991b1b",
            900: "#7f1d1d",
            DEFAULT: "#dc2626",
            dark: "#b91c1c",
          },
          yellow: {
            50: "#fefce8",
            100: "#fef9c3",
            200: "#fef08a",
            300: "#fde047",
            400: "#facc15", // Warning yellow
            500: "#eab308",
            600: "#ca8a04",
            700: "#a16207",
            800: "#854d0e",
            900: "#713f12",
            DEFAULT: "#facc15",
            dark: "#ca8a04",
          },
          orange: {
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#f97316", // Streak orange
            600: "#ea580c",
            700: "#c2410c",
            800: "#9a3412",
            900: "#7c2d12",
            DEFAULT: "#f97316",
            dark: "#ea580c",
          },
          gray: {
            50: "#f9fafb",
            100: "#f3f4f6",
            200: "#e5e7eb",
            300: "#d1d5db",
            400: "#9ca3af",
            500: "#6b7280", // Muted text
            600: "#4b5563",
            700: "#374151",
            800: "#1f2937",
            900: "#111827",
            DEFAULT: "#6b7280",
            muted: "#6b7280",
          },
        },

        // ================================
        // 🎮 GAMIFICATION COLORS
        // ================================
        xp: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          DEFAULT: "#0ea5e9",
        },
        essence: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          DEFAULT: "#d946ef",
        },
        streak: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          DEFAULT: "#f97316",
        },
        badge: {
          gold: "#fbbf24",
          silver: "#e5e7eb",
          bronze: "#f97316",
          platinum: "#e879f9",
        },

        // ================================
        // 🌈 IMPACT CATEGORIES
        // ================================
        impact: {
          environment: {
            50: "#f0fdf4",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            DEFAULT: "#16a34a",
          },
          social: {
            50: "#fdf2f8",
            500: "#ec4899",
            600: "#db2777",
            700: "#be185d",
            DEFAULT: "#db2777",
          },
          technology: {
            50: "#eff6ff",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            DEFAULT: "#2563eb",
          },
          education: {
            50: "#faf5ff",
            500: "#a855f7",
            600: "#9333ea",
            700: "#7c3aed",
            DEFAULT: "#9333ea",
          },
          health: {
            50: "#fef2f2",
            500: "#ef4444",
            600: "#dc2626",
            700: "#b91c1c",
            DEFAULT: "#dc2626",
          },
          community: {
            50: "#fff7ed",
            500: "#f97316",
            600: "#ea580c",
            700: "#c2410c",
            DEFAULT: "#ea580c",
          },
        },
      },

      // ================================
      // 📝 TYPOGRAPHY
      // ================================
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: ["Inter", "ui-sans-serif", "system-ui"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      // ================================
      // 📐 SPACING & SIZING
      // ================================
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // ================================
      // 🎭 SHADOWS & EFFECTS
      // ================================
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        DEFAULT:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

        // Custom Impact ID shadows
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 8px 25px rgba(0, 0, 0, 0.1)",
        button: "0 2px 4px rgba(0, 0, 0, 0.1)",
        "button-hover": "0 4px 8px rgba(0, 0, 0, 0.15)",
        "glow-blue": "0 0 20px rgba(37, 99, 235, 0.3)",
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.3)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.3)",
      },
      dropShadow: {
        glow: "0 0 10px rgba(37, 99, 235, 0.5)",
        "glow-lg": "0 0 20px rgba(37, 99, 235, 0.5)",
      },

      // ================================
      // 🎬 ANIMATIONS & TRANSITIONS
      // ================================
      keyframes: {
        // Existing animations
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        // New Impact ID animations
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        xpFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        badgeGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(251, 191, 36, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(251, 191, 36, 0.8)" },
        },
        streakFire: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.1) rotate(-1deg)" },
          "75%": { transform: "scale(1.1) rotate(1deg)" },
        },
        levelUp: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        taskComplete: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        // Existing animations
        fadeInUp: "fadeInUp 0.4s ease-out forwards",
        fadeIn: "fadeIn 0.3s ease-in-out forwards",

        // New Impact ID animations
        slideInLeft: "slideInLeft 0.4s ease-out forwards",
        slideInRight: "slideInRight 0.4s ease-out forwards",
        bounceGentle: "bounceGentle 2s infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        xpFill: "xpFill 1s ease-out forwards",
        badgeGlow: "badgeGlow 2s ease-in-out infinite",
        streakFire: "streakFire 1s ease-in-out infinite",
        levelUp: "levelUp 0.6s ease-in-out",
        taskComplete: "taskComplete 0.3s ease-in-out",

        // Timing variations
        "fade-in-fast": "fadeIn 0.15s ease-out",
        "fade-in-slow": "fadeIn 0.6s ease-out",
        "bounce-slow": "bounceGentle 3s infinite",
        "pulse-fast": "pulseGlow 1s ease-in-out infinite",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        400: "400ms",
        600: "600ms",
        800: "800ms",
        900: "900ms",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // ================================
      // 📐 RESPONSIVE BREAKPOINTS
      // ================================
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
      },

      // ================================
      // 🎨 GRADIENT STOPS
      // ================================
      backgroundImage: (theme) => ({
        "brand-gradient": `linear-gradient(90deg, ${theme("colors.brand.blue.DEFAULT")}, ${theme("colors.brand.purple.DEFAULT")})`,
        "xp-gradient": `linear-gradient(90deg, ${theme("colors.xp.DEFAULT")}, ${theme("colors.brand.blue.DEFAULT")})`,
        "essence-gradient": `linear-gradient(90deg, ${theme("colors.essence.DEFAULT")}, ${theme("colors.brand.purple.DEFAULT")})`,
      }),

      // ================================
      // 📚 TYPOGRAPHY PLUGIN CONFIG
      // ================================
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            maxWidth: "none",
            a: {
              color: theme("colors.brand.blue.DEFAULT"),
              textDecoration: "none",
              fontWeight: "500",
              "&:hover": {
                color: theme("colors.brand.blue.dark"),
                textDecoration: "underline",
              },
            },
            strong: {
              color: theme("colors.gray.900"),
              fontWeight: "600",
            },
            "ol > li::marker": {
              color: theme("colors.brand.blue.DEFAULT"),
            },
            "ul > li::marker": {
              color: theme("colors.brand.blue.DEFAULT"),
            },
            hr: {
              borderColor: theme("colors.gray.200"),
              marginTop: "2em",
              marginBottom: "2em",
            },
            blockquote: {
              borderLeftColor: theme("colors.brand.blue.DEFAULT"),
              backgroundColor: theme("colors.gray.50"),
              fontStyle: "normal",
              padding: "1rem",
              margin: "1.5rem 0",
              borderRadius: "0.5rem",
            },
            h1: {
              color: theme("colors.gray.900"),
              fontWeight: "800",
            },
            h2: {
              color: theme("colors.gray.900"),
              fontWeight: "700",
            },
            h3: {
              color: theme("colors.gray.900"),
              fontWeight: "600",
            },
            h4: {
              color: theme("colors.gray.900"),
              fontWeight: "600",
            },
            code: {
              color: theme("colors.brand.blue.DEFAULT"),
              backgroundColor: theme("colors.gray.100"),
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "500",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },

        // Dark mode typography
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.brand.blue.400"),
              "&:hover": {
                color: theme("colors.brand.blue.300"),
              },
            },
            strong: {
              color: theme("colors.white"),
            },
            "ol > li::marker": {
              color: theme("colors.brand.blue.400"),
            },
            "ul > li::marker": {
              color: theme("colors.brand.blue.400"),
            },
            hr: {
              borderColor: theme("colors.gray.700"),
            },
            blockquote: {
              borderLeftColor: theme("colors.brand.blue.400"),
              backgroundColor: theme("colors.gray.800"),
              color: theme("colors.gray.300"),
            },
            h1: {
              color: theme("colors.white"),
            },
            h2: {
              color: theme("colors.white"),
            },
            h3: {
              color: theme("colors.white"),
            },
            h4: {
              color: theme("colors.white"),
            },
            code: {
              color: theme("colors.brand.blue.300"),
              backgroundColor: theme("colors.gray.800"),
            },
          },
        },

        // Compact typography for cards and components
        sm: {
          css: {
            fontSize: "0.875rem",
            lineHeight: "1.5",
          },
        },

        // Large typography for landing pages
        lg: {
          css: {
            fontSize: "1.125rem",
            lineHeight: "1.7",
          },
        },
      }),
    },
  },

  // ================================
  // 🔌 PLUGINS
  // ================================
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),

    // Custom Impact ID plugin for additional utilities
    function ({ addUtilities, addComponents, theme }) {
      // Add custom utilities
      addUtilities({
        ".text-gradient-brand": {
          background: `linear-gradient(135deg, ${theme("colors.brand.blue.DEFAULT")}, ${theme("colors.brand.purple.DEFAULT")})`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".bg-gradient-brand": {
          background: `linear-gradient(135deg, ${theme("colors.brand.blue.DEFAULT")}, ${theme("colors.brand.purple.DEFAULT")})`,
        },
        ".bg-gradient-xp": {
          background: `linear-gradient(90deg, ${theme("colors.xp.DEFAULT")}, ${theme("colors.brand.blue.DEFAULT")})`,
        },
        ".bg-gradient-essence": {
          background: `linear-gradient(90deg, ${theme("colors.essence.DEFAULT")}, ${theme("colors.brand.purple.DEFAULT")})`,
        },
      });

      // Add custom components
      addComponents({
        ".btn-impact": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${theme("spacing.2")} ${theme("spacing.4")}`,
          borderRadius: theme("borderRadius.lg"),
          fontWeight: theme("fontWeight.medium"),
          fontSize: theme("fontSize.sm"),
          transition: "all 0.2s ease-in-out",
          "&:focus": {
            outline: "none",
            boxShadow: `0 0 0 3px ${theme("colors.brand.blue.DEFAULT")}40`,
          },
        },
        ".card-impact": {
          backgroundColor: theme("colors.white"),
          borderRadius: theme("borderRadius.xl"),
          boxShadow: theme("boxShadow.card"),
          padding: theme("spacing.6"),
          border: `1px solid ${theme("colors.gray.200")}`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: theme("boxShadow.card-hover"),
            transform: "translateY(-2px)",
          },
          ".dark &": {
            backgroundColor: theme("colors.gray.800"),
            borderColor: theme("colors.gray.700"),
          },
        },
        ".badge-impact": {
          display: "inline-flex",
          alignItems: "center",
          padding: `${theme("spacing.1")} ${theme("spacing.3")}`,
          borderRadius: theme("borderRadius.full"),
          fontSize: theme("fontSize.xs"),
          fontWeight: theme("fontWeight.medium"),
        },
      });
    },
  ],

  // ================================
  // ⚡ PERFORMANCE OPTIMIZATIONS
  // ================================
  corePlugins: {
    preflight: true,
    container: true,
  },

  // Safelist important classes that might be used dynamically
  safelist: [
    "bg-brand-blue",
    "bg-brand-purple",
    "bg-brand-green",
    "bg-brand-red",
    "bg-brand-yellow",
    "bg-brand-orange",
    "text-brand-blue",
    "text-brand-purple",
    "border-brand-blue",
    "animate-xpFill",
    "animate-levelUp",
    "animate-taskComplete",
    "animate-badgeGlow",
    "animate-streakFire",
  ],
};
