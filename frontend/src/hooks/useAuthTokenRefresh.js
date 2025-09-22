import { useCallback, useRef } from 'react';
import apiClient, { getStoredToken, storeToken, clearStoredToken } from '../api/axios';
import { authEvents, AUTH_EVENT } from '../utils/authEvents';
import toast from 'react-hot-toast';

// Hook to expose a stable manual token refresh function and subscribe to refresh lifecycle
// Ensures only one refresh runs at a time; callers get same promise instance.
export function useAuthTokenRefresh() {
  const inFlightRef = useRef(null);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const run = (async () => {
      const existing = getStoredToken();
      if (!existing) {
        return null; // nothing to refresh
      }
      try {
  const res = await apiClient.post('/api/auth/refresh');
  const newToken = res && res.data ? res.data.access_token : undefined;
        if (newToken) {
          const rememberMe = localStorage.getItem('accessToken') !== null;
          storeToken(newToken, rememberMe);
          authEvents.emit(AUTH_EVENT.TOKEN_REFRESH, { token: newToken });
          return newToken;
        }
        throw new Error('No access_token in refresh response');
      } catch (e) {
        // Only clear and emit if we actually had a token to refresh
        if (getStoredToken()) {
          clearStoredToken();
          authEvents.emit(AUTH_EVENT.TOKEN_REFRESH_FAILED, { error: e });
          toast.error('Session refresh failed. Please log in again.');
        }
        return null;
      } finally {
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = run;
    return run;
  }, []);

  return { refreshToken: refresh };
}
