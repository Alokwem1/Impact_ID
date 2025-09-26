// Feature flags for safely gating visual enhancements
// Toggle via Vite env: set VITE_UI_ENHANCEMENTS=true to enable

export const ENABLE_UI_ENHANCEMENTS =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_UI_ENHANCEMENTS === "true") || false;
