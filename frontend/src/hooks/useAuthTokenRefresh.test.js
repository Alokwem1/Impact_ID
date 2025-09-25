import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthTokenRefresh } from "./useAuthTokenRefresh";
import * as axiosModule from "../api/axios";
import { authEvents, AUTH_EVENT } from "../utils/authEvents";

// Mock toast to avoid side effects
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
  error: vi.fn(),
  success: vi.fn(),
}));

// Utility to capture emitted events
function capture(eventType) {
  const events = [];
  const off = authEvents.on(eventType, (payload) => events.push(payload));
  return { events, off };
}

describe("useAuthTokenRefresh single-flight", () => {
  it("only fires one network call for concurrent refreshes", async () => {
    const postSpy = vi.spyOn(axiosModule.default, "post");
    // Provide a stored token to trigger refresh
    localStorage.setItem("accessToken", "oldtoken");
    postSpy.mockResolvedValueOnce({ data: { access_token: "newtoken123" } });

    const { result } = renderHook(() => useAuthTokenRefresh());
    const captureRefresh = capture(AUTH_EVENT.TOKEN_REFRESH);
    await act(async () => {
      await Promise.all([
        result.current.refreshToken(),
        result.current.refreshToken(),
        result.current.refreshToken(),
      ]);
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("accessToken")).toBe("newtoken123");
    expect(captureRefresh.events.length).toBe(1);
    captureRefresh.off();
  });

  it("clears token and emits failure on error", async () => {
    localStorage.setItem("accessToken", "willfail");
    const postSpy = vi.spyOn(axiosModule.default, "post");
    postSpy.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useAuthTokenRefresh());
    const failureEvents = capture(AUTH_EVENT.TOKEN_REFRESH_FAILED);
    await act(async () => {
      await result.current.refreshToken();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(failureEvents.events.length).toBe(1);
    failureEvents.off();
  });
});
