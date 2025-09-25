import React, { useState, useMemo } from "react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";

/**
 * Password field with show/hide + optional strength meter.
 */
export default function PasswordField({
  name = "password",
  label = "Password",
  value,
  onChange,
  placeholder = "Enter password",
  error,
  autoComplete = "new-password",
  showStrength = true,
  compareTo, // string to compare (confirm password scenario)
  onMatchStateChange,
}) {
  const [show, setShow] = useState(false);

  const strength = useMemo(() => {
    if (!value)
      return { strength: 0, label: "", color: "", criteria: {}, password: value };
    const criteria = {
      length: value.length >= 8,
      lowercase: /[a-z]/.test(value),
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[^a-zA-Z\d]/.test(value),
    };
    const score = Object.values(criteria).filter(Boolean).length;
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];
    return {
      strength: score,
      label: labels[score - 1] || "",
      color: colors[score - 1] || "",
      criteria,
    };
  }, [value]);

  const isMatch = compareTo !== undefined && value && compareTo === value;

  // Notify parent if match state changes
  React.useEffect(() => {
    if (onMatchStateChange) onMatchStateChange(isMatch);
  }, [isMatch, onMatchStateChange]);

  const baseClasses =
    "w-full pl-10 pr-11 py-2.5 text-sm bg-white dark:bg-gray-800 border rounded-md focus:outline-none focus:ring-2 transition-colors";
  const stateClasses = error
    ? "border-red-300 focus:ring-red-500"
    : isMatch
      ? "border-green-300 focus:ring-green-500"
      : "border-gray-300 focus:ring-blue-500";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LockClosedIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={name}
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseClasses} ${stateClasses}`}
          autoComplete={autoComplete}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 space-y-1">
          <div className="flex h-1.5 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`flex-1 mx-0.5 rounded ${lvl <= strength.strength ? strength.color : "bg-transparent"}`}
              />
            ))}
          </div>
          <p className="text-[11px] tracking-wide uppercase font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Password Strength</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              {strength.label}
            </span>
          </p>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {isMatch && !error && (
        <p className="text-green-600 text-xs mt-1">Passwords match!</p>
      )}
    </div>
  );
}
