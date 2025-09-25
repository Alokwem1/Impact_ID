import { describe, it, expect, vi, afterEach } from "vitest";
import { authEvents, AUTH_EVENT } from "../utils/authEvents";

// Helper to fully reset internal emitter state between tests
afterEach(() => {
  // Clear all listeners (internal API awareness acceptable in test scope)
  for (const [evt, set] of authEvents.listeners.entries()) {
    set.clear();
    authEvents.listeners.delete(evt);
  }
});

describe("authEvents emitter", () => {
  it("on + emit deliver payload to multiple listeners", () => {
    const a = vi.fn();
    const b = vi.fn();
    const payload = { user: { id: 1 } };
    authEvents.on(AUTH_EVENT.LOGIN, a);
    authEvents.on(AUTH_EVENT.LOGIN, b);

    authEvents.emit(AUTH_EVENT.LOGIN, payload);

    expect(a).toHaveBeenCalledTimes(1);
    expect(a).toHaveBeenCalledWith(payload);
    expect(b).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledWith(payload);
  });

  it("off removes specific listener and leaves others intact", () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = authEvents.on(AUTH_EVENT.LOGOUT, a);
    authEvents.on(AUTH_EVENT.LOGOUT, b);

    authEvents.emit(AUTH_EVENT.LOGOUT);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);

    offA(); // unsubscribe a
    authEvents.emit(AUTH_EVENT.LOGOUT);

    expect(a).toHaveBeenCalledTimes(1); // unchanged
    expect(b).toHaveBeenCalledTimes(2); // still receives
  });

  it("once only fires a single time then auto-unsubscribes", () => {
    const fn = vi.fn();
    authEvents.once(AUTH_EVENT.TOKEN_REFRESH, fn);

    authEvents.emit(AUTH_EVENT.TOKEN_REFRESH, { attempt: 1 });
    authEvents.emit(AUTH_EVENT.TOKEN_REFRESH, { attempt: 2 });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ attempt: 1 });
  });

  it("listener throwing error does not prevent others from running", () => {
    const err = new Error("boom");
    const throwing = vi.fn(() => {
      throw err;
    });
    const ok = vi.fn();

    // Optionally silence console for this test if DEV mode logs
    const originalWarn = console.warn;
    console.warn = vi.fn();

    authEvents.on(AUTH_EVENT.SESSION_EXPIRED, throwing);
    authEvents.on(AUTH_EVENT.SESSION_EXPIRED, ok);

    authEvents.emit(AUTH_EVENT.SESSION_EXPIRED, { reason: "timeout" });

    expect(throwing).toHaveBeenCalledTimes(1);
    expect(ok).toHaveBeenCalledTimes(1);

    console.warn = originalWarn; // restore
  });

  it("removing last listener cleans internal map", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const off1 = authEvents.on(AUTH_EVENT.LOGIN, fn1);
    const off2 = authEvents.on(AUTH_EVENT.LOGIN, fn2);

    expect(authEvents.listeners.has(AUTH_EVENT.LOGIN)).toBe(true);
    off1();
    // still has because second listener remains
    expect(authEvents.listeners.has(AUTH_EVENT.LOGIN)).toBe(true);
    off2();
    // now should be cleaned up
    expect(authEvents.listeners.has(AUTH_EVENT.LOGIN)).toBe(false);
  });
});
