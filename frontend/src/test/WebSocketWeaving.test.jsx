import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from './testUtils';
// Mock toast safely
vi.mock('react-hot-toast', () => {
  const t = () => {};
  t.success = vi.fn();
  t.error = vi.fn();
  return { default: t, __esModule: true };
});
import toast from 'react-hot-toast';
import * as WSModule from '../WebSocketManager.jsx';
const WebSocketManager = WSModule.default;
import * as AuthModule from '../utils/AuthContext';
import { queryKeys } from '../api/queryKeys';

// Mock WebSocket
const READY = { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 };
let wsInstance;
class MockWebSocket {
  constructor(url) { this.url = url; this.readyState = READY.CONNECTING; this.sent = []; wsInstance = this; }
  send(msg) { this.sent.push(msg); }
  close(code = 1000, reason = '') { this.readyState = READY.CLOSED; this.onclose?.({ code, reason }); }
}
['onopen','onmessage','onclose','onerror'].forEach(h => { MockWebSocket.prototype[h] = null; });

function mount(qc) {
  return renderWithProviders(<WebSocketManager />, { includeAuth: false, queryClient: qc });
}

describe('WebSocketManager weaving_update handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    wsInstance = null;
    global.WebSocket = MockWebSocket;
    global.WebSocket.OPEN = READY.OPEN;
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({ user: { id: 42, role: 'user' }, isAuthenticated: true });
  toast.success.mockClear();
  });

  it('invalidates weaving queries and shows toast for thread_completed', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    await act(async () => { mount(qc); });
    await waitFor(() => expect(wsInstance).toBeDefined());
    await act(async () => { wsInstance.readyState = READY.OPEN; wsInstance.onopen?.(); });

  // Provide subtype using update_type to avoid duplicate 'type' key
  const payload = { type: 'weaving_update', user_id: 42, impact_score: 17, thread_id: 9, update_type: 'thread_completed' };
    await act(async () => { wsInstance.onmessage?.({ data: JSON.stringify(payload) }); });

    await waitFor(() => {
      const calls = invalidateSpy.mock.calls.map(c => c[0]?.queryKey).filter(Boolean);
      const expectKey = (target) => calls.some(k => Array.isArray(k) && k.length === target.length && k.every((v,i) => v === target[i]));
      expect(expectKey(queryKeys.weaving.status())).toBe(true);
      expect(expectKey(queryKeys.weaving.availableThreads())).toBe(true);
      expect(expectKey(queryKeys.weaving.leaderboard())).toBe(true);
      // toast should reference impact or thread weaving success
  const toastCalled = toast.success.mock.calls.some(c => /Thread woven|impact/i.test(c[0]));
      expect(toastCalled).toBe(true);
    });
  });
});
