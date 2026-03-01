import { useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { UtensilsCrossed, Loader2, Search, Building2, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useMenuLanding } from "../hooks/useMenuLanding";
import { OutletSelectionCard } from "../components/OutletSelectionCard";

export default function MenuLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const [search, setSearch] = useState("");

  const { outlets, loading } = useMenuLanding(user, hasPermission);

  const filtered = outlets.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.outletCode.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = outlets.filter(
    (o) => o.status?.toLowerCase() === "active"
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-sm text-slate-400">Loading outlets…</p>
      </div>
    );
  }

  if (user?.role !== "FRANCHISE_ADMIN" && user?.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {/* <div className="flex items-center gap-2 mb-1.5">
            <div className="h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <UtensilsCrossed className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Menu Management
            </span>
          </div> */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Select Outlet
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Choose an outlet to manage its menu. Changes reflect on all kiosks in that outlet.
          </p>
        </div>

        {outlets.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outlets…"
              className="pl-8 pr-3 h-9 text-sm rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161920] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all w-56"
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      {outlets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Outlets", value: outlets.length, icon: Building2, color: "indigo" },
            { label: "Active", value: activeCount, icon: Store, color: "emerald" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.07] shadow-sm"
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                color === "indigo"
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{value}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outlet grid */}
      {outlets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1e2130] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.07]">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-slate-400 dark:text-slate-600" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-white">No outlets found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Create outlets first to manage their menus.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.07]">
          <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-semibold text-slate-600 dark:text-white">No matches</p>
          <p className="text-slate-400 text-sm mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <OutletSelectionCard
              key={o._id}
              outlet={o}
              onClick={() => navigate(`/outlets/${o._id}/menu`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}