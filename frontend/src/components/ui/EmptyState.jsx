import React from "react";
import emptySvg from "../../assets/placeholders/empty-state.svg";

export default function EmptyState({
  title = "Nothing here yet",
  description = "When there’s content to show, it will appear here.",
  illustration = emptySvg,
  action = null,
  className = "",
}) {
  return (
    <div className={`rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 bg-white dark:bg-slate-800 text-center ${className}`}>
      <div className="mx-auto mb-4" style={{maxWidth: 240}}>
        <img src={illustration} alt="Empty" className="w-full h-auto opacity-90 dark:opacity-100" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
