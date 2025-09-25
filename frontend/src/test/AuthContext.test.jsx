import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock axios BEFORE importing AuthContext to ensure provider sees mocked client
vi.mock("../api/axios", () => {
  const mock = {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: {} }),
  };
  return { __esModule: true, default: mock };
});

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./utils/renderWithProviders.jsx";
import { useAuth } from "../utils/AuthContext.jsx";
import apiClient from "../api/axios";

// Helper test component
function Echo() {
  const { user, isAuthenticated, loading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="isAuth">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username || ""}</div>
    </div>
  );
}

// Utility to set token in chosen storage
function setToken(token, remember) {
  if (remember) localStorage.setItem("accessToken", token);
  else sessionStorage.setItem("accessToken", token);
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    apiClient.get.mockReset();
    apiClient.post.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes as unauthenticated when no token", async () => {
    apiClient.get.mockRejectedValueOnce({ response: { status: 401 } });
    renderWithProviders(<Echo />);
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("isAuth").textContent).toBe("false");
    expect(screen.getByTestId("username").textContent).toBe("");
  });

  it("loads user when token present", async () => {
    setToken("abc", false);
    apiClient.get.mockResolvedValueOnce({
      data: { username: "alice", role: "user" },
    });
    renderWithProviders(<Echo />);
    await waitFor(() =>
      expect(screen.getByTestId("isAuth").textContent).toBe("true"),
    );
    expect(screen.getByTestId("username").textContent).toBe("alice");
  });

  it("login stores token (rememberMe=false -> sessionStorage)", async () => {
    // No initial /me call expected (no token yet) so directly mock login then user fetch
    apiClient.post.mockResolvedValue({
      data: { access_token: "tok123", username: "bob" },
    }); // any number of invocations
    apiClient.get.mockResolvedValue({
      data: { username: "bob", role: "user" },
    }); // subsequent fetchUser calls

    function LoginProbe() {
      const { login } = useAuth();
      React.useEffect(() => {
        login("Bob", "pw");
      }, [login]);
      return <Echo />;
    }

    renderWithProviders(<LoginProbe />);
    await waitFor(() =>
      expect(screen.getByTestId("isAuth").textContent).toBe("true"),
    );
    expect(sessionStorage.getItem("accessToken")).toBe("tok123");
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("login stores token in localStorage when rememberMe=true", async () => {
    // No initial /me call expected (no token yet) so directly mock login then user fetch
    apiClient.post.mockResolvedValue({
      data: { access_token: "tok456", username: "carol" },
    });
    apiClient.get.mockResolvedValue({
      data: { username: "carol", role: "user" },
    });

    function LoginProbe() {
      const { login } = useAuth();
      React.useEffect(() => {
        login("Carol", "pw", true);
      }, [login]);
      return <Echo />;
    }

    renderWithProviders(<LoginProbe />);
    await waitFor(() =>
      expect(screen.getByTestId("isAuth").textContent).toBe("true"),
    );
    expect(localStorage.getItem("accessToken")).toBe("tok456");
    expect(sessionStorage.getItem("accessToken")).toBeNull();
  });

  it("logout clears tokens and state", async () => {
    // Initial with token
    setToken("abc", false);
    apiClient.get.mockResolvedValueOnce({
      data: { username: "dave", role: "user" },
    }); // first fetchUser
    apiClient.post.mockResolvedValueOnce({ data: {} }); // logout endpoint

    function LogoutProbe() {
      const { logout, isAuthenticated } = useAuth();
      React.useEffect(() => {
        if (isAuthenticated) logout();
      }, [isAuthenticated, logout]);
      return <Echo />;
    }

    renderWithProviders(<LogoutProbe />);
    await waitFor(() =>
      expect(screen.getByTestId("isAuth").textContent).toBe("false"),
    );
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(sessionStorage.getItem("accessToken")).toBeNull();
  });

  it("failed user fetch resets state and clears token", async () => {
    setToken("bad", false);
    apiClient.get.mockRejectedValueOnce({ response: { status: 500 } });
    renderWithProviders(<Echo />);
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(screen.getByTestId("isAuth").textContent).toBe("false");
  });
});
