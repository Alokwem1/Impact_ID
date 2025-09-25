import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../utils/AuthContext";
import LoginPage from "../auth/LoginPage";
import { vi } from "vitest";
import { authEvents, AUTH_EVENT } from "../utils/authEvents";

// var references for hoisted mock factory
var apiClientMock;
var lastAuthHeader = null;
const responses = {
  me: {
    id: 1,
    username: "persisted",
    email: "p@example.com",
    role: "user",
    xp: 5,
    is_verified: true,
  },
};

vi.mock("../WebSocketManager", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  Toaster: () => null,
  default: {
    success: () => {},
    error: () => {},
    dismiss: () => {},
    loading: () => ({}),
  },
  success: () => {},
  error: () => {},
  dismiss: () => {},
  loading: () => {},
}));
vi.mock("../api/axios", () => {
  apiClientMock = {
    post: vi.fn(async (url) => {
      if (url === "/api/auth/logout") return { data: {} };
      if (url === "/api/auth/refresh")
        return { data: { access_token: "REFRESHED_TOKEN" } };
      return { data: {} };
    }),
    get: vi.fn(async (url) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      lastAuthHeader = token ? `Bearer ${token}` : undefined;
      if (url === "/api/auth/me") return { data: responses.me };
      return { data: {} };
    }),
    request: vi.fn(),
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  };
  return { __esModule: true, default: apiClientMock };
});

function MiniDashboard() {
  const { user } = useAuth();
  return <div data-testid="mini-dashboard">Hi {user?.username || "anon"}</div>;
}

function TestHarness({ initialEntries }) {
  const queryClient = new QueryClient();
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<MiniDashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("Session Expired cleanup", () => {
  test("clears tokens and prevents old token usage in subsequent calls", async () => {
    sessionStorage.setItem("accessToken", "OLD_TOKEN");
    render(<TestHarness initialEntries={["/dashboard"]} />);

    await waitFor(() =>
      expect(screen.getByTestId("mini-dashboard")).toHaveTextContent(
        /persisted/i,
      ),
    );
    expect(sessionStorage.getItem("accessToken")).toBe("OLD_TOKEN");

    await act(async () => {
      authEvents.emit(AUTH_EVENT.SESSION_EXPIRED, { reason: "test" });
    });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /welcome back/i }),
      ).toBeInTheDocument(),
    );

    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();

    await apiClientMock.get("/after-expiry-check");
    expect(lastAuthHeader).toBeUndefined();
  });
});
