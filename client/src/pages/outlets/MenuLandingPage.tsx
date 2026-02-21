import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { getOutlets } from "@/services/outlet.service";
import type { Outlet } from "@/types/outlet.types";
import { UtensilsCrossed, Store, Loader2 } from "lucide-react";
import { useState } from "react";

export default function MenuLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.MENU_MANAGE)) {
      navigate("/");
      return;
    }
    if (user?.role === "OUTLET_MANAGER" && user?.outletId) {
      navigate(`/outlets/${user.outletId}/menu`, { replace: true });
      return;
    }
    if (user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") {
      getOutlets().then((list) => {
        setOutlets(list);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?.role, user?.outletId, hasPermission, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (user?.role !== "FRANCHISE_ADMIN" && user?.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[11px] font-semibold text-orange-500 uppercase tracking-widest">
            Menu Management
          </span>
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Select Outlet
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Choose an outlet to manage its menu. Changes reflect on all kiosks in that outlet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outlets.map((o) => (
          <button
            key={o._id}
            onClick={() => navigate(`/outlets/${o._id}/menu`)}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition-all text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{o.name}</p>
              <p className="text-xs text-slate-500 font-mono">{o.outletCode}</p>
            </div>
          </button>
        ))}
      </div>

      {outlets.length === 0 && (
        <div className="py-16 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="font-semibold text-slate-600">No outlets</p>
          <p className="text-slate-400 text-sm mt-1">Create outlets first to manage their menus.</p>
        </div>
      )}
    </div>
  );
}
