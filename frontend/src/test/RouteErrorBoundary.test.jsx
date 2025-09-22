import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { RouteErrorBoundary } from '../errors/RouteErrorBoundary';
import { renderWithProviders, createTestQueryClient } from './utils/renderWithProviders';
import { useQueryClient } from '@tanstack/react-query';

// A component that intentionally throws on first render via a query failure, then succeeds after reset
function FlakyComponent({ failKey = 'fail-toggle' }) {
  const qc = useQueryClient();
  const shouldFail = qc.getQueryData([failKey]);
  if (shouldFail) {
    throw new Error('Boom demo failure');
  }
  return <div data-testid="healthy">Healthy</div>;
}

describe('RouteErrorBoundary', () => {
  it('recovers after Retry which resets queries', async () => {
    const queryClient = createTestQueryClient();
  // prime failure flag to cause initial throw
  queryClient.setQueryData(['fail-toggle'], true);

    renderWithProviders(
      <RouteErrorBoundary>
        <FlakyComponent />
      </RouteErrorBoundary>,
      { queryClient }
    );

    // Expect fallback UI
    await screen.findByText(/Something broke while rendering/i);
    expect(screen.queryByTestId('healthy')).toBeNull();

  // Flip the failure flag so next attempt passes (boundary will reset clearing component tree)
  queryClient.setQueryData(['fail-toggle'], false);

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    // After retry the component should render successfully
    await waitFor(() => expect(screen.getByTestId('healthy')).toBeInTheDocument());
  });
});
