// Vitest global setup for React Testing Library
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Polyfill matchMedia if needed
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = function matchMedia(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}

// Silence react-query network error toast noise in tests by mocking react-hot-toast
vi.mock("react-hot-toast", () => {
  const api = {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
    loading: vi.fn(),
  };
  const Toaster = () => null; // silent stub
  return { __esModule: true, default: api, Toaster, toast: api };
});
