import { describe, it, expect, vi, beforeEach } from 'vitest';

// Provide a callable axios-like instance (function with interceptors)
var instanceRef; // var to dodge TDZ with hoisted vi.mock
const buildInstance = () => {
  const fn = (cfg) => fn.request(cfg);
  fn.interceptors = { request: { use: vi.fn() }, response: { use: vi.fn() } };
  fn.get = vi.fn();
  fn.post = vi.fn();
  fn.request = vi.fn();
  fn.defaults = {};
  return fn;
};

vi.mock('axios', () => {
  instanceRef = buildInstance();
  const globalPost = vi.fn();
  return {
    __esModule: true,
    default: {
      create: vi.fn(() => instanceRef),
      post: globalPost,
      isNetworkError: () => false
    }
  };
});

// Minimal event emitter mock to swallow authEvents emissions (avoid side-effects)
vi.mock('../utils/authEvents.js', () => ({
  authEvents: { emit: vi.fn() },
  AUTH_EVENT: { TOKEN_REFRESH: 'TOKEN_REFRESH', TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED', SESSION_EXPIRED: 'SESSION_EXPIRED' }
}));

// Mock react-hot-toast to silence toasts
vi.mock('react-hot-toast', () => ({ __esModule: true, default: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() } }));

// We'll dynamically import apiClient inside beforeEach after mocks are ready
let apiClient; let storeToken; let clearStoredToken;

// Helper to fabricate an axios-like 401 error
function make401(config = {}) {
  return {
    config,
    response: { status: 401, data: { detail: 'Unauthorized' } }
  };
}

describe('axios refresh concurrency', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    const mod = await import('../api/axios.js');
    apiClient = mod.default;
    storeToken = mod.storeToken;
    clearStoredToken = mod.clearStoredToken;
    clearStoredToken();
  });

  it('only performs a single refresh for concurrent 401 responses and replays queued requests', async () => {
    storeToken('initial_token', false); // sessionStorage

  // Use the mocked instance & global axios for refresh
  const instance = instanceRef;
  const { default: axiosGlobal } = await import('axios');
  const refreshPost = axiosGlobal.post; // refresh call goes through axios.post directly

    // Simulate three protected GET calls that will 401
    const originalConfigA = { url: '/api/protected/a', method: 'get', headers: {} };
    const originalConfigB = { url: '/api/protected/b', method: 'get', headers: {} };
    const originalConfigC = { url: '/api/protected/c', method: 'get', headers: {} };

    // We will manually invoke the response error interceptor logic by throwing 401s after we attach interceptors.

    // Grab the registered response interceptor failure handler
  const responseUseCalls = instanceRef.interceptors.response.use.mock.calls;
    expect(responseUseCalls.length).toBeGreaterThan(0);
    const failureHandler = responseUseCalls.at(-1)[1]; // grab last registered failure handler

    // Arrange refresh endpoint success (first refresh only)
    let refreshCallCount = 0;
    refreshPost.mockImplementation(async (url) => {
      if (url.endsWith('/api/auth/refresh')) {
        refreshCallCount += 1;
        return { data: { access_token: 'new_token' } };
      }
      return { data: {} };
    });

    // After refresh, the retried original requests should resolve
  apiClient.request = vi.fn(async (cfg) => ({ status: 200, data: { ok: true, path: cfg.url }, config: { ...cfg, headers: { ...(cfg.headers||{}), Authorization: 'Bearer new_token' } } }));

    // Invoke three concurrent failures (Promise.all to simulate near-simultaneous arrival)
    const p1 = failureHandler(make401(originalConfigA));
    const p2 = failureHandler(make401(originalConfigB));
    const p3 = failureHandler(make401(originalConfigC));

    const results = await Promise.all([p1, p2, p3]);

    // Assertions
    expect(refreshCallCount).toBe(1); // single refresh
    expect(results.map(r => r.data.ok)).toEqual([true, true, true]);
    expect(results.map(r => r.config.headers.Authorization)).toEqual(['Bearer new_token','Bearer new_token','Bearer new_token']);
  });
});
