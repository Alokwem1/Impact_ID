import { vi } from 'vitest';
// Hoist mocks before importing the module under test
vi.mock('./utils/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'demo', xp: 0, streak: 0, essence_balance: 0 },
    loading: false,
  }),
}));
vi.mock('@tanstack/react-query', () => {
  const React = require('react');
  return {
    useQuery: ({ queryKey }) => {
      const key = Array.isArray(queryKey) ? queryKey.join(':') : String(queryKey);
      if (key.includes('user:dashboard')) {
        return { data: { tasks_completed_today: 5 }, isLoading: false, error: null, refetch: () => {} };
      }
      if (key.includes('achievements:recent')) {
        return { data: [], isLoading: false, error: null, refetch: () => {} };
      }
      if (key.includes('notifications:count')) {
        return { data: 0, isLoading: false, error: null, refetch: () => {} };
      }
      if (key.includes('user:me')) {
        return { data: { id: 1, username: 'demo', level: 1, xp: 0 }, isLoading: false, error: null, refetch: () => {} };
      }
      return { data: undefined, isLoading: false, error: null, refetch: () => {} };
    },
    useMutation: ({ mutationFn, onSuccess, onError } = {}) => {
      const mutate = async (...args) => {
        try {
          const result = await (mutationFn ? mutationFn(...args) : undefined);
          if (onSuccess) onSuccess(result);
          return result;
        } catch (err) {
          if (onError) onError(err);
          throw err;
        }
      };
      return {
        mutate,
        mutateAsync: mutate,
        isPending: false,
        isLoading: false,
        isSuccess: false,
        isError: false,
        data: undefined,
        error: null,
        reset: () => {},
      };
    },
    QueryClientProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    QueryClient: class {},
    useQueryClient: () => ({
      invalidateQueries: () => {},
      setQueryData: () => {},
      getQueryData: () => undefined,
    }),
  };
});
vi.mock('./api/axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/api/dashboard') {
        return Promise.resolve({ data: { tasks_completed_today: 5 } });
      }
      if (url.startsWith('/api/users/achievements/recent')) {
        return Promise.resolve({ data: [] });
      }
      if (url === '/api/users/@me') {
        return Promise.resolve({ data: { id: 1, username: 'demo', level: 1, xp: 0 } });
      }
      if (url === '/api/notifications/unread/count') {
        return Promise.resolve({ data: { unread_count: 0 } });
      }
      return Promise.resolve({ data: {} });
    }),
  },
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';



test('renders Quick Stats Bar with correct data', async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardPage />
    </MemoryRouter>
  );

  const statsElement = await screen.findByText(/5/);
  expect(statsElement).toBeInTheDocument();
});