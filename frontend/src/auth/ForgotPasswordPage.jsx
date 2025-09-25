import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import InputField from "./components/InputField";
import StatusAlert from "./components/StatusAlert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();

  // Handle URL parameters for different states
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error === "expired") {
      setStatus({
        message:
          "Your password reset link has expired. Please request a new one.",
        type: "error",
      });
    } else if (error === "invalid") {
      setStatus({
        message: "Invalid reset link. Please request a new password reset.",
        type: "error",
      });
    } else if (message === "reset_success") {
      setStatus({
        message:
          "Password reset successfully! You can now log in with your new password.",
        type: "success",
      });
    }
  }, [searchParams]);

  // Enhanced email validation
  const validateEmail = (email) => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (email.length > 255) {
      newErrors.email = "Email address is too long";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);

    // Clear errors when user starts typing
    if (errors.email) {
      setErrors({});
    }

    // Clear status messages when user starts typing
    if (status.message) {
      setStatus({ message: "", type: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email first
    const validationErrors = validateEmail(email);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setStatus({ message: "", type: "" });

    try {
      // Call the correct backend endpoint
      // Forgot password endpoint corrected to /api/auth
      await apiClient.post("/api/auth/forgot-password", { email });

      setStatus({
        message:
          "If an account with that email exists, a reset link has been sent to your inbox.",
        type: "success",
      });

      // Clear the email field on success
      setEmail("");

      // Show toast notification
      toast.success("Reset instructions sent! Check your email.");
    } catch (err) {
      console.error("Password reset error:", err);

      // Enhanced error handling based on backend responses
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        if (detail.includes("rate limit")) {
          setStatus({
            message:
              "Too many reset requests. Please wait a few minutes before trying again.",
            type: "error",
          });
        } else if (detail.includes("temporarily unavailable")) {
          setStatus({
            message:
              "Password reset service is temporarily unavailable. Please try again later.",
            type: "error",
          });
        } else {
          // For security, still show generic message for most errors
          setStatus({
            message:
              "If an account with that email exists, a reset link has been sent to your inbox.",
            type: "success",
          });
        }
      } else {
        // Network or other errors - show generic success message for security
        setStatus({
          message:
            "If an account with that email exists, a reset link has been sent to your inbox.",
          type: "success",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear success messages after 10 seconds
  useEffect(() => {
    if (status.type === "success" && status.message) {
      const timer = setTimeout(() => {
        setStatus({ message: "", type: "" });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <AuthLayout
      icon={<LockClosedIcon className="h-6 w-6 text-white" />}
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link if an account exists."
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
      {status.message && (
        <StatusAlert type={status.type === "success" ? "success" : "error"} compact>
          {status.message}
        </StatusAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email address"
          icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
          error={errors.email}
          disabled={loading}
          autoComplete="email"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm py-2.5 px-4 rounded-md shadow-sm hover:shadow transition disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending Reset Link...</span>
            </div>
          ) : (
            <>
              <EnvelopeIcon className="h-4 w-4" />
              <span>Send reset link</span>
            </>
          )}
        </button>
      </form>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-100/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-md p-2 flex items-start gap-2">
        <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
        <span>
          Reset links expire after 2 hours. Check spam if you don't see it. We
          never disclose if an email exists.
        </span>
      </p>
    </AuthLayout>
  );
}
