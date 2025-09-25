import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  LockClosedIcon,
  SparklesIcon,
  WalletIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import InputField from "./components/InputField";
import PasswordField from "./components/PasswordField";
import StatusAlert from "./components/StatusAlert";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  // show password handled inside PasswordField now
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ FIXED: Use both login and walletLogin from AuthContext
  const { login, walletLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Success messages
    if (params.get("status") === "success") {
      setSuccess(
        "Registration successful! Please log in with your credentials.",
      );
    }
    if (params.get("verified") === "true") {
      setSuccess("Email verified successfully! You can now log in.");
    }
    if (params.get("reset") === "true") {
      setSuccess(
        "Password reset successfully! Please log in with your new password.",
      );
    }
    if (params.get("logout") === "true") {
      setSuccess("You have been logged out successfully.");
    }

    // Error messages
    if (params.get("error") === "token_expired") {
      setErrors({ general: "Your session has expired. Please log in again." });
    }
    if (params.get("error") === "unauthorized") {
      setErrors({ general: "Please log in to access this page." });
    }
  }, [location]);

  // Enhanced validation
  const validateForm = () => {
    const newErrors = {};

    if (!credentials.username.trim()) {
      newErrors.username = "Username or email is required";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 1) {
      newErrors.password = "Password cannot be empty";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general errors
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }

    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // ✅ FIXED: Use rememberMe parameter correctly
      await login(credentials.username, credentials.password, rememberMe);

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberLogin", "true");
      } else {
        localStorage.removeItem("rememberLogin");
      }

      // Success is handled by AuthContext via navigation
    } catch (err) {
      // Enhanced error handling based on your #backend responses
      const detail = err.response?.data?.detail;

      if (detail) {
        if (detail.includes("Incorrect username or password")) {
          setErrors({
            general:
              "Invalid username or password. Please check your credentials and try again.",
          });
        } else if (detail.includes("Account is suspended")) {
          setErrors({
            general:
              "Your account has been suspended. Please contact support for assistance.",
          });
        } else if (detail.includes("Account is banned")) {
          setErrors({
            general:
              "Your account has been banned. Please contact support for more information.",
          });
        } else if (detail.includes("temporarily unavailable")) {
          setErrors({
            general:
              "Login service is temporarily unavailable. Please try again later.",
          });
        } else if (detail.includes("Email not verified")) {
          setErrors({
            general:
              "Please verify your email address before logging in. Check your inbox for the verification link.",
          });
        } else {
          setErrors({ general: detail });
        }
      } else {
        setErrors({
          general:
            "Login failed. Please check your internet connection and try again.",
        });
      }

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ COMPLETELY FIXED: Wallet login with correct #backend integration
  const handleWalletLogin = async () => {
    if (typeof window.ethereum === "undefined") {
      setErrors({
        general:
          "MetaMask wallet is not installed. Please install MetaMask to connect your wallet.",
      });
      return;
    }

    setWalletLoading(true);
    setErrors({});

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error(
          "No wallet accounts found. Please unlock your MetaMask wallet.",
        );
      }

      const address = accounts[0];

      // ✅ FIXED: Create verification message matching #backend expectations
      const timestamp = Date.now();
      const message = `Sign this message to log in to Impact ID.\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;

      // Request signature
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      // ✅ FIXED: Use AuthContext walletLogin method instead of manual API call
      await walletLogin(address, signature, message);

      // Success message and navigation are handled by AuthContext
    } catch (err) {
      console.error("Wallet login error:", err);

      // Enhanced error handling for wallet-specific errors
      if (err.code === 4001) {
        setErrors({
          general:
            "Wallet connection was cancelled. Please try again and approve the connection.",
        });
      } else if (err.code === -32602) {
        setErrors({
          general:
            "Invalid wallet request. Please make sure MetaMask is properly installed.",
        });
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (detail.includes("not found") || detail.includes("not associated")) {
          setErrors({
            general:
              "This wallet is not linked to any Impact ID account. Please register first or link your wallet in your profile settings.",
          });
        } else if (detail.includes("Invalid signature")) {
          setErrors({
            general: "Wallet signature verification failed. Please try again.",
          });
        } else {
          setErrors({ general: detail });
        }
      } else {
        setErrors({
          general:
            err.message ||
            "Wallet login failed. Please try again or use username/password login.",
        });
      }
    } finally {
      setWalletLoading(false);
    }
  };

  // Auto-fill username if remembered
  useEffect(() => {
    const rememberedLogin = localStorage.getItem("rememberLogin");
    if (rememberedLogin === "true") {
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center px-4 py-10">
      <main
        className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-7 space-y-5 transition-colors"
        aria-labelledby="login-heading"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div
            className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md"
            aria-hidden="true"
          >
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <h1
            id="login-heading"
            className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
          >
            Welcome back
          </h1>
          <p
            className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed"
            id="login-instructions"
          >
            Sign in to continue your impact journey.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <StatusAlert type="success" compact>
            {success}
          </StatusAlert>
        )}

        {/* Error Messages */}
        {errors.general && (
          <StatusAlert type="error" compact>
            {errors.general}
          </StatusAlert>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-describedby="login-instructions"
          noValidate
        >
          {/* Username/Email Field */}
          <InputField
            label="Username or Email"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter your username or email"
            icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            error={errors.username}
            autoComplete="username"
          />

          {/* Password Field */}
          <PasswordField
            name="password"
            label="Password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
            showStrength={false}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              data-prefetch="resetPassword"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || walletLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm py-2.5 px-4 rounded-md shadow-sm hover:shadow transition disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Logging In...</span>
              </div>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          className="relative flex py-1 items-center"
          role="separator"
          aria-label="Login alternatives"
        >
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          <span className="flex-shrink mx-3 text-gray-400 dark:text-gray-500 text-[11px] font-medium tracking-wide">
            OR
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* Wallet Login Button */}
        <button
          onClick={handleWalletLogin}
          disabled={loading || walletLoading}
          className="w-full inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-black disabled:bg-gray-500 text-white font-medium text-sm py-2.5 px-4 rounded-md shadow-sm hover:shadow transition disabled:cursor-not-allowed"
        >
          {walletLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting Wallet...</span>
            </div>
          ) : (
            <>
              <WalletIcon className="h-4 w-4" />
              <span>Login with MetaMask</span>
            </>
          )}
        </button>
        {/* Wallet note */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-100/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-md p-2 flex items-start gap-2">
          <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
          <span>
            MetaMask login requires a previously linked wallet. No gas fees or
            transactions.
          </span>
        </p>

        {/* Footer Links */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              data-prefetch="register"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
