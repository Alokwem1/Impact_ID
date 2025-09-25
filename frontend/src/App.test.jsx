import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock BrowserRouter to use MemoryRouter for deterministic testing & to avoid real navigation warnings
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }) => (
      <actual.MemoryRouter initialEntries={["/login"]}>
        {children}
      </actual.MemoryRouter>
    ),
  };
});

import App from "./App.jsx";
import { WebSocketStatusProvider } from "./WebSocketStatusContext";

describe("App component", () => {
  it("mounts with memory router and renders loading or login route content", () => {
    const { container } = render(
      <WebSocketStatusProvider>
        <App />
      </WebSocketStatusProvider>,
    );
    expect(container).toBeTruthy();
    // We expect either the loading spinner text or some login-related text once lazy chunk resolves
    const fallbackText = screen.getByText(/Impact ID/i);
    expect(fallbackText).toBeInTheDocument();
  });
});
