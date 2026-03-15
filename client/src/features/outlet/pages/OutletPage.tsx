import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getSocketUrl } from "@/shared/lib/socket";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { getOutletsPage, createOutlet, updateOutlet, deleteOutlet, setOutletStatus } from "@/features/outlet/services/outlet.service";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ShimmerCell } from "../components/ShimmerCell";
import { StatusBadge } from "../components/StatusBadge";
import { RowMenu } from "../components/RowMenu";
import { OutletStats } from "../components/OutletStats";
import { DeleteModal } from "../components/DeleteOutletModal";
import { OutletModal } from "../components/OutletModal";
import type { Outlet, OutletAddress } from "@/features/outlet/types/outlet.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import {
  Store, Plus, Search, MapPin,
  RefreshCcw, Building2, ShieldAlert, X, UtensilsCrossed,
} from "lucide-react";
import toast from "react-hot-toast";

function formatAddress(addr?: OutletAddress): string {
  if (!addr) return "";
  return [addr.line1, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(", ");
}

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

  const [outlets, setOutlets]           = useState<Outlet[]>([]);
  const [franchises, setFranchises]     = useState<Franchise[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [franchiseFilter, setFranchiseFilter] = useState<string>("ALL");
  const [open, setOpen]                 = useState(false);
  const [editing, setEditing]           = useState<Outlet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Outlet | null>(null);
  const [pageSize, setPageSize]         = useState(10);
  const [totalOutlets, setTotalOutlets] = useState(0);
  const [activeOutlets, setActiveOutlets] = useState(0);
  const [totalMatching, setTotalMatching] = useState(0);
  const [cursorStack, setCursorStack]   = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor]     = useState<string | null>(null);
  const [hasNextPage, setHasNextPage]   = useState(false);
  const [refreshTick, setRefreshTick]   = useState(0);
  const hasLoadedPageRef = useRef(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const page = cursorStack.length;
  const hasPrevPage = page > 1;
  const currentCursor = cursorStack[cursorStack.length - 1] ?? undefined;

  const fetchData = useCallback(async (silent = false) => {
    if (!canViewOutlet) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      if (isSuperAdmin) {
        const franchiseData = await getFranchises();
        setFranchises(franchiseData);
      }
      setRefreshTick((n) => n + 1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canViewOutlet, isSuperAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!canViewOutlet) return;
    let cancelled = false;

    async function fetchFiltered() {
      const firstLoad = !hasLoadedPageRef.current;
      if (!firstLoad) setFilterLoading(true);
      try {
        const result = await getOutletsPage(
          { search: debouncedSearch, status: statusFilter, franchiseId: franchiseFilter },
          { cursor: currentCursor ?? undefined, limit: pageSize },
        );
        if (cancelled) return;
        setOutlets(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalOutlets(result.stats.totalItems);
        setActiveOutlets(result.stats.activeItems);
      } catch {}
      finally {
        if (cancelled) return;
        hasLoadedPageRef.current = true;
        setFilterLoading(false);
        setLoading(false);
        setRefreshing(false);
      }
    }

    fetchFiltered();
    return () => { cancelled = true; };
  }, [canViewOutlet, debouncedSearch, statusFilter, franchiseFilter, currentCursor, pageSize, refreshTick]);

  useEffect(() => {
    const socket = io(getSocketUrl(), { withCredentials: true, transports: ["websocket"] });
    socket.on("outlets:refreshNeeded", () => fetchData(true));
    return () => { socket.disconnect(); };
  }, [fetchData]);

  const resetToFirstPage = () => { setCursorStack([null]); setNextCursor(null); setHasNextPage(false); };
  const goToPrevPage = () => setCursorStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const goToNextPage = () => { if (!hasNextPage || !nextCursor) return; setCursorStack((prev) => [...prev, nextCursor]); };

  async function handleSubmit(form: { franchiseId: string; name: string; outletCode: string; address: OutletAddress }) {
    if (editing) await updateOutlet(editing._id, form);
    else await createOutlet(form);
    setOpen(false);
    setEditing(null);
    resetToFirstPage();
    setRefreshTick((n) => n + 1);
    if (isSuperAdmin) getFranchises().then(setFranchises).catch(() => {});
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteOutlet(deleteTarget._id);
      setDeleteTarget(null);
      toast.success("Outlet deleted successfully");
      resetToFirstPage();
      setRefreshTick((n) => n + 1);
    } catch {
      toast.error("Failed to delete outlet");
    }
  }

  async function handleToggleStatus(o: Outlet) {
    try {
      await setOutletStatus(o._id, o.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
      setRefreshTick((n) => n + 1);
    } catch {
      toast.error("Failed to update outlet status");
    }
  }

  const isFiltered = searchTerm !== "" || statusFilter !== "ALL" || (isSuperAdmin && franchiseFilter !== "ALL");
  const clearFilters = () => { setSearchTerm(""); setStatusFilter("ALL"); setFranchiseFilter("ALL"); resetToFirstPage(); };
  const showShimmer = loading || refreshing || filterLoading;
  const colCount = isSuperAdmin ? 6 : 5;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">Outlets</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor and manage outlets across franchises.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="h-9 w-9 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {canCreateOutlet && (
              <button
                onClick={() => { setEditing(null); setOpen(true); }}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Outlet
              </button>
            )}
          </div>
        </div>

        <OutletStats
          totalOutlets={totalOutlets}
          activeOutlets={activeOutlets}
          loading={showShimmer}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, code or address…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetToFirstPage(); }}
              className="w-full h-9 pl-9 pr-9 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10 transition-all"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(""); resetToFirstPage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors">
                <X className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
              </button>
            )}
          </div>

          {isSuperAdmin && franchises.length > 0 && (
            <Select value={franchiseFilter} onValueChange={(v) => { setFranchiseFilter(v); resetToFirstPage(); }}>
              <SelectTrigger className="h-9 w-45 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate min-w-0 flex-1"><SelectValue placeholder="All Franchises" /></span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26] max-w-50">
                <SelectItem value="ALL" className="text-[13px] rounded-lg px-2 py-1.5">All Franchises</SelectItem>
                {franchises.map((f) => (
                  <SelectItem key={f._id} value={f._id} className="text-[13px] rounded-lg px-2 py-1.5">
                    <span className="truncate block max-w-40">{f.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); resetToFirstPage(); }}
                className={`px-3 h-7 rounded-lg text-[12px] font-semibold transition-all ${statusFilter === s ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"}`}
              >
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all shrink-0">
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/60 dark:bg-white/2">
                {["Outlet", "Code", ...(isSuperAdmin ? ["Franchise"] : []), "Address", "Status", ""].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</th>
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
              ) : outlets.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/4 border border-slate-100 dark:border-white/6 flex items-center justify-center">
                        <Store className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-400">{searchTerm ? "No outlets match your search" : "No outlets yet"}</p>
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{searchTerm ? "Try adjusting your search or filters" : "Create your first outlet to get started"}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                outlets.map((o) => (
                  <tr key={o._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Store className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{o.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11.5px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/7 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/8">{o.outletCode}</span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="text-[12.5px] text-slate-500 dark:text-slate-400">{franchises.find((f) => f._id === o.franchiseId)?.name ?? "—"}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {o.address && formatAddress(o.address) ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400 min-w-0">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                            <span className="truncate max-w-32">{formatAddress(o.address)}</span>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="shrink-0 h-5 px-1.5 rounded-md text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 transition-colors">View</button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="start" className="w-64 p-0 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26] shadow-xl">
                              <div className="px-4 py-3 border-b border-slate-50 dark:border-white/6 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Full Address</p>
                              </div>
                              <div className="px-4 py-3 space-y-1.5">
                                {o.address?.line1 && <p className="text-[12.5px] text-slate-700 dark:text-slate-200">{o.address.line1}</p>}
                                {(o.address?.city || o.address?.state) && <p className="text-[12px] text-slate-500 dark:text-slate-400">{[o.address.city, o.address.state].filter(Boolean).join(", ")}</p>}
                                {o.address?.pincode && <p className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{o.address.pincode}</p>}
                                {o.address?.country && <p className="text-[12px] text-slate-400 dark:text-slate-500">{o.address.country}</p>}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-300 dark:text-slate-600 italic">No address</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5">
                        {canManageMenu && (
                          <button
                            onClick={() => navigate(`/outlets/${o._id}/menu`)}
                            className="opacity-0 group-hover:opacity-100 h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 transition-all"
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

          {!showShimmer && outlets.length > 0 && (
            <div className="border-t border-slate-50 dark:border-white/5">
              <CursorPagination
                total={totalMatching}
                page={page}
                pageSize={pageSize}
                hasPrevPage={hasPrevPage}
                hasNextPage={hasNextPage}
                onPrevPage={goToPrevPage}
                onNextPage={goToNextPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      </div>

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
