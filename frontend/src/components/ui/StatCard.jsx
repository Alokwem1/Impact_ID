import React from "react";

export default function StatCard({ label, value, icon = null, hint = null, className = "" }) {
  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon ? <div className="text-slate-500 dark:text-slate-300">{icon}</div> : null}
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50 leading-tight">{value}</div>
          {hint ? <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</div> : null}
        </div>
      </div>
    </div>
  );
}
