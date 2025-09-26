import React from "react";

/**
 * Simple skeleton shimmer. Safe to use anywhere.
 * Props:
 * - width (string, e.g., '100%', '12rem')
 * - height (string, e.g., '1rem', '48px')
 * - className (extra utility classes)
 */
export default function Skeleton({ width = "100%", height = "1rem", className = "rounded-md" }) {
  return (
    <div
      className={`impact-skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
