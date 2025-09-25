// Lightweight wrapper around web-vitals (optional dependency)
// Dynamically imported to avoid adding cost when unused.
export function initWebVitals(onMetric) {
  if (typeof window === "undefined") return;
  import("web-vitals")
    .then(({ onCLS, onFID, onLCP, onFCP, onTTFB, onINP }) => {
      const handler = (metric) => {
        // Basic console logging; adapt to POST to backend if needed.
        if (typeof onMetric === "function") onMetric(metric);
        if (window.__DEV__) {
          console.log("[WebVital]", metric.name, metric.value);
        }
      };
      onCLS(handler);
      onFID(handler);
      onLCP(handler);
      onFCP(handler);
      onTTFB(handler);
      if (onINP) onINP(handler); // INP supported in newer versions
    })
    .catch(() => {
      // Silently ignore if web-vitals not installed
    });
}

// Example backend POST (commented for opt-in use):
// fetch('/api/analytics/web-vitals', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(metric)}).catch(()=>{})
