// Lightweight event emitter dedicated to auth + session lifecycle
// Avoids bringing in a large dependency while enabling decoupled reactions

class AuthEventEmitter {
  constructor() {
    this.listeners = new Map(); // event -> Set<fn>
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  once(event, fn) {
    const off = this.on(event, (...args) => {
      off();
      fn(...args);
    });
    return off;
  }

  off(event, fn) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(fn);
      if (!set.size) this.listeners.delete(event);
    }
  }

  emit(event, payload) {
    const set = this.listeners.get(event);
    if (set)
      [...set].forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          if (import.meta.env.DEV) console.warn("AuthEvent listener error", e);
        }
      });
  }
}

export const authEvents = new AuthEventEmitter();

// Event name constants (helps avoid typos)
export const AUTH_EVENT = {
  LOGIN: "login",
  LOGOUT: "logout",
  TOKEN_REFRESH: "token_refresh",
  TOKEN_REFRESH_FAILED: "token_refresh_failed",
  SESSION_EXPIRED: "session_expired",
};
