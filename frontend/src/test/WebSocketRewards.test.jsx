import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";
// Mock toast BEFORE importing module that uses it
import { QueryClient } from "@tanstack/react-query";
import { renderWithProviders } from "./testUtils";
// Mock toast BEFORE importing module that uses it (safe pattern)
vi.mock("react-hot-toast", () => {
  const t = () => {};
  t.success = vi.fn();
  t.error = vi.fn();
  return { default: t, __esModule: true };
});
import toast from "react-hot-toast";
import * as WSModule from "../WebSocketManager.jsx";
const WebSocketManager = WSModule.default;
import * as AuthModule from "../utils/AuthContext";
import { queryKeys } from "../api/queryKeys";

// WebSocket mock infra
const READY = { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 };
let wsInstance;
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = READY.CONNECTING;
    this.sent = [];
    wsInstance = this;
  }
  send(msg) {
    this.sent.push(msg);
  }
  close(code = 1000, reason = "") {
    this.readyState = READY.CLOSED;
    this.onclose?.({ code, reason });
  }
}
["onopen", "onmessage", "onclose", "onerror"].forEach((h) => {
  MockWebSocket.prototype[h] = null;
});

function mountWithClient(qc) {
  return renderWithProviders(<WebSocketManager />, {
    includeAuth: false,
    queryClient: qc,
  });
}

const containsKey = (calls, target) =>
  calls.some(
    (k) =>
      Array.isArray(k) &&
      k.length === target.length &&
      k.every((v, i) => v === target[i]),
  );

describe("WebSocketManager rewards & streak events", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    wsInstance = null;
    global.WebSocket = MockWebSocket;
    global.WebSocket.OPEN = READY.OPEN;
    vi.spyOn(AuthModule, "useAuth").mockReturnValue({
      user: { id: 555, role: "user" },
      isAuthenticated: true,
    });
    toast.success.mockClear();
    toast.error.mockClear();
  });

  it("essence_update invalidates user.me & dashboard and shows success toast when amount > 0", async () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await act(async () => {
      mountWithClient(qc);
    });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => {
      wsInstance.readyState = READY.OPEN;
      wsInstance.onopen?.();
    });
    const payload = { type: "essence_update", user_id: 555, amount: 12 };
    await act(async () => {
      wsInstance.onmessage?.({ data: JSON.stringify(payload) });
    });
    await waitFor(() => {
      const keysSeen = invalidateSpy.mock.calls
        .map((c) => c[0]?.queryKey)
        .filter(Boolean);
      expect(containsKey(keysSeen, queryKeys.user.me())).toBe(true);
      expect(containsKey(keysSeen, queryKeys.user.dashboard())).toBe(true);
      const toastCalled = toast.success.mock.calls.some((c) =>
        /12.*Essence/i.test(c[0]),
      );
      expect(toastCalled).toBe(true);
    });
  });

  it("level_up invalidates user.me & dashboard and shows level toast", async () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await act(async () => {
      mountWithClient(qc);
    });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => {
      wsInstance.readyState = READY.OPEN;
      wsInstance.onopen?.();
    });
    const payload = { type: "level_up", user_id: 555, new_level: 8 };
    await act(async () => {
      wsInstance.onmessage?.({ data: JSON.stringify(payload) });
    });
    await waitFor(() => {
      const keysSeen = invalidateSpy.mock.calls
        .map((c) => c[0]?.queryKey)
        .filter(Boolean);
      expect(containsKey(keysSeen, queryKeys.user.me())).toBe(true);
      expect(containsKey(keysSeen, queryKeys.user.dashboard())).toBe(true);
      const toastCalled = toast.success.mock.calls.some((c) =>
        /level 8/i.test(c[0]),
      );
      expect(toastCalled).toBe(true);
    });
  });

  it("streak_update milestone vs lost: different toast channels and invalidations", async () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await act(async () => {
      mountWithClient(qc);
    });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => {
      wsInstance.readyState = READY.OPEN;
      wsInstance.onopen?.();
    });
    // milestone
    await act(async () => {
      wsInstance.onmessage?.({
        data: JSON.stringify({
          type: "streak_update",
          user_id: 555,
          streak_count: 5,
          streak_type: "streak_milestone",
        }),
      });
    });
    // lost
    await act(async () => {
      wsInstance.onmessage?.({
        data: JSON.stringify({
          type: "streak_update",
          user_id: 555,
          streak_type: "streak_lost",
        }),
      });
    });
    await waitFor(() => {
      const keysSeen = invalidateSpy.mock.calls
        .map((c) => c[0]?.queryKey)
        .filter(Boolean);
      expect(containsKey(keysSeen, queryKeys.user.me())).toBe(true);
      expect(containsKey(keysSeen, queryKeys.user.dashboard())).toBe(true);
      // success toast for milestone
      const milestoneToast = toast.success.mock.calls.some((c) =>
        /streak/i.test(c[0]),
      );
      expect(milestoneToast).toBe(true);
      // error toast for lost
      const lostToast = toast.error.mock.calls.some((c) =>
        /Streak lost/i.test(c[0]),
      );
      expect(lostToast).toBe(true);
    });
  });
});
