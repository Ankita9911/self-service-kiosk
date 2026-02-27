export function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.08]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-400 dark:bg-slate-500"
        }`}
      />
      {status}
    </span>
  );
}