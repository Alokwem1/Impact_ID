import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import apiClient from "../api/axios";
import { CheckCircleIcon, ExclamationTriangleIcon, UserIcon, EnvelopeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import InputField from "./components/InputField";
import PasswordField from "./components/PasswordField";
import StatusAlert from "./components/StatusAlert";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "", // ✅ ADDED: Missing full name field
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Removed obsolete local visibility states (handled inside PasswordField)
  const [searchParams] = useSearchParams();
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Show success message if redirected from email verification
  const verificationSuccess = searchParams.get("verified") === "true";

  // Enhanced validation matching your backend requirements
  const validateForm = () => {
    const newErrors = {};

    // Username validation (matches your backend UserCreate schema)
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 50) {
      newErrors.username = "Username must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    }

    // ✅ ADDED: Full name validation
    if (formData.fullName.trim() && formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be less than 100 characters";
    }

    // Enhanced password validation matching your backend
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // ✅ FIXED: Real API calls for availability checks
  const checkUsernameAvailability = async () => {
    if (!formData.username || formData.username.length < 3) return;

    try {
      setCheckingAvailability(true);

      // ✅ FIXED: Real API call to your backend
      const response = await apiClient.get(
        `/api/auth/check-username?username=${encodeURIComponent(formData.username.toLowerCase())}`,
      );
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Username availability check failed:", error);
      setUsernameAvailable(null);

      // Handle API errors gracefully
      if (error.response?.status !== 404) {
        console.warn(
          "Username check API unavailable, proceeding without validation",
        );
      }
    } finally {
      setCheckingAvailability(false);
    }
  };

  const checkEmailAvailability = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return;

    try {
      setCheckingAvailability(true);

      // ✅ FIXED: Real API call to your backend
      const response = await apiClient.get(
        `/api/auth/check-email?email=${encodeURIComponent(formData.email.toLowerCase())}`,
      );
      setEmailAvailable(response.data.available);
    } catch (error) {
      console.error("Email availability check failed:", error);
      setEmailAvailable(null);

      // Handle API errors gracefully
      if (error.response?.status !== 404) {
        console.warn(
          "Email check API unavailable, proceeding without validation",
        );
      }
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Debounced availability check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username.length >= 3) {
        checkUsernameAvailability();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        checkEmailAvailability();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset availability checks when input changes
    if (name === "username") {
      setUsernameAvailable(null);
    }
    if (name === "email") {
      setEmailAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalize / trim inputs before validation
    setFormData((prev) => ({
      ...prev,
      username: prev.username.trim(),
      email: prev.email.trim(),
      fullName: prev.fullName.trim(),
    }));

    // If availability still unknown (null) perform a last-second check
    if (usernameAvailable === null && formData.username.length >= 3) {
      try { await checkUsernameAvailability(); } catch { /* silent */ }
    }
    if (emailAvailable === null && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      try { await checkEmailAvailability(); } catch { /* silent */ }
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check availability before submitting (if checks were performed)
    if (usernameAvailable === false) {
      setErrors({ username: "Username is already taken" });
      return;
    }

    if (emailAvailable === false) {
      setErrors({ email: "Email is already registered" });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // ✅ FIXED: Call register function with all required parameters
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName ? formData.fullName : "", // keep optional semantics
      );

      // Success message and navigation are handled by AuthContext
    } catch (err) {
      // ✅ ENHANCED: Better error handling based on your backend responses
      console.error("Registration error:", err);

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        // Handle specific backend validation errors
        if (
          detail.includes("Username already registered") ||
          detail.includes("username")
        ) {
          setErrors({ username: detail });
        } else if (
          detail.includes("Email already registered") ||
          detail.includes("email")
        ) {
          setErrors({ email: detail });
        } else if (detail.includes("Password")) {
          setErrors({ password: detail });
        } else {
          // Generic error
          setErrors({ general: detail });
          toast.error(detail);
        }
      } else if (err.response?.data?.message) {
        // Alternative error format
        setErrors({ general: err.response.data.message });
        toast.error(err.response.data.message);
      } else {
        // Network or unknown errors
        const errorMessage =
          "Registration failed. Please check your connection and try again.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength now handled inside PasswordField

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-7 space-y-5 transition-colors">
        {/* Success message for email verification */}
        {verificationSuccess && (
          <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-green-800 text-sm">
              Email verified successfully! Please create your account.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Create your account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
            Join the Impact ID community and start building your sustainable
            contribution profile.
          </p>
        </div>

        {errors.general && (
          <StatusAlert type="error">{errors.general}</StatusAlert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            error={errors.fullName}
            optional
            autoComplete="name"
          />

          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a unique username"
            icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            error={errors.username}
            successMessage={
              usernameAvailable === true ? "Username is available!" : undefined
            }
            rightAdornment={
              checkingAvailability ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              ) : usernameAvailable === true ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : usernameAvailable === false ? (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              ) : null
            }
            autoComplete="username"
          />
          {usernameAvailable === false && !errors.username && (
            <p className="text-red-500 text-xs -mt-1">Username is already taken</p>
          )}

          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@email.com"
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            rightAdornment={
              checkingAvailability ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              ) : emailAvailable === true ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : emailAvailable === false ? (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              ) : null
            }
            autoComplete="email"
          />
          {emailAvailable === false && !errors.email && (
            <p className="text-red-500 text-xs -mt-1">Email is already registered</p>
          )}

          <PasswordField
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            error={errors.password}
            showStrength
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            compareTo={formData.password}
            showStrength={false}
          />

          {/* Terms and Privacy Notice */}
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-100/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-md p-2">
            By creating an account you agree to our{" "}
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Privacy Policy
            </span>
            .
          </p>

          <button
            type="submit"
            disabled={
              loading || usernameAvailable === false || emailAvailable === false
            }
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm py-2.5 px-4 rounded-md shadow-sm hover:shadow transition disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
