// PostCSS configuration to enable Tailwind CSS and Autoprefixer processing.
// Without this file, the @tailwind directives in `src/index.css` would not be
// expanded, leading to an unstyled (or minimally styled) application appearance.
// This is likely the cause of the "looks worst" issue you observed in dev.

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
