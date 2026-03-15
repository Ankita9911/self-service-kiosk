interface Props {
  tab: "READY" | "ALL";
  readyCount: number;
  totalCount: number;
  onChange: (tab: "READY" | "ALL") => void;
}

export function PickupTabs({ tab, readyCount, totalCount, onChange }: Props) {
  return (
    <div className="bg-white dark:bg-[#161920] border-b border-slate-100 dark:border-white/6 px-6 py-2.5">
      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl p-1">
        {[
          {
            value: "READY" as const,
            label: "Ready for Pickup",
            count: readyCount,
            activeCls: "text-emerald-700 dark:text-emerald-300",
            badgeCls: "bg-emerald-500",
          },
          {
            value: "ALL" as const,
            label: "All Active",
            count: totalCount,
            activeCls: "text-indigo-700 dark:text-indigo-300",
            badgeCls: "bg-indigo-500",
          },
        ].map(({ value, label, count, activeCls, badgeCls }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`
              flex items-center gap-2 px-4 h-8 rounded-lg text-sm font-semibold transition-all
              ${
                tab === value
                  ? `bg-white dark:bg-[#1a1d26] shadow-sm ${activeCls}`
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }
            `}
          >
            {label}
            {count > 0 && (
              <span
                className={`${badgeCls} text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
