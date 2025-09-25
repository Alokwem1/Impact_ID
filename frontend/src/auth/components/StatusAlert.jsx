import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * Contextual alert (success / error / info) with consistent styling.
 */
export default function StatusAlert({
  type = "info",
  children,
  className = "",
  compact = false,
}) {
  const variants = {
    success: {
      base: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200",
      Icon: CheckCircleIcon,
    },
    error: {
      base: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200",
      Icon: ExclamationTriangleIcon,
    },
    info: {
      base: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200",
      Icon: InformationCircleIcon,
    },
  };
  const { base, Icon } = variants[type] || variants.info;
  return (
    <div
      className={`flex items-start space-x-2 p-${compact ? "3" : "4"} border rounded-lg text-sm ${base} ${className}`}
      role={type === "error" ? "alert" : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="leading-relaxed text-xs md:text-sm">{children}</div>
    </div>
  );
}
