import { Store, ArrowRight, MapPin } from "lucide-react";
import type {
  Outlet,
  OutletAddress,
} from "@/features/outlet/types/outlet.types";

function formatAddress(addr?: OutletAddress): string {
  if (!addr) return "";
  return [addr.line1, addr.city, addr.state, addr.pincode, addr.country]
    .filter(Boolean)
    .join(", ");
}

interface Props {
  outlet: Outlet;
  onClick: () => void;
}

export function OutletSelectionCard({ outlet, onClick }: Props) {
  const isActive = outlet.status?.toLowerCase() === "active";

  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-left w-full"
    >
      <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-800 dark:text-white text-sm leading-snug">
            {outlet.name}
          </p>
          <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-white/8 group-hover:bg-indigo-600 flex items-center justify-center shrink-0 transition-colors mt-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
          {outlet.outletCode}
        </p>

        {formatAddress(outlet.address) && (
          <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {formatAddress(outlet.address)}
          </p>
        )}

        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isActive
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/8"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {outlet.status ?? "Active"}
          </span>
        </div>
      </div>
    </button>
  );
}
