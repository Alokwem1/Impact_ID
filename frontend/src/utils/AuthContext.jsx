import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/axios";
import { authEvents, AUTH_EVENT } from "./authEvents";
import toast from "react-hot-toast";

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Enhanced AuthProvider with complete backend integration
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // 'traditional' or 'wallet'
  const [sessionInfo, setSessionInfo] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const location = useLocation();

  // ================================
  // 🔐 CORE AUTHENTICATION FUNCTIONS
  // ================================

  // Enhanced token management
  const getStoredToken = useCallback(() => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  }, []);

  const storeToken = useCallback((token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("accessToken", token);
      sessionStorage.removeItem("accessToken");
    } else {
      sessionStorage.setItem("accessToken", token);
      localStorage.removeItem("accessToken");
    }
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
  }, []);

  // Enhanced user fetching with comprehensive error handling
  const fetchUser = useCallback(
    async (showErrors = false) => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return null;
      }

      try {
        // ✅ FIXED: Use correct endpoint matching your backend
        const response = await apiClient.get("/api/auth/me");
        const userData = response.data;

        setUser(userData);
        setIsAuthenticated(true);
        setAuthMethod(userData.wallet_address ? "wallet" : "traditional");

        // Set user permissions based on role
        const userPermissions = getUserPermissions(userData.role);
        setPermissions(userPermissions);

        // Update session info
        setSessionInfo({
          lastActive: new Date(),
          loginMethod: userData.wallet_address ? "wallet" : "traditional",
          role: userData.role,
          verified: userData.is_verified || userData.status === "active",
        });

        return userData;
      } catch (error) {
        console.error("Failed to fetch user:", error);

        // Clear invalid token
        clearToken();
        setUser(null);
        setIsAuthenticated(false);
        setAuthMethod(null);
        setSessionInfo(null);
        setPermissions([]);

        if (showErrors && error.response?.status !== 401) {
          toast.error("Failed to load user profile");
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [getStoredToken, clearToken],
  );

  // Initialize auth state on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Refresh user data
  const refetchUser = useCallback(async () => {
    setLoading(true);
    return await fetchUser(true);
  }, [fetchUser]);

  // ================================
  // 🔑 TRADITIONAL LOGIN/REGISTER
  // ================================

  // Enhanced traditional login with comprehensive error handling
  const login = async (username, password, rememberMe = false) => {
    const toastId = toast.loading("Logging in...");

    try {
      // ✅ FIXED: Use correct login endpoint matching your backend
      const response = await apiClient.post("/api/auth/login", {
        username: username.toLowerCase().trim(),
        password,
      });

      if (!response || !response.data || typeof response.data !== "object") {
        throw new Error("Malformed login response");
      }

      const {
        access_token,
        token_type,
        expires_in,
        username: returnedUsername,
        user_id,
      } = response.data;

      // Store token with remember me preference
      storeToken(access_token, rememberMe);

      // Fetch complete user profile then invalidate auth related caches
      await fetchUser();
      authEvents.emit(AUTH_EVENT.LOGIN, {
        username: returnedUsername || username,
      });
      // Invalidate stale caches tied to previous anonymous state
      try {
        const { authInvalidateTargets } = await import("../api/queryKeys");
        authInvalidateTargets.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
      } catch (e) {
        if (import.meta.env.DEV)
          console.warn("Query invalidation (login) failed:", e);
      }

      toast.success(`Welcome back, ${returnedUsername || username}!`, {
        id: toastId,
      });

      // Navigate to intended destination or dashboard
      const intendedPath = location.state?.from?.pathname || "/dashboard";
      navigate(intendedPath, { replace: true });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Login failed. Please try again.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // Enhanced registration with better error handling
  const register = async (username, email, password, fullName = "") => {
    const toastId = toast.loading("Creating your account...");

    try {
      // ✅ FIXED: Use correct registration endpoint matching your backend
      const response = await apiClient.post("/api/auth/register", {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        full_name: fullName.trim(),
      });

      toast.success(
        "Account created successfully! Please check your email for verification.",
        {
          id: toastId,
          duration: 5000,
        },
      );

      navigate("/login", {
        state: {
          message:
            "Please check your email to verify your account before logging in.",
          username: username.toLowerCase().trim(),
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Registration failed. Please try again.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // ================================
  // 🔗 WALLET AUTHENTICATION
  // ================================

  // Enhanced wallet login with Web3 integration
  const walletLogin = async (address, signature, message) => {
    const toastId = toast.loading("Authenticating wallet...");

    try {
      // ✅ FIXED: Use correct wallet login endpoint matching your backend
      const response = await apiClient.post("/api/users/wallet-login", {
        address: address.toLowerCase(),
        signature,
        message,
      });
      if (!response || !response.data)
        throw new Error("Malformed wallet login response");
      const { access_token, token_type } = response.data;

      // Store token (wallet logins typically use session storage)
      storeToken(access_token, false);

      // Fetch complete user profile
      await fetchUser();

      toast.success("Wallet connected successfully!", { id: toastId });

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Wallet authentication failed.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // ================================
  // 🔄 PASSWORD MANAGEMENT
  // ================================

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    const toastId = toast.loading("Updating password...");

    try {
      // ✅ FIXED: Use correct change password endpoint
      const response = await apiClient.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (!response || response.status >= 400)
        throw new Error("Password change failed");

      toast.success("Password updated successfully!", { id: toastId });
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update password.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    const toastId = toast.loading("Sending reset email...");

    try {
      // ✅ FIXED: Use correct forgot password endpoint
      const response = await apiClient.post("/api/auth/forgot-password", {
        email: email.toLowerCase().trim(),
      });
      if (!response || response.status >= 400)
        throw new Error("Reset email failed");

      toast.success("Password reset email sent! Check your inbox.", {
        id: toastId,
        duration: 5000,
      });
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Failed to send reset email.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // ================================
  // 🔓 LOGOUT & SESSION MANAGEMENT
  // ================================

  // Enhanced logout with server-side cleanup
  const logout = async (showMessage = true) => {
    try {
      // ✅ FIXED: Use correct logout endpoint
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      // Continue with client-side logout even if server logout fails
      console.warn("Server logout failed:", error);
    }

    // Clear client-side state
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setAuthMethod(null);
    setSessionInfo(null);
    setPermissions([]);
    authEvents.emit(AUTH_EVENT.LOGOUT, { manual: true });

    if (showMessage) {
      toast.success("Logged out successfully.");
    }

    // Clear all query caches safely (auth-related) and refetch protected queries lazily when needed
    try {
      queryClient.clear();
    } catch (e) {
      if (import.meta.env.DEV) console.warn("Query cache clear failed:", e);
    }

    navigate("/login", { replace: true });
  };

  // Token refresh
  const refreshToken = async () => {
    try {
      // ✅ FIXED: Use correct refresh endpoint
      const response = await apiClient.post("/api/auth/refresh");
      if (!response || !response.data)
        throw new Error("Malformed refresh response");
      const { access_token } = response.data;

      // Update stored token
      const rememberMe = localStorage.getItem("accessToken") !== null;
      storeToken(access_token, rememberMe);

      return access_token;
    } catch (error) {
      // If refresh fails, logout user
      await logout(false);
      throw error;
    }
  };

  // ================================
  // 🛡️ UTILITY FUNCTIONS
  // ================================

  // Get user permissions based on role
  const getUserPermissions = (role) => {
    const rolePermissions = {
      admin: ["read", "write", "delete", "admin"],
      moderator: ["read", "write", "moderate"],
      user: ["read", "write"],
      guest: ["read"],
    };
    return rolePermissions[role] || ["read"];
  };

  // Check if user has specific permission
  const hasPermission = useCallback(
    (permission) => {
      return permissions.includes(permission);
    },
    [permissions],
  );

  // Check if user has any of the specified roles
  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user],
  );

  // Validate current session
  const validateSession = async () => {
    try {
      // ✅ FIXED: Use correct validate endpoint
      await apiClient.get("/api/auth/validate");
      return true;
    } catch (error) {
      await logout(false);
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    const toastId = toast.loading("Updating profile...");

    try {
      // ✅ FIXED: Use correct update profile endpoint matching your backend
      const response = await apiClient.put("/api/users/@me", updates);
      setUser(response.data);
      try {
        const { queryKeys } = await import("../api/queryKeys");
        queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
        if (response.data?.username) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.user.profile(response.data.username),
          });
        }
      } catch (e) {
        if (import.meta.env.DEV)
          console.warn("Query invalidation (profile update) failed:", e);
      }
      toast.success("Profile updated successfully!", { id: toastId });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update profile.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // ================================
  // 📧 EMAIL VERIFICATION
  // ================================

  // Resend verification email
  const resendVerificationEmail = async () => {
    const toastId = toast.loading("Sending verification email...");

    try {
      // ✅ FIXED: Use correct resend verification endpoint in users router
      await apiClient.post("/api/users/resend-verification");
      toast.success("Verification email sent! Check your inbox.", {
        id: toastId,
        duration: 5000,
      });
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Failed to send verification email.";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  // ================================
  // 🎯 CONTEXT VALUE
  // ================================

  const contextValue = {
    // User state
    user,
    loading,
    isAuthenticated,
    authMethod,
    sessionInfo,
    permissions,

    // Authentication methods
    login,
    register,
    walletLogin,
    logout,

    // User management
    fetchUser,
    refetchUser,
    updateProfile,

    // Password management
    changePassword,
    forgotPassword,

    // Session management
    refreshToken,
    validateSession,

    // Utilities
    hasPermission,
    hasRole,
    resendVerificationEmail,

    // Token management
    getStoredToken,
    clearToken,
  };

  // ================================
  // ⚠️ HARDENED SESSION EXPIRY HANDLING
  // ================================
  const sessionExpiredHandledRef = useRef(false);

  const handleSessionExpired = useCallback(() => {
    if (sessionExpiredHandledRef.current) return;
    sessionExpiredHandledRef.current = true;

    // Clear tokens & local auth state (avoid server logout call that may 401)
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setAuthMethod(null);
    setSessionInfo(null);
    setPermissions([]);

    // Clear react-query cache softly
    try {
      queryClient.clear();
    } catch (e) {
      /* silent */
    }

    // Emit logout for websocket + other listeners
    authEvents.emit(AUTH_EVENT.LOGOUT, {
      forced: true,
      reason: "session-expired",
    });

    // Show toast only if not already displayed
    toast.error("Session expired. Please log in again.", {
      id: "session-expired",
    });

    // Redirect using router (avoid hard reload)
    navigate("/login", { replace: true, state: { reason: "session-expired" } });
  }, [clearToken, navigate, queryClient]);

  useEffect(() => {
    const offExpired = authEvents.on(
      AUTH_EVENT.SESSION_EXPIRED,
      handleSessionExpired,
    );
    const offRefreshFailed = authEvents.on(
      AUTH_EVENT.TOKEN_REFRESH_FAILED,
      handleSessionExpired,
    );
    const offLogin = authEvents.on(AUTH_EVENT.LOGIN, () => {
      // Reset guard so future expiry events are handled
      sessionExpiredHandledRef.current = false;
      toast.dismiss("session-expired");
    });
    return () => {
      offExpired();
      offRefreshFailed();
      offLogin();
    };
  }, [handleSessionExpired]);

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Enhanced loading state with proper fallback */}
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Impact ID
                </h3>
                <p className="text-gray-600">Initializing your experience...</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// ================================
// 🛡️ ROUTE PROTECTION HOOKS
// ================================

// Hook for protecting routes
export const useRequireAuth = (redirectTo = "/login") => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(redirectTo, {
        state: { from: location },
        replace: true,
      });
    }
  }, [isAuthenticated, loading, navigate, redirectTo, location]);

  return { isAuthenticated, loading };
};

// Hook for role-based access
export const useRequireRole = (requiredRoles, redirectTo = "/unauthorized") => {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && !hasRole(requiredRoles)) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, hasRole, requiredRoles, loading, navigate, redirectTo]);

  return { hasAccess: hasRole(requiredRoles), loading };
};
