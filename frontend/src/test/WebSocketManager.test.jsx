import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { renderWithProviders } from "./testUtils";
// Import as a module namespace so we can spy on named exports with ESM
import * as WSModule from "../WebSocketManager.jsx";
const WebSocketManager = WSModule.default;
import * as AuthModule from "../utils/AuthContext";
import { authEvents, AUTH_EVENT } from "../utils/authEvents";

// Mock toast to avoid side effects
vi.mock("react-hot-toast", () => ({
  default: Object.assign(() => {}, { success: vi.fn(), error: vi.fn() }),
  __esModule: true,
}));

// WebSocket readyState constants mimic
const READY = { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 };

let wsInstance;
const allSockets = [];
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = READY.CONNECTING;
    this.sent = [];
    wsInstance = this;
    allSockets.push(this);
  }
  send(msg) {
    this.sent.push(msg);
  }
  close(code, reason) {
    this.closeArgs = { code, reason };
    this.readyState = READY.CLOSED;
    if (this.onclose)
      this.onclose({ code: code ?? 1000, reason: reason ?? "" });
  }
}

// Attach event handler placeholders
["onopen", "onmessage", "onclose", "onerror"].forEach((h) => {
  MockWebSocket.prototype[h] = null;
});

describe("WebSocketManager auth event reactions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    wsInstance = null;
    // reset tracked sockets between tests to avoid stale instances affecting assertions
    allSockets.length = 0;
    global.WebSocket = MockWebSocket; // override
    // Provide static readyState constants expected by implementation
    global.WebSocket.OPEN = READY.OPEN;
    global.WebSocket.CONNECTING = READY.CONNECTING;
    global.WebSocket.CLOSING = READY.CLOSING;
    global.WebSocket.CLOSED = READY.CLOSED;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("accessToken", "initial");

    // Mock useAuth to provide user + authenticated state
    vi.spyOn(AuthModule, "useAuth").mockReturnValue({
      user: { id: 99, role: "user" },
      isAuthenticated: true,
    });
  });

  function mount() {
    renderWithProviders(<WebSocketManager />, { includeAuth: false });
  }

  it("sends auth_refresh with new token on TOKEN_REFRESH", async () => {
    await act(async () => {
      mount();
    });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => {
      wsInstance.readyState = READY.OPEN;
      wsInstance.onopen?.();
    });
    await waitFor(() => {
      const set = authEvents.listeners.get(AUTH_EVENT.TOKEN_REFRESH);
      expect(set && set.size > 0).toBe(true);
    });
    await act(async () => {
      authEvents.emit(AUTH_EVENT.TOKEN_REFRESH, { token: "refreshed123" });
    });
    await waitFor(() => {
      const sent = wsInstance.sent.find((m) => {
        try {
          const p = JSON.parse(m);
          return p.type === "auth_refresh" && p.token === "refreshed123";
        } catch {
          return false;
        }
      });
      expect(sent).toBeTruthy();
    });
  });

  it("closes socket with code 4001 on SESSION_EXPIRED", async () => {
    await act(async () => {
      mount();
    });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => {
      wsInstance.readyState = READY.OPEN;
      wsInstance.onopen?.();
    });
    // Ensure listener registered
    await waitFor(() => {
      const set = authEvents.listeners.get(AUTH_EVENT.SESSION_EXPIRED);
      expect(set && set.size > 0).toBe(true);
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await act(async () => {
      authEvents.emit(AUTH_EVENT.SESSION_EXPIRED, { reason: "expired" });
    });
    // Prefer observable side-effect: console.warn invoked with 4001 + session_expired
    await waitFor(() => {
      const saw4001 = warnSpy.mock.calls.some((call) =>
        call.join(" ").includes("WebSocket disconnected: 4001"),
      );
      expect(saw4001).toBe(true);
    });
  });

  it("cleanup executed on LOGOUT (socket closed, no further sends)", async () => {
    await act(async () => {
      mount();
    });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => {
      wsInstance.readyState = READY.OPEN;
      wsInstance.onopen?.();
    });
    // Ensure logout listener registered
    await waitFor(() => {
      const set = authEvents.listeners.get(AUTH_EVENT.LOGOUT);
      expect(set && set.size > 0).toBe(true);
    });
    await act(async () => {
      authEvents.emit(AUTH_EVENT.LOGOUT, {});
    });
    await waitFor(() => {
      expect(wsInstance.readyState).toBe(READY.CLOSED);
    });
    const prevSend = wsInstance.sent.length;
    await act(async () => {
      authEvents.emit(AUTH_EVENT.TOKEN_REFRESH, { token: "after-logout" });
    });
    expect(wsInstance.sent.length).toBe(prevSend);
  });
});
