import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { renderWithProviders } from "./testUtils";
// Mock toast with internal fns to avoid hoist ordering problems
vi.mock("react-hot-toast", () => {
  const toastFn = () => {};
  toastFn.success = vi.fn();
  toastFn.error = vi.fn();
  return { default: toastFn, __esModule: true };
});
import toast from "react-hot-toast";
import * as WSModule from "../WebSocketManager.jsx";
const WebSocketManager = WSModule.default; // default export component
import * as AuthModule from "../utils/AuthContext";
import { queryKeys } from "../api/queryKeys";

// Basic readyState shape (mirrors native)
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

// ------------------------------------------
// Helpers
// ------------------------------------------
function mountWithClient(client) {
  return renderWithProviders(<WebSocketManager />, {
    includeAuth: false,
    queryClient: client,
  });
}

describe("WebSocketManager leaderboard & badges updates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    wsInstance = null;
    global.WebSocket = MockWebSocket;
    global.WebSocket.OPEN = READY.OPEN; // expose constants used by impl
    global.WebSocket.CONNECTING = READY.CONNECTING;
    vi.spyOn(AuthModule, "useAuth").mockReturnValue({
      user: { id: 7, role: "user" },
      isAuthenticated: true,
    });
    toast.success.mockClear();
  });

  it("handles leaderboard_update: invalidates leaderboard + weaving leaderboard and shows rank toast when user matches", async () => {
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

    // Simulate leaderboard_update event for current user
    const payload = { type: "leaderboard_update", user_id: 7, new_rank: 3 };
    await act(async () => {
      wsInstance.onmessage?.({ data: JSON.stringify(payload) });
    });

    await waitFor(() => {
      // Expect invalidation for main leaderboard key
      const hasLeaderboardRoot = invalidateSpy.mock.calls.some(
        (call) => call[0]?.queryKey?.[0] === queryKeys.leaderboard.root()[0],
      );
      expect(hasLeaderboardRoot).toBe(true);
      // Expect invalidation for weaving leaderboard (compound key starts with 'weaving')
      const hasWeavingLeaderboard = invalidateSpy.mock.calls.some((call) => {
        const qk = call[0]?.queryKey;
        return (
          Array.isArray(qk) && qk[0] === "weaving" && qk[1] === "leaderboard"
        );
      });
      expect(hasWeavingLeaderboard).toBe(true);
      // Toast for rank movement
      const toastCalled = toast.success.mock.calls.some((c) =>
        String(c[0]).includes("#3"),
      );
      expect(toastCalled).toBe(true);
    });
  });

  it("handles badges_update: invalidates badges root + user.me + achievements.recent and shows badge toast", async () => {
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

    const payload = {
      type: "badges_update",
      user_id: 7,
      badge_title: "Explorer",
    };
    await act(async () => {
      wsInstance.onmessage?.({ data: JSON.stringify(payload) });
    });

    await waitFor(() => {
      // Check invalidations for expected keys
      const badgesRoot = queryKeys.badges.root();
      const userMe = queryKeys.user.me();
      const achievementsRecent = queryKeys.achievements.recent();
      const keysSeen = invalidateSpy.mock.calls
        .map((c) => c[0]?.queryKey)
        .filter(Boolean);
      const containsKey = (target) =>
        keysSeen.some(
          (k) =>
            Array.isArray(k) &&
            k.length === target.length &&
            k.every((v, i) => v === target[i]),
        );
      expect(containsKey(badgesRoot)).toBe(true);
      expect(containsKey(userMe)).toBe(true);
      expect(containsKey(achievementsRecent)).toBe(true);
      // Toast with badge title
      const toastCalled = toast.success.mock.calls.some((c) =>
        String(c[0]).includes("Explorer"),
      );
      expect(toastCalled).toBe(true);
    });
  });
});
