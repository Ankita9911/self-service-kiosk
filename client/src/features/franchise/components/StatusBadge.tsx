interface Props {
  status?: string;
}

export function StatusBadge({ status }: Props) {
  const s      = status || "INACTIVE";
  const active = s === "ACTIVE";

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
      ${active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
        : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/[0.05] dark:text-slate-400 dark:border-white/[0.08]"
      }
    `}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-slate-400 dark:bg-slate-600"}`} />
      {s}
    </span>
  );
}