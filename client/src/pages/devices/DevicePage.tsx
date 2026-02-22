import { useEffect, useState, useRef } from "react";
import { usePermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { getDevices, createDevice } from "@/services/device.service";
import { getOutlets } from "@/services/outlet.service";
import type { Device } from "@/types/device.types";
import type { Outlet } from "@/types/outlet.types";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TablePagination } from "@/components/ui/TablePagination";
import { Input } from "@/components/ui/input";

import {
  Activity, Plus, Search, RefreshCcw, Monitor, ShieldAlert,
  Copy, Check, KeyRound, X, Cpu, Wifi, WifiOff, MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Shimmer cell ── */
function ShimmerCell({ w = "w-24" }: { w?: string }) {
  return (
    <td className="px-5 py-4">
      <div className={cn("relative overflow-hidden bg-slate-100 rounded-lg h-4", w)}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      </div>
    </td>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {isActive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isActive ? "Online" : "Offline"}
    </span>
  );
}

/* ── Secret reveal modal ── */
function SecretRevealModal({ secret, onClose }: { secret: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center"><KeyRound className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="font-clash-bold text-white text-base">Device Created!</h3>
              <p className="text-emerald-100 text-xs font-satoshi">Save this secret — it won't be shown again</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-emerald-400 break-all leading-relaxed border border-slate-800 relative">
            {secret}
            <button onClick={copy} className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-clash-semibold text-slate-300 transition-all">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-satoshi text-amber-700 leading-relaxed">This secret authenticates the kiosk device. Store it securely — it cannot be recovered once this dialog is closed.</p>
          </div>
          <button onClick={onClose} className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-colors">I've saved the secret</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Create Device Modal ── */
function CreateDeviceModal({ open, onClose, outlets, onCreated }: { open: boolean; onClose: () => void; outlets: Outlet[]; onCreated: (secret: string) => void }) {
  const [form, setForm] = useState({ outletId: "", name: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.outletId) return;
    setSubmitting(true);
    try {
      const result = await createDevice({ outletId: form.outletId, name: form.name || undefined });
      setForm({ outletId: "", name: "" });
      onClose();
      onCreated(result.secret);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Register Kiosk Device</h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">Assign device to an outlet</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Outlet <span className="text-red-400">*</span></label>
            <select value={form.outletId} onChange={e => setForm({ ...form, outletId: e.target.value })} required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all">
              <option value="">Select an outlet…</option>
              {outlets.map(o => <option key={o._id} value={o._id}>{o.name} ({o.outletCode})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Device Name <span className="text-slate-400 font-satoshi normal-case">(optional)</span></label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Counter 1 Kiosk"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting || !form.outletId}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Register Device</>}
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
export default function DevicePage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission(PERMISSIONS.DEVICE_VIEW);
  const canCreate = hasPermission(PERMISSIONS.DEVICE_CREATE);

  const [devices, setDevices] = useState<Device[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function fetchData(silent = false) {
    if (!canView) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [deviceList, outletList] = await Promise.all([
        getDevices(),
        getOutlets(),
      ]);
      setDevices(deviceList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const filtered = devices.filter(d => {
    const matchSearch =
      (d.deviceId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (d.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const activeCount = devices.filter(d => d.status === "ACTIVE").length;

  // Helper: resolve outlet name from either outletId or nested outlet object
  function getOutletName(d: Device): string {
    // Try nested outlet object first (if API populates it)
    if ((d as any).outlet?.name) return (d as any).outlet.name;
    // Fall back to looking up by outletId in outlets array
    const found = outlets.find(o => o._id === (d.outletId || (d as any).outlet));
    return found?.name || "—";
  }

  // Helper: format lastSeenAt
  function formatLastSeen(d: Device): string {
    const ts = (d as any).lastSeenAt || (d as any).lastSeen || (d as any).last_seen;
    if (!ts) return "Never";
    return new Date(ts).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  const showShimmer = loading || refreshing;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300" />
        <p className="font-clash-semibold text-slate-600">Access Restricted</p>
        <p className="font-satoshi text-slate-400 text-sm">You don't have permission to view devices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">Kiosks</span>
          </div>
          {/* No inline counts — shown in pills below */}
          <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">Device Management</h1>
          <p className="text-sm font-satoshi text-slate-500 mt-0.5">Monitor and register kiosk hardware across outlets.</p>
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
          {canCreate && (
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all">
              <Plus className="w-4 h-4" /> Register Device
            </button>
          )}
        </div>
      </div>

      {/* ── Stat pills only ── */}
      <div className="flex flex-wrap gap-2">
        {showShimmer ? (
          [80, 72, 72].map((w, i) => (
            <div key={i} className="relative overflow-hidden bg-slate-100 rounded-lg h-8" style={{ width: w }}>
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          ))
        ) : (
          [
            { label: "Total", value: devices.length, cls: "bg-slate-100 text-slate-700 border-slate-200" },
            { label: "Online", value: activeCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Offline", value: devices.length - activeCount, cls: "bg-red-50 text-red-600 border-red-200" },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-clash-semibold border ${s.cls}`}>
              {s.value} <span className="font-satoshi font-normal text-xs opacity-70">{s.label}</span>
            </div>
          ))
        )}
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by device ID or name…" className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 h-10 rounded-xl text-xs font-clash-semibold transition-all ${statusFilter === s ? "bg-orange-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {s === "ALL" ? "All" : s === "ACTIVE" ? "Online" : "Offline"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["Device ID", "Name", "Outlet", "Status", "Last Seen"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <ShimmerCell w="w-28" />
                  <ShimmerCell w="w-24" />
                  <ShimmerCell w="w-32" />
                  <ShimmerCell w="w-16" />
                  <ShimmerCell w="w-28" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="font-clash-semibold text-slate-600">No devices found</p>
                    <p className="font-satoshi text-slate-400 text-sm">{searchTerm ? "Try a different search term" : "Register your first device to get started"}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(d => (
                <tr key={d._id} className="group hover:bg-orange-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-[13px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{d.deviceId}</span>
                  </td>
                  <td className="px-5 py-4 font-satoshi text-sm text-slate-700">
                    {d.name || <span className="text-slate-400 italic">Unnamed</span>}
                  </td>
                  <td className="px-5 py-4 font-satoshi text-sm text-slate-600">
                    {getOutletName(d)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-4 font-satoshi text-sm text-slate-400">
                    {formatLastSeen(d)}
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

      {/* ── Modals ── */}
      <CreateDeviceModal open={open} onClose={() => setOpen(false)} outlets={outlets} onCreated={s => setCreatedSecret(s)} />
      {createdSecret && <SecretRevealModal secret={createdSecret} onClose={() => { setCreatedSecret(null); fetchData(true); }} />}

      <style>{`@keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(250%); } }`}</style>
    </div>
  );
}