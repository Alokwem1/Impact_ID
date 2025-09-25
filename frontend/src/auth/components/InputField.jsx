import React from "react";

/**
 * Generic accessible text input with leading icon + optional right adornment.
 * Keeps a tight visual footprint for auth forms.
 */
export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon, // JSX element (heroicon)
  error,
  successMessage,
  hint,
  autoComplete,
  optional = false,
  disabled = false,
  rightAdornment = null,
  className = "",
}) {
  const baseClasses =
    "w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-gray-800 border rounded-md focus:outline-none focus:ring-2 transition-colors";
  const stateClasses = error
    ? "border-red-300 focus:ring-red-500"
    : successMessage
      ? "border-green-300 focus:ring-green-500"
      : "border-gray-300 focus:ring-blue-500";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}{" "}
          {optional && (
            <span className="text-gray-400 text-xs" aria-label="optional">
              (optional)
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
            /* Intentionally not spreading rest to keep a tight surface */
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${name}-error`
              : hint
                ? `${name}-hint`
                : undefined
          }
          className={`${baseClasses} ${stateClasses}`}
        />
        {rightAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
      {!error && successMessage && (
        <p className="text-green-600 text-xs mt-1">{successMessage}</p>
      )}
      {!error && !successMessage && hint && (
        <p id={`${name}-hint`} className="text-gray-500 text-[11px] mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
