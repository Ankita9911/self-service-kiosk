import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useAuth from "@/shared/hooks/useAuth";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import { getOutlets, createOutlet, updateOutlet, deleteOutlet, setOutletStatus } from "@/features/outlet/services/outlet.service";
import type { OutletAddress } from "@/features/outlet/types/outlet.types";

function formatAddress(addr?: OutletAddress): string {
  if (!addr) return "";
  return [addr.line1, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(", ");
}
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Store, Plus, Search, MapPin,
  RefreshCcw, Building2, ShieldAlert,
  CheckCircle2, XCircle, X, UtensilsCrossed,
} from "lucide-react";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { usePermission } from "@/shared/hooks/usePermissions";
import { ShimmerCell } from "../components/ShimmerCell";
import { StatusBadge } from "../components/StatusBadge";
import { RowMenu } from "../components/RowMenu";
import { DeleteModal } from "../components/DeleteOutletModal";
import { OutletModal } from "../components/OutletModal";
import toast from "react-hot-toast";

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon, label, value, iconBg, loading,
}: {
  icon: React.ReactNode; label: string; value: number; iconBg: string; loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
        <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/6 shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="relative overflow-hidden h-5 w-8 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
          <div className="relative overflow-hidden h-3 w-14 rounded bg-slate-100 dark:bg-white/6">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
      <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OutletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canViewOutlet   = hasPermission(PERMISSIONS.OUTLET_VIEW);
  const canCreateOutlet = hasPermission(PERMISSIONS.OUTLET_CREATE);
  const canUpdateOutlet = hasPermission(PERMISSIONS.OUTLET_UPDATE);
  const canDeleteOutlet = hasPermission(PERMISSIONS.OUTLET_DELETE);
  const canManageMenu   = hasPermission(PERMISSIONS.MENU_MANAGE);
  const isSuperAdmin    = user?.role === "SUPER_ADMIN";

  const [outlets,      setOutlets]      = useState<Outlet[]>([]);
  const [franchises,   setFranchises]   = useState<Franchise[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [open,         setOpen]         = useState(false);
  const [editing,      setEditing]      = useState<Outlet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Outlet | null>(null);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const [franchiseFilter, setFranchiseFilter] = useState<string>("ALL");

  async function fetchData(silent = false) {
    if (!canViewOutlet) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const outletData = await getOutlets();
      setOutlets(outletData);
      if (isSuperAdmin) {
        const franchiseData = await getFranchises();
        setFranchises(franchiseData);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // Live-refresh when a franchise status cascade changes outlet statuses
  useEffect(() => {
    const socketUrl = (() => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      if (!apiUrl) return "http://localhost:3000";
      try { return new URL(apiUrl).origin; } catch { return "http://localhost:3000"; }
    })();
    const socket = io(socketUrl, { withCredentials: true, transports: ["websocket"] });
    socket.on("outlets:refreshNeeded", () => fetchData(true));
    return () => { socket.disconnect(); };
  }, []);

  async function handleSubmit(form: { franchiseId: string; name: string; outletCode: string; address: OutletAddress }) {
    if (editing) await updateOutlet(editing._id, form);
    else await createOutlet(form);
    setOpen(false);
    setEditing(null);
    fetchData(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteOutlet(deleteTarget._id);
      setDeleteTarget(null);
      fetchData(true);
      toast.success("Outlet deleted successfully");
    } catch {
      toast.error("Failed to delete outlet");
    }
  }

  async function handleToggleStatus(o: Outlet) {
    const newStatus = o.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await setOutletStatus(o._id, newStatus);
      fetchData(true);
    } catch {
      toast.error("Failed to update outlet status");
    }
  }

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return outlets.filter((o) => {
      const matchSearch =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.outletCode.toLowerCase().includes(q) ||
        formatAddress(o.address).toLowerCase().includes(q);
      const matchStatus    = statusFilter === "ALL" || o.status === statusFilter;
      const matchFranchise = franchiseFilter === "ALL" || o.franchiseId === franchiseFilter;
      return matchSearch && matchStatus && matchFranchise;
    });
  }, [outlets, searchTerm, statusFilter, franchiseFilter]);

  const handleSearchChange   = (v: string) => { setSearchTerm(v); setPage(1); };
  const handleStatusChange   = (v: "ALL" | "ACTIVE" | "INACTIVE") => { setStatusFilter(v); setPage(1); };
  const handleFranchiseChange = (v: string) => { setFranchiseFilter(v); setPage(1); };

  const isFiltered =
    searchTerm !== "" ||
    statusFilter !== "ALL" ||
    (isSuperAdmin && franchiseFilter !== "ALL");

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setFranchiseFilter("ALL");
    setPage(1);
  };

  const activeCount   = outlets.filter((o) => o.status === "ACTIVE").length;
  const inactiveCount = outlets.length - activeCount;
  const showShimmer   = loading || refreshing;
  const colCount      = isSuperAdmin ? 6 : 5;

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!canViewOutlet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-slate-300 dark:text-slate-600" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Access Restricted</p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">You don't have permission to view outlets.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* <div className="flex items-center gap-2 mb-1.5"> */}
              {/* <div className="h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Store className="w-3 h-3 text-indigo-500" />
              </div>
              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-[0.15em]">
                Outlet Directory
              </span> */}
            {/* </div> */}
            <h1 className="text-[26px] font-bold text-slate-800 dark:text-white tracking-tight leading-none">
              Locations
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              title="Refresh"
              className="
                h-9 w-9 rounded-xl
                bg-white dark:bg-[#161920]
                border border-slate-100 dark:border-white/8
                flex items-center justify-center
                text-slate-400 dark:text-slate-500
                hover:text-indigo-500 dark:hover:text-indigo-400
                hover:border-indigo-200 dark:hover:border-indigo-500/30
                transition-all disabled:opacity-50
              "
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {canCreateOutlet && (
              <button
                onClick={() => { setEditing(null); setOpen(true); }}
                className="
                  flex items-center gap-2 h-9 px-4 rounded-xl
                  bg-indigo-600 hover:bg-indigo-700
                  text-white text-[13px] font-semibold
                  shadow-lg shadow-indigo-500/20
                  transition-all
                "
              >
                <Plus className="w-3.5 h-3.5" />
                New Outlet
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill loading={showShimmer} value={outlets.length} label="Total Outlets"
            iconBg="bg-indigo-50 dark:bg-indigo-500/10"
            icon={<Store className="w-4 h-4 text-indigo-500" />} />
          <StatPill loading={showShimmer} value={activeCount} label="Active"
            iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
          <StatPill loading={showShimmer} value={inactiveCount} label="Inactive"
            iconBg="bg-slate-50 dark:bg-white/[0.05]"
            icon={<XCircle className="w-4 h-4 text-slate-400" />} />
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, code or address…"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="
                w-full h-9 pl-9 pr-9 rounded-xl
                bg-white dark:bg-[#161920]
                border border-slate-100 dark:border-white/8
                text-[13px] text-slate-700 dark:text-slate-200
                placeholder:text-slate-400 dark:placeholder:text-slate-600
                focus:outline-none
                focus:border-indigo-400 dark:focus:border-indigo-500/60
                focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10
                transition-all
              "
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors"
              >
                <X className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
              </button>
            )}
          </div>
          {isSuperAdmin && franchises.length > 0 && (
            <Select value={franchiseFilter} onValueChange={handleFranchiseChange}>
              <SelectTrigger className="h-9 w-45 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate min-w-0 flex-1">
                    <SelectValue placeholder="All Franchises" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26] max-w-50">
                <SelectItem value="ALL" className="text-[13px] rounded-lg px-2 py-1.5">
                  All Franchises
                </SelectItem>
                {franchises.map((f) => (
                  <SelectItem key={f._id} value={f._id} className="text-[13px] rounded-lg px-2 py-1.5">
                    <span className="truncate block max-w-40">{f.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Status toggle */}
          <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`
                  px-3 h-7 rounded-lg text-[12px] font-semibold transition-all
                  ${statusFilter === s
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  }
                `}
              >
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all shrink-0"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/60 dark:bg-white/2">
                {["Outlet", "Code", ...(isSuperAdmin ? ["Franchise"] : []), "Address", "Status", ""].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-white/4">
              {showShimmer ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <ShimmerCell w="w-36" />
                    <ShimmerCell w="w-20" />
                    {isSuperAdmin && <ShimmerCell w="w-28" />}
                    <ShimmerCell w="w-40" />
                    <ShimmerCell w="w-16" />
                    <ShimmerCell w="w-6" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6 flex items-center justify-center">
                        <Store className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-400">
                          {searchTerm ? "No outlets match your search" : "No outlets yet"}
                        </p>
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {searchTerm ? "Try adjusting your search or filters" : "Create your first outlet to get started"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * pageSize, page * pageSize).map((o) => (
                  <tr key={o._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Store className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{o.name}</p>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11.5px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/7 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/8">
                        {o.outletCode}
                      </span>
                    </td>

                    {/* Franchise (super admin only) */}
                    {isSuperAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="text-[12.5px] text-slate-500 dark:text-slate-400">
                            {franchises.find((f) => f._id === o.franchiseId)?.name ?? "—"}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Address */}
                    <td className="px-5 py-4">
                      {o.address && formatAddress(o.address) ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400 min-w-0">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                            <span className="truncate max-w-32">{formatAddress(o.address)}</span>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="shrink-0 h-5 px-1.5 rounded-md text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                                View
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="top"
                              align="start"
                              className="w-64 p-0 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26] shadow-xl"
                            >
                              <div className="px-4 py-3 border-b border-slate-50 dark:border-white/6 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Full Address</p>
                              </div>
                              <div className="px-4 py-3 space-y-1.5">
                                {o.address?.line1 && (
                                  <p className="text-[12.5px] text-slate-700 dark:text-slate-200">{o.address.line1}</p>
                                )}
                                {(o.address?.city || o.address?.state) && (
                                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                                    {[o.address.city, o.address.state].filter(Boolean).join(", ")}
                                  </p>
                                )}
                                {o.address?.pincode && (
                                  <p className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{o.address.pincode}</p>
                                )}
                                {o.address?.country && (
                                  <p className="text-[12px] text-slate-400 dark:text-slate-500">{o.address.country}</p>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-300 dark:text-slate-600 italic">No address</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={o.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5">
                        {canManageMenu && (
                          <button
                            onClick={() => navigate(`/outlets/${o._id}/menu`)}
                            title="Manage Menu"
                            className="
                              opacity-0 group-hover:opacity-100
                              h-7 px-2.5 rounded-lg flex items-center gap-1.5
                              text-[11px] font-semibold
                              text-indigo-600 dark:text-indigo-400
                              bg-indigo-50 dark:bg-indigo-500/10
                              hover:bg-indigo-100 dark:hover:bg-indigo-500/20
                              border border-indigo-100 dark:border-indigo-500/20
                              transition-all
                            "
                          >
                            <UtensilsCrossed className="w-3 h-3" />
                            Menu
                          </button>
                        )}
                        <RowMenu
                          showEdit={canUpdateOutlet}
                          showDelete={canDeleteOutlet}
                          showMenu={canManageMenu}
                          showToggleStatus={canUpdateOutlet}
                          status={o.status}
                          onEdit={() => { setEditing(o); setOpen(true); }}
                          onDelete={() => setDeleteTarget(o)}
                          onMenu={() => navigate(`/outlets/${o._id}/menu`)}
                          onToggleStatus={() => handleToggleStatus(o)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!showShimmer && filtered.length > 0 && (
            <div className="border-t border-slate-50 dark:border-white/5">
              <TablePagination
                total={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <OutletModal
        open={open}
        editing={editing}
        franchises={franchises}
        isSuperAdmin={isSuperAdmin}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      {deleteTarget && (
        <DeleteModal
          outlet={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
