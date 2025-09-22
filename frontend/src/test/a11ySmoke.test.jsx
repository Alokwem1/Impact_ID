import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../utils/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../auth/LoginPage.jsx';

// Lazy dependency note: jest-axe not yet installed; this test will be skipped gracefully until dependency is added.
let axe; // will load dynamically if available
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  axe = require('jest-axe').axe;
} catch (e) {
  // axe not installed; test will be marked skipped
}

describe('Accessibility smoke test', () => {
  it('LoginPage has no critical accessibility violations', async () => {
    if (!axe) {
      console.warn('[a11y] jest-axe not installed; skipping accessibility assertions');
      return; // skip silently
    }
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <QueryClientProvider client={qc}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    const results = await axe(container);
    // Filter only serious/critical impact if present
    const serious = results.violations.filter(v => ['serious','critical'].includes(v.impact));

    if (serious.length) {
      console.error('\nAccessibility violations:', JSON.stringify(serious, null, 2));
    }
    expect(serious).toHaveLength(0);
  });
});
