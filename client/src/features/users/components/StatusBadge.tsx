export function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border ${
      isActive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-50 text-slate-500 border-slate-200"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        isActive ? "bg-emerald-500" : "bg-slate-400"
      }`} />
      {status}
    </span>
  );
}