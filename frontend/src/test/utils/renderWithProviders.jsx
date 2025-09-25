import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../utils/AuthContext";
import { render } from "@testing-library/react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 1000,
      },
    },
  });
}

export function renderWithProviders(
  ui,
  { route = "/", queryClient, initialEntries = [route] } = {},
) {
  const qc = queryClient || createTestQueryClient();
  return {
    queryClient: qc,
    ...render(
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={qc}>
          <AuthProvider>{ui}</AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    ),
  };
}
