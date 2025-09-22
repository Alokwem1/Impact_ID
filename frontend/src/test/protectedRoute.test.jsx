import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute, { AdminRoute } from '../utils/protectedRoute';
import * as AuthModule from '../utils/AuthContext';
import { render } from '@testing-library/react';

// Helper wrapper to inject a seeded auth state via login mock
function renderWithAuth(ui, { route = '/private', mockAuth } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // mock useAuth return value
  vi.spyOn(AuthModule, 'useAuth').mockReturnValue(mockAuth);
  const App = () => (
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
  return { qc, ...render(<App />) };
}

// Mock useAuth selectively by wrapping component - simpler: we will patch storage before render
beforeEach(() => {
  vi.restoreAllMocks();
});

// Minimal component under protection
const PrivateContent = () => <div data-testid="secret">Secret</div>;

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to login', async () => {
    renderWithAuth(
      <Routes>
        <Route path="/private" element={<ProtectedRoute><PrivateContent /></ProtectedRoute>} />
        <Route path="/login" element={<div data-testid="login-page">LoginPage</div>} />
      </Routes>,
      { route: '/private', mockAuth: {
        user: null,
        loading: false,
        isAuthenticated: false,
        hasRole: () => false,
        hasPermission: () => false,
        resendVerificationEmail: vi.fn()
      } }
    );

    // Should end up on login page
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('secret')).toBeNull();
  });

  it('blocks unverified user with verification prompt', async () => {
    // Seed a token + user info so AuthProvider loads user quickly
    const user = { id: 1, username: 'alice', email: 'a@a.com', is_verified: false, role: 'user', status: 'active' };
    renderWithAuth(
      <Routes>
        <Route path="/private" element={<ProtectedRoute><PrivateContent /></ProtectedRoute>} />
      </Routes>,
      { route: '/private', mockAuth: {
        user,
        loading: false,
        isAuthenticated: true,
        hasRole: () => true,
        hasPermission: () => true,
        resendVerificationEmail: vi.fn()
      } }
    );

    // Expect verification UI (button text)
    expect(await screen.findByText(/Email Verification Required/i)).toBeInTheDocument();
    expect(screen.queryByTestId('secret')).toBeNull();
  });

  it('allows verified admin through AdminRoute', async () => {
    const user = { id: 2, username: 'bob', email: 'b@b.com', is_verified: true, role: 'admin', status: 'active' };
    renderWithAuth(
      <Routes>
        <Route path="/admin" element={<AdminRoute><PrivateContent /></AdminRoute>} />
      </Routes>,
      { route: '/admin', mockAuth: {
        user,
        loading: false,
        isAuthenticated: true,
        hasRole: (roles) => Array.isArray(roles) ? roles.includes('admin') : roles === 'admin',
        hasPermission: () => true,
        resendVerificationEmail: vi.fn()
      } }
    );

    expect(await screen.findByTestId('secret')).toBeInTheDocument();
  });
});
