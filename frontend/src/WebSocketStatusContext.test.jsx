import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WebSocketManager, {
  setWebSocketFactory,
  __lastSocket,
} from "./WebSocketManager";
import {
  WebSocketStatusProvider,
  useWebSocketStatus,
} from "./WebSocketStatusContext";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as AuthModule from "./utils/AuthContext";

class FakeWS {
  constructor() {
    this.readyState = 0;
    setTimeout(() => {
      this.readyState = 1;
      this.onopen && this.onopen();
    }, 0);
  }
  send() {}
  close(evt) {
    this.onclose &&
      this.onclose({ code: (evt && evt.code) || 1000, reason: "test" });
  }
  addEventListener(type, cb) {
    if (type === "message") this.onmessage = cb;
  }
  removeEventListener() {}
}

function StatusProbe() {
  const status = useWebSocketStatus();
  return <div data-testid="ws-status">{status}</div>;
}

function AppWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <WebSocketStatusProvider>
          <StatusProbe />
          <WebSocketManager />
        </WebSocketStatusProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("WebSocketStatusContext integration", () => {
  beforeEach(() => {
    localStorage.setItem("accessToken", "t");
    vi.spyOn(AuthModule, "useAuth").mockReturnValue({
      user: { id: 7, role: "user" },
      isAuthenticated: true,
    });
    setWebSocketFactory(() => new FakeWS());
  });
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("reflects connected then disconnected status", async () => {
    render(<AppWrapper />);
    const statusNode = await screen.findByTestId("ws-status");
    // Initially disconnected -> connecting -> connected (allow microtasks)
    await act(() => Promise.resolve());
    expect(["connecting", "connected", "disconnected"]).toContain(
      statusNode.textContent,
    );
    // Force close to trigger disconnected
    act(() => {
      __lastSocket && __lastSocket.close({ code: 1000 });
    });
    await act(() => Promise.resolve());
    expect(statusNode.textContent).toBe("disconnected");
  });
});
