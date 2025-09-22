import { describe, it, expect } from 'vitest';
import { queryKeys, authInvalidateTargets } from '../api/queryKeys';

describe('queryKeys factory', () => {
  it('produces expected root key shapes', () => {
    expect(queryKeys.user.me()).toEqual(['user', 'me']);
    expect(queryKeys.tasks.root()).toEqual(['tasks']);
    expect(queryKeys.admin.analytics()).toEqual(['admin', 'analytics', '30d']);
  });

  it('dynamic parameter keys embed params at correct position', () => {
    const detail = queryKeys.tasks.detail(42);
    expect(detail).toEqual(['tasks', 'detail', 42]);
    const profile = queryKeys.user.profile('alice');
    expect(profile).toEqual(['user', 'profile', 'alice']);
  });

  it('returns new array references each call (no accidental caching)', () => {
    const a1 = queryKeys.user.me();
    const a2 = queryKeys.user.me();
    expect(a1).not.toBe(a2);
    expect(a1).toEqual(a2);
  });

  it('complex keys with objects retain object identity only per invocation', () => {
    const k1 = queryKeys.tasks.list({ status: 'open' });
    const k2 = queryKeys.tasks.list({ status: 'open' });
    expect(k1).toEqual(k2);
    // object param different reference -> entire array not referentially equal
    expect(k1).not.toBe(k2);
  });

  it('authInvalidateTargets includes specific key arrays', () => {
    expect(authInvalidateTargets).toEqual([
      ['user', 'me'],
      ['user'],
      ['badges'],
      ['leaderboard'],
      ['tasks']
    ]);
  });
});
