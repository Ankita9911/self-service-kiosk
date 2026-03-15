import { PackageCheck, ClipboardList } from "lucide-react";

interface PickupEmptyStateProps {
  type: "READY" | "ALL";
}

export function PickupEmptyState({ type }: PickupEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/6 shadow-sm flex items-center justify-center">
        {type === "READY" ? (
          <PackageCheck className="w-7 h-7 text-slate-300 dark:text-slate-600" />
        ) : (
          <ClipboardList className="w-7 h-7 text-slate-300 dark:text-slate-600" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {type === "READY" ? "No orders ready yet" : "No active orders"}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {type === "READY"
            ? "Kitchen is still preparing…"
            : "Waiting for new orders from kiosk"}
        </p>
      </div>
    </div>
  );
}
