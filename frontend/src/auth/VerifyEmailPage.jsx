import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";

// Compact, unified email verification screen using AuthLayout
export default function VerifyEmailPage() {
  const [status, setStatus] = useState({
    message: "Verifying your email…",
    type: "loading",
  });
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initial verification attempt
  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (email) setUserEmail(email);
    if (!token) {
      setStatus({
        message:
          "Missing verification token. Please use the link from your email or request a new one.",
        type: "error",
      });
      return;
    }
    verifyEmail(token);
  }, [searchParams]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  async function verifyEmail(token) {
    try {
      setStatus({ message: "Verifying your email…", type: "loading" });
      await apiClient.get(
        `/api/users/verify-email?token=${encodeURIComponent(token)}`,
      );
      setStatus({
        message: "Email verified successfully. Redirecting you to login…",
        type: "success",
      });
      toast.success("Email verified");
      setTimeout(() => navigate("/login?verified=true"), 2500);
    } catch (err) {
      console.error("Email verification error:", err);
      const detail = err.response?.data?.detail || "";
      if (detail.includes("expired")) {
        setStatus({
          message:
            "This verification link has expired. Request a new one below.",
          type: "expired",
        });
      } else if (detail.includes("invalid")) {
        setStatus({
          message:
            "Invalid verification link. Ensure you copied the full link.",
          type: "error",
        });
      } else if (detail.includes("already verified")) {
        setStatus({
          message: "Already verified. Redirecting you to login…",
          type: "already_verified",
        });
        setTimeout(() => navigate("/login?verified=true"), 2000);
      } else {
        setStatus({
          message: "Verification failed. The link may be invalid or expired.",
          type: "error",
        });
      }
    }
  }

  async function handleResendVerification() {
    if (!userEmail) {
      toast.error("Enter your email to resend.");
      return;
    }
    try {
      setResendLoading(true);
      await apiClient.post("/api/users/resend-verification", {
        email: userEmail,
      });
      toast.success("Verification email sent");
      setResendCooldown(60);
    } catch (err) {
      const detail = err.response?.data?.detail || "";
      if (detail.includes("rate limit")) {
        toast.error("Please wait a bit before requesting again.");
      } else {
        toast.error("Failed to resend. Try again later.");
      }
    } finally {
      setResendLoading(false);
    }
  }

  function StatusIcon() {
    switch (status.type) {
      case "success":
      case "already_verified":
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-600"
            aria-hidden="true"
          />
        );
      case "error":
      case "expired":
        return (
          <XCircleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
        );
      case "loading":
        return (
          <div
            className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"
            aria-hidden="true"
          />
        );
      default:
        return (
          <InformationCircleIcon
            className="h-5 w-5 text-blue-600"
            aria-hidden="true"
          />
        );
    }
  }

  const intentStyles = {
    success: "bg-green-50 text-green-700 border-green-200",
    already_verified: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    expired: "bg-red-50 text-red-700 border-red-200",
    loading: "bg-blue-50 text-blue-700 border-blue-200",
    default: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const boxClass = intentStyles[status.type] || intentStyles.default;

  const footer = (
    <div className="flex flex-col space-y-2 text-xs text-gray-500 dark:text-gray-400">
      <p className="font-medium text-gray-600 dark:text-gray-300">
        Trouble verifying?
      </p>
      <ul className="list-disc ml-4 space-y-1">
        <li>Check spam/junk folder</li>
        <li>Links expire after 24h</li>
        <li>Use the original device/browser if possible</li>
      </ul>
      <div className="flex justify-between pt-1">
        <Link to="/register" className="text-blue-600 hover:text-blue-500">
          Register
        </Link>
        <Link to="/support" className="text-blue-600 hover:text-blue-500">
          Support
        </Link>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Verify Email"
      subtitle={
        status.type === "loading"
          ? "We are confirming your email ownership."
          : "Complete this step to unlock your account."
      }
      icon={<EnvelopeIcon className="h-6 w-6 text-white" aria-hidden="true" />}
      footer={footer}
    >
      {/* Status */}
      <div
        className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed ${boxClass}`}
        role="status"
        aria-live="polite"
      >
        <StatusIcon />
        <p className="font-medium">{status.message}</p>
      </div>

      {/* Email input (only when we need to resend and no email passed) */}
      {(status.type === "expired" || status.type === "error") && !userEmail && (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
            Email address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-8 pr-3 py-2 rounded-md text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-1">
        {["success", "already_verified"].includes(status.type) && (
          <Link
            to="/login?verified=true"
            className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 transition-colors"
          >
            Continue to login <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}

        {(status.type === "expired" || status.type === "error") && (
          <button
            onClick={handleResendVerification}
            disabled={resendLoading || resendCooldown > 0 || !userEmail}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 transition-colors"
          >
            {resendLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {!resendLoading && resendCooldown > 0 && (
              <ClockIcon className="h-4 w-4" />
            )}
            {resendLoading
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification email"}
          </button>
        )}

        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 transition-colors"
        >
          Return to login
        </Link>
      </div>
    </AuthLayout>
  );
}
