import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ThemeProvider } from "../ThemeContext";
import { AuthProvider } from "../utils/AuthContext";
import { WebSocketStatusProvider } from "../WebSocketStatusContext";

// Central render wrapper to ensure provider composition consistency across tests
export function renderWithProviders(
  ui,
  { route = "/", queryClient, includeAuth = true, ...renderOptions } = {},
) {
  const qc =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={qc}>
          <ThemeProvider>
            <WebSocketStatusProvider>
              {includeAuth ? <AuthProvider>{children}</AuthProvider> : children}
            </WebSocketStatusProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return { qc, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from "@testing-library/react";
