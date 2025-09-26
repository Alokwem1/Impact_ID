import React from "react";

export default function SectionHeader({ title, subtitle = null, action = null, className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
