import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import type { Outlet } from "@/types/outlet.types";
import type { Franchise } from "@/types/franchise.types";
import {
  getOutlets, createOutlet, updateOutlet, deleteOutlet,
} from "@/services/outlet.service";
import { getFranchises } from "@/services/franchise.service";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Store, Plus, Search, MapPin, Pencil, Trash2,
  RefreshCcw, Building, ShieldAlert, X, AlertTriangle,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/lib/permissions";
import { usePermission } from "@/hooks/usePermissions";

/* ── Shimmer ── */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border ${
      isActive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-50 text-slate-500 border-slate-200"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
      {status || "UNKNOWN"}
    </span>
  );
}

/* ── Delete confirm modal ── */
function DeleteModal({
  outlet,
  onConfirm,
  onCancel,
}: {
  outlet: Outlet;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-sm border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Delete Outlet?</h3>
            <p className="font-satoshi text-slate-500 text-sm mt-1">
              <span className="font-satoshi-medium text-slate-700">{outlet.name}</span> will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-clash-semibold transition-colors shadow-lg shadow-red-500/20">
              Delete Outlet
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Outlet form modal ── */
function OutletModal({
  open,
  onClose,
  editing,
  franchises,
  isSuperAdmin,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing: Outlet | null;
  franchises: Franchise[];
  isSuperAdmin: boolean;
  onSubmit: (form: { franchiseId: string; name: string; outletCode: string; address: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    franchiseId: editing?.franchiseId || "",
    name: editing?.name || "",
    outletCode: editing?.outletCode || "",
    address: editing?.address || "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      franchiseId: editing?.franchiseId || "",
      name: editing?.name || "",
      outletCode: editing?.outletCode || "",
      address: editing?.address || "",
    });
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">
              {editing ? "Edit Outlet" : "Create New Outlet"}
            </h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">
              {editing ? "Update the outlet details below" : "Fill in the details to register a new outlet"}
            </p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                Franchise <span className="text-red-400">*</span>
              </label>
              <select
                value={form.franchiseId}
                onChange={(e) => setForm({ ...form, franchiseId: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
              >
                <option value="">Select a franchise…</option>
                {franchises.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {[
            { key: "name", label: "Outlet Name", placeholder: "e.g. Downtown Branch", required: true },
            { key: "outletCode", label: "Outlet Code", placeholder: "e.g. HK-001", required: true },
            { key: "address", label: "Address", placeholder: "Full street address", required: false },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
                {!required && <span className="text-slate-400 font-satoshi normal-case ml-1">(optional)</span>}
              </label>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required={required}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : editing ? "Save Changes" : "Create Outlet"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════
   Main Page
══════════════════════════════════ */
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

  async function fetchData(silent = false) {
    if (!canViewOutlet) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
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

  async function handleSubmit(form: { franchiseId: string; name: string; outletCode: string; address: string }) {
    if (editing) {
      await updateOutlet(editing._id, form);
    } else {
      await createOutlet(form);
    }
    setOpen(false);
    setEditing(null);
    fetchData(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteOutlet(deleteTarget._id);
    setDeleteTarget(null);
    fetchData(true);
  }

  const filtered = outlets.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.outletCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">Operations</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">Outlet Management</h1>
            {!loading && <span className="text-sm font-satoshi text-slate-400">{outlets.length} locations</span>}
          </div>
          <p className="text-sm font-satoshi text-slate-500 mt-0.5">Manage physical kiosk locations and their details.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all"
          >
            <RefreshCcw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
          {canCreateOutlet && (
            <button
              onClick={() => { setEditing(null); setOpen(true); }}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Outlet
            </button>
          )}
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, code or address…"
            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-10 rounded-xl text-xs font-clash-semibold transition-all ${
                statusFilter === s
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["Outlet", "Code", ...(isSuperAdmin ? ["Franchise"] : []), "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: isSuperAdmin ? 5 : 4 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <Shimmer className={`h-4 ${j === 0 ? "w-36" : j === 4 ? "w-16" : "w-24"}`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? 5 : 4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="font-clash-semibold text-slate-600">No outlets found</p>
                    <p className="font-satoshi text-slate-400 text-sm">
                      {searchTerm ? "Try adjusting your search" : "Create your first outlet to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o._id} className="group hover:bg-orange-50/20 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-clash-semibold text-slate-800 text-sm">{o.name}</p>
                      {o.address && (
                        <p className="flex items-center gap-1 text-xs font-satoshi text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {o.address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[13px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                      {o.outletCode}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-satoshi text-sm text-slate-600">
                          {franchises.find((f) => f._id === o.franchiseId)?.name || "—"}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canManageMenu && (
                        <button
                          onClick={() => navigate(`/outlets/${o._id}/menu`)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Manage Menu"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canUpdateOutlet && (
                        <button
                          onClick={() => { setEditing(o); setOpen(true); }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDeleteOutlet && (
                        <button
                          onClick={() => setDeleteTarget(o)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs font-satoshi text-slate-400">
              Showing {filtered.length} of {outlets.length} outlets
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs font-satoshi text-orange-500 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <OutletModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        editing={editing}
        franchises={franchises}
        isSuperAdmin={isSuperAdmin}
        onSubmit={handleSubmit}
      />

      {deleteTarget && (
        <DeleteModal
          outlet={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}