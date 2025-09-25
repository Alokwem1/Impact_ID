import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WebSocketManager, {
  setWebSocketFactory,
  __lastSocket,
} from "./WebSocketManager";
import { renderWithProviders } from "./test/testUtils";
import * as AuthModule from "./utils/AuthContext";

class FakeWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSED = 3;
  readyState = FakeWebSocket.CONNECTING;
  sent = [];
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;
  constructor() {}
  send(msg) {
    this.sent.push(msg);
  }
  close(code = 1000, reason = "test") {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose && this.onclose({ code, reason });
  }
  _open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen && this.onopen();
  }
}

describe("WebSocketManager heartbeat", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // authenticated user state (AuthContext expects token only; component reads user via useAuth so we mock minimal state by storing token)
    localStorage.setItem("accessToken", "abc");
    // ensure factory set before mount
    setWebSocketFactory(() => new FakeWebSocket());
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("sends periodic ping messages when connected", () => {
    vi.spyOn(AuthModule, "useAuth").mockReturnValue({
      user: { id: 42 },
      isAuthenticated: true,
    });
    renderWithProviders(<WebSocketManager />, { includeAuth: false });

    // Simulate socket open
    const sock = __lastSocket;
    expect(sock).toBeTruthy();
    sock._open();

    // No pings immediately
    expect(sock.sent.filter((m) => JSON.parse(m).type === "ping").length).toBe(
      0,
    );

    // Advance just under interval (30s per config) to ensure no premature send
    vi.advanceTimersByTime(29999);
    expect(sock.sent.filter((m) => JSON.parse(m).type === "ping").length).toBe(
      0,
    );

    // Cross interval boundary
    vi.advanceTimersByTime(2);
    expect(sock.sent.filter((m) => JSON.parse(m).type === "ping").length).toBe(
      1,
    );

    // Advance two more intervals
    vi.advanceTimersByTime(60000);
    expect(
      sock.sent.filter((m) => JSON.parse(m).type === "ping").length,
    ).toBeGreaterThanOrEqual(3);
  });
});

// NOTE: Heartbeat interval test is partially scaffolded; implementing a fully deterministic
// capture of the socket instance would require augmenting production code with an injection
// point or exporting a ref. Given minimal scope, we defer full heartbeat assertion.
