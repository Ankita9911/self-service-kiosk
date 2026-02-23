import { cn } from "@/shared/lib/utils";

interface Props {
  status?: string;
}

export function StatusBadge({ status }: Props) {
  const s = status || "PENDING";
  const active = s === "ACTIVE";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border",
        active
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-500 border-slate-200"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        )}
      />
      {s}
    </span>
  );
}