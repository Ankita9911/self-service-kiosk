import { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { getDevices, createDevice } from "@/services/device.service";
import { getOutlets } from "@/services/outlet.service";
import type { Device } from "@/types/device.types";
import type { Outlet } from "@/types/outlet.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Activity,
  Plus,
  Search,
  RefreshCcw,
  Monitor,
  ShieldAlert,
  Copy,
  Check,
  KeyRound,
  X,
  Cpu,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      {isActive
        ? <Wifi className="w-3 h-3" />
        : <WifiOff className="w-3 h-3" />}
      {status}
    </span>
  );
}

/* ── Secret reveal box ── */
function SecretRevealModal({
  secret,
  onClose,
}: {
  secret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-clash-bold text-white text-base">Device Created!</h3>
              <p className="text-emerald-100 text-xs font-satoshi">Save this secret — it won't be shown again</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-emerald-400 break-all leading-relaxed border border-slate-800 relative">
            {secret}
            <button
              onClick={copy}
              className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-clash-semibold text-slate-300 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-satoshi text-amber-700 leading-relaxed">
              This secret is used to authenticate the kiosk device. Store it securely — it cannot be recovered once this dialog is closed.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-colors"
          >
            I've saved the secret
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Create Device Modal ── */
function CreateDeviceModal({
  open,
  onClose,
  outlets,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  outlets: Outlet[];
  onCreated: (secret: string) => void;
}) {
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Register Kiosk Device</h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">Assign device to an outlet</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {/* Outlet select */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
              Outlet <span className="text-red-400">*</span>
            </label>
            <select
              value={form.outletId}
              onChange={(e) => setForm({ ...form, outletId: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
            >
              <option value="">Select an outlet…</option>
              {outlets.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.outletCode})
                </option>
              ))}
            </select>
          </div>

          {/* Device name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
              Device Name <span className="text-slate-400 font-satoshi normal-case">(optional)</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Counter 1 Kiosk"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.outletId}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <><Plus className="w-4 h-4" /> Register Device</>
              )}
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

  async function fetchData(silent = false) {
    if (!canView) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [deviceList, outletList] = await Promise.all([
        getDevices(),
        canCreate ? getOutlets() : Promise.resolve([]),
      ]);
      setDevices(deviceList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const filtered = devices.filter((d) => {
    const matchSearch =
      d.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = devices.filter((d) => d.status === "ACTIVE").length;

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
          <div className="flex items-baseline gap-3">
            <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">Device Management</h1>
            {!loading && (
              <span className="text-sm font-satoshi text-slate-400">{devices.length} devices · {activeCount} online</span>
            )}
          </div>
          <p className="text-sm font-satoshi text-slate-500 mt-0.5">Monitor and register kiosk hardware across outlets.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all"
          >
            <RefreshCcw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
          {canCreate && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Register Device
            </button>
          )}
        </div>
      </div>

      {/* ── Stat pills ── */}
      {!loading && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total Devices", value: devices.length, color: "bg-slate-100 text-slate-700" },
            { label: "Online", value: activeCount, color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
            { label: "Offline", value: devices.length - activeCount, color: "bg-red-50 text-red-600 border border-red-200" },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-clash-semibold ${s.color}`}>
              {s.value} <span className="font-satoshi font-normal text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + Filter bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by device ID or name…"
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
              {["Device ID", "Name", "Outlet", "Status", "Last Seen"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-5 py-4">
                      <Shimmer className={`h-4 ${j === 1 ? "w-32" : j === 4 ? "w-16" : "w-24"}`} />
                    </td>
                  ))}
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
                    <p className="font-satoshi text-slate-400 text-sm">
                      {searchTerm ? "Try a different search term" : "Register your first device to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d._id} className="group hover:bg-orange-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-[13px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {d.deviceId}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-satoshi text-sm text-slate-700">
                    {d.name || <span className="text-slate-400 italic">Unnamed</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-satoshi text-sm text-slate-600">
                      {outlets.find((o) => o._id === d.outletId)?.name || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-4 font-satoshi text-sm text-slate-400">
                    {d.lastSeenAt
                      ? new Date(d.lastSeenAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                      : <span className="italic">Never</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-satoshi text-slate-400">
              Showing {filtered.length} of {devices.length} devices
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <CreateDeviceModal
        open={open}
        onClose={() => setOpen(false)}
        outlets={outlets}
        onCreated={(s) => setCreatedSecret(s)}
      />

      {createdSecret && (
        <SecretRevealModal
          secret={createdSecret}
          onClose={() => { setCreatedSecret(null); fetchData(true); }}
        />
      )}
    </div>
  );
}