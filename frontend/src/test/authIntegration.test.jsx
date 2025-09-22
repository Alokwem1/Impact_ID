import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../utils/AuthContext';
import LoginPage from '../auth/LoginPage';
import ReactDOM from 'react-dom';
import { vi } from 'vitest';

// Use var so reference is available (avoids TDZ when mock factory is hoisted)
var apiClientMock;
var storedToken = null;
const responses = {
  login: { access_token: 'TEST_TOKEN', token_type: 'bearer', username: 'testuser', user_id: 1 },
  me: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user', xp: 0, is_verified: true }
};

vi.mock('../WebSocketManager', () => ({ default: () => null }));
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  Toaster: () => null,
  default: { success: () => {}, error: () => {}, dismiss: () => {}, loading: () => ({}) },
  success: () => {},
  error: () => {},
  dismiss: () => {},
  loading: () => {}
}));
vi.mock('../api/axios', () => {
  apiClientMock = {
    post: vi.fn(async (url, body) => {
      if (url === '/api/auth/login') {
        storedToken = responses.login.access_token;
        return { data: responses.login };
      }
      if (url === '/api/auth/logout') return { data: {} };
      if (url === '/api/auth/refresh') return { data: { access_token: 'REFRESHED_TOKEN' } };
      return { data: {} };
    }),
    get: vi.fn(async (url) => {
      if (url === '/api/auth/me') return { data: responses.me };
      return { data: {} };
    }),
    request: vi.fn(),
    interceptors: { request: { use: () => {} }, response: { use: () => {} } }
  };
  return { __esModule: true, default: apiClientMock };
});

// Minimal dashboard component referencing auth context
function MiniDashboard() {
  const { user } = useAuth();
  return <div data-testid="mini-dashboard">Dashboard: {user?.username}</div>;
}

function TestHarness({ initialEntries = ['/login'] }) {
  const queryClient = new QueryClient();
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<MiniDashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('Auth Integration (lean)', () => {
  test('successful login redirects to dashboard and renders user info', async () => {
    render(<TestHarness />);

    // Wait for login form label
    const userField = await screen.findByLabelText(/username or email/i);
    fireEvent.change(userField, { target: { value: 'TestUser' } });
  const passwordInput = screen.getByLabelText(/^password$/i);
  fireEvent.change(passwordInput, { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(screen.getByTestId('mini-dashboard')).toHaveTextContent(/testuser/i));

    expect(apiClientMock.post).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/auth/me');
  });
});
