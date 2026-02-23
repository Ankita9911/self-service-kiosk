import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import { getOutlets, createOutlet, updateOutlet, deleteOutlet } from "@/features/outlet/services/outlet.service";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Input } from "@/shared/components/ui/input";
import {
  Store, Plus, Search, MapPin, 
  RefreshCcw, Building, ShieldAlert,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { usePermission } from "@/shared/hooks/usePermissions";
import { ShimmerCell } from "../components/ShimmerCell";
import { StatusBadge } from "../components/StatusBadge";
import { RowMenu } from "../components/RowMenu";
import { DeleteModal } from "../components/DeleteOutletModal";
import { OutletModal } from "../components/OutletModal";

export default function OutletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canViewOutlet = hasPermission(PERMISSIONS.OUTLET_VIEW);
  const canCreateOutlet = hasPermission(PERMISSIONS.OUTLET_CREATE);
  const canUpdateOutlet = hasPermission(PERMISSIONS.OUTLET_UPDATE);
  const canDeleteOutlet = hasPermission(PERMISSIONS.OUTLET_DELETE);
  const canManageMenu = hasPermission(PERMISSIONS.MENU_MANAGE);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Outlet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Outlet | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function fetchData(silent = false) {
    if (!canViewOutlet) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const outletData = await getOutlets();
      setOutlets(outletData);
      if (isSuperAdmin) { const franchiseData = await getFranchises(); setFranchises(franchiseData); }
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit(form: { franchiseId: string; name: string; outletCode: string; address: string }) {
    if (editing) await updateOutlet(editing._id, form);
    else await createOutlet(form);
    setOpen(false); setEditing(null); fetchData(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteOutlet(deleteTarget._id);
    setDeleteTarget(null); fetchData(true);
  }

  const filtered = outlets.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.outletCode.toLowerCase().includes(searchTerm.toLowerCase()) || (o.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const activeCount = outlets.filter(o => o.status === "ACTIVE").length;
  const showShimmer = loading || refreshing;
  const colCount = isSuperAdmin ? 5 : 4;

  if (!canViewOutlet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300" />
        <p className="font-clash-semibold text-slate-600">Access Restricted</p>
        <p className="font-satoshi text-slate-400 text-sm">You don't have permission to view outlets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">Operations</span>
          </div>
          <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">Outlet Management</h1>
          <p className="text-sm font-satoshi text-slate-500 mt-0.5">Manage physical kiosk locations and their details.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Refresh"
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
          {canCreateOutlet && (
            <button onClick={() => { setEditing(null); setOpen(true); }} className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all">
              <Plus className="w-4 h-4" /> Create Outlet
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {showShimmer ? (
          [80, 72, 80].map((w, i) => (
            <div key={i} className="relative overflow-hidden bg-slate-100 rounded-lg h-8" style={{ width: w }}>
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          ))
        ) : (
          [
            { label: "Total", value: outlets.length, cls: "bg-slate-100 text-slate-700 border-slate-200" },
            { label: "Active", value: activeCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Inactive", value: outlets.length - activeCount, cls: "bg-slate-50 text-slate-400 border-slate-200" },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-clash-semibold border ${s.cls}`}>
              {s.value} <span className="font-satoshi font-normal text-xs opacity-70">{s.label}</span>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name, code or address…" className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 h-10 rounded-xl text-xs font-clash-semibold transition-all ${statusFilter === s ? "bg-orange-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm ">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["Outlet", "Code", ...(isSuperAdmin ? ["Franchise"] : []), "Status", "Actions"].map((h, i) => (
                <th key={i} className={cn("px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider", (h === "" || h === "Actions") && "w-10")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <ShimmerCell w="w-36" />
                  <ShimmerCell w="w-20" />
                  {isSuperAdmin && <ShimmerCell w="w-28" />}
                  <ShimmerCell w="w-16" />
                  <ShimmerCell w="w-6" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center"><Store className="w-5 h-5 text-slate-400" /></div>
                    <p className="font-clash-semibold text-slate-600">No outlets found</p>
                    <p className="font-satoshi text-slate-400 text-sm">{searchTerm ? "Try adjusting your search" : "Create your first outlet to get started"}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(o => (
                <tr key={o._id} className="group hover:bg-orange-50/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-clash-semibold text-slate-800 text-sm">{o.name}</p>
                    {o.address && (
                      <p className="flex items-center gap-1 text-xs font-satoshi text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />{o.address}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[13px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{o.outletCode}</span>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-satoshi text-sm text-slate-600">{franchises.find(f => f._id === o.franchiseId)?.name || "—"}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-4">
                    <RowMenu
                      showEdit={canUpdateOutlet} showDelete={canDeleteOutlet} showMenu={canManageMenu}
                      onEdit={() => { setEditing(o); setOpen(true); }}
                      onDelete={() => setDeleteTarget(o)}
                      onMenu={() => navigate(`/outlets/${o._id}/menu`)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!showShimmer && filtered.length > 0 && (
          <TablePagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
        )}
      </div>

      <OutletModal open={open} onClose={() => { setOpen(false); setEditing(null); }} editing={editing} franchises={franchises} isSuperAdmin={isSuperAdmin} onSubmit={handleSubmit} />
      {deleteTarget && <DeleteModal outlet={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(250%); } }
      `}</style>
    </div>
  );
}
