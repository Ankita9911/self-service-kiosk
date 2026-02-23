import { Store } from "lucide-react";
import type { Outlet } from "@/features/outlet/types/outlet.types";

interface Props {
  outlet: Outlet;
  onClick: () => void;
}

export function OutletSelectionCard({ outlet, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition-all text-left"
    >
      <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
        <Store className="w-6 h-6 text-orange-600" />
      </div>

      <div>
        <p className="font-semibold text-slate-800">
          {outlet.name}
        </p>
        <p className="text-xs text-slate-500 font-mono">
          {outlet.outletCode}
        </p>
      </div>
    </button>
  );
}