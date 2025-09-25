import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import PasswordField from "./components/PasswordField";
import StatusAlert from "./components/StatusAlert";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  // visibility handled inside PasswordField
  const [tokenValidated, setTokenValidated] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);

  // Basic token presence check (backend will fully validate during reset)
  useEffect(() => {
    if (token) {
      setTokenValidated(true);
    } else {
      setStatus({
        message:
          "Missing reset token. Please use the link from your email or request a new one.",
        type: "error",
      });
    }
    setValidatingToken(false);
  }, [token]);

  // Redirect to login after successful password reset
  useEffect(() => {
    if (status.type === "success") {
      const timer = setTimeout(() => {
        navigate("/login?reset=true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  // Removed explicit backend token pre-validation (handled during reset submission)

  // Enhanced password validation matching your backend requirements
  const validateForm = () => {
    const newErrors = {};

    // Password validation (matches your backend security requirements)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear status messages when user starts typing
    if (status.message) {
      setStatus({ message: "", type: "" });
    }
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
    setStatus({ message: "", type: "" });

    try {
      // Use the correct backend endpoint
      // Backend password reset lives under /api/auth
      await apiClient.post("/api/auth/reset-password", {
        token,
        new_password: formData.password,
      });

      setStatus({
        message: "Password reset successful! Redirecting to login...",
        type: "success",
      });

      // Clear form
      setFormData({ password: "", confirmPassword: "" });

      // Show toast notification
      toast.success("Password reset successfully! You can now log in.");
    } catch (err) {
      console.error("Password reset error:", err);

      const detail = err.response?.data?.detail;

      if (detail) {
        if (detail.includes("expired")) {
          setStatus({
            message: "This reset link has expired. Please request a new one.",
            type: "error",
          });
        } else if (detail.includes("invalid")) {
          setStatus({
            message:
              "Invalid reset token. Please request a new password reset.",
            type: "error",
          });
        } else if (detail.includes("used")) {
          setStatus({
            message:
              "This reset link has already been used. Please request a new one.",
            type: "error",
          });
        } else {
          setStatus({ message: detail, type: "error" });
        }
      } else {
        setStatus({
          message:
            "Failed to reset password. Please try again or request a new reset link.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Strength handled inside PasswordField

  // Loading state while validating token
  if (validatingToken) {
    return (
      <AuthLayout
        icon={<ShieldCheckIcon className="h-6 w-6 text-white" />}
        title="Validating"
        subtitle="Please wait while we verify your reset link."
      >
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </AuthLayout>
    );
  }

  // Invalid token state
  if (!token || (status.type === "error" && !tokenValidated)) {
    return (
      <AuthLayout
        icon={<ExclamationTriangleIcon className="h-6 w-6 text-white" />}
        title="Invalid reset link"
        subtitle={
          status.message || "This password reset link is invalid or expired."
        }
        footer={
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            Need help?{" "}
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Request a new link
            </Link>
          </p>
        }
      >
        <div className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-3 leading-relaxed">
          Possible reasons: expired, already used, or copied incorrectly.
        </div>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md shadow-sm transition"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={<ShieldCheckIcon className="h-6 w-6 text-white" />}
      title="Reset password"
      subtitle="Enter a strong new password and confirm it."
      footer={
        <p className="text-center text-xs text-gray-500 dark:text-gray-500">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to login
          </Link>
        </p>
      }
    >
      {/* Status Messages */}
      {status.message && (
        <StatusAlert type={status.type === "success" ? "success" : "error"} compact>
          {status.message}
        </StatusAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Field */}
        <PasswordField
          name="password"
            label="New Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your new password"
            error={errors.password}
            disabled={loading || status.type === "success"}
            showStrength
        />

        {/* Confirm Password Field */}
        <PasswordField
          name="confirmPassword"
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your new password"
          error={errors.confirmPassword}
          compareTo={formData.password}
          disabled={loading || status.type === "success"}
          showStrength={false}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || status.type === "success"}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm py-2.5 px-4 rounded-md shadow-sm hover:shadow transition disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Resetting Password...</span>
            </div>
          ) : status.type === "success" ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Password Reset Successfully!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Reset Password</span>
            </div>
          )}
        </button>
      </form>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-100/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-md p-2 flex items-start gap-2">
        <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
        <span>
          This link becomes invalid after use. Consider a password manager for
          unique credentials.
        </span>
      </p>
    </AuthLayout>
  );
}
