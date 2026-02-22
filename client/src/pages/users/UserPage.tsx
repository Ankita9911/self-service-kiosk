import { useEffect, useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";

import { createUser, getUsers } from "@/services/user.service";
import { getFranchises } from "@/services/franchise.service";
import { getOutlets } from "@/services/outlet.service";
import type { Franchise } from "@/shared/types/franchise.types";
import type { Outlet } from "@/shared/types/outlet.types";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Input } from "@/shared/components/ui/input";
import { Users, Plus, Search, Copy, Check, KeyRound, X, RefreshCcw, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const OUTLET_SCOPED_ROLES = ["OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF", "KIOSK_DEVICE"];

interface User { _id: string; name: string; email: string; role: string; status: string; }

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  FRANCHISE_ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  OUTLET_MANAGER: "bg-orange-50 text-orange-700 border-orange-200",
  KITCHEN_STAFF: "bg-amber-50 text-amber-700 border-amber-200",
  PICKUP_STAFF: "bg-teal-50 text-teal-700 border-teal-200",
  KIOSK_DEVICE: "bg-slate-100 text-slate-600 border-slate-200",
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border ${style}`}>{role.replace(/_/g, " ")}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

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

/* ── Temp Password Modal ── */
function TempPasswordModal({ password, onClose }: { password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center"><KeyRound className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="font-clash-bold text-white text-base">User Created!</h3>
              <p className="text-orange-100 text-xs font-satoshi">Share this temporary password with the user</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-base text-orange-300 text-center tracking-widest border border-slate-800 relative">
            {password}
            <button onClick={copy} className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-clash-semibold text-slate-300 transition-all">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-satoshi text-amber-700 leading-relaxed">The user must change this password on first login. This is a one-time display.</p>
          </div>
          <button onClick={onClose} className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-colors">Done</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Create User Modal ── */
function CreateUserModal({ open, onClose, currentUser, franchises, outlets, onCreated }: {
  open: boolean; onClose: () => void; currentUser: any; franchises: Franchise[]; outlets: Outlet[]; onCreated: (pw: string) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", role: "", franchiseId: "", outletId: "" });
  const [submitting, setSubmitting] = useState(false);

  const needsFranchise = currentUser?.role === "SUPER_ADMIN" && form.role && form.role !== "SUPER_ADMIN";
  const needsOutlet = form.role && OUTLET_SCOPED_ROLES.includes(form.role);
  const outletsForSelection = currentUser?.role === "SUPER_ADMIN" && form.franchiseId
    ? outlets.filter(o => o.franchiseId === form.franchiseId)
    : outlets;

  const availableRoles = currentUser?.role === "SUPER_ADMIN"
    ? ["SUPER_ADMIN", "FRANCHISE_ADMIN", "OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF"]
    : currentUser?.role === "FRANCHISE_ADMIN"
    ? ["OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF"]
    : ["KITCHEN_STAFF", "PICKUP_STAFF"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const result = await createUser({
        name: form.name, email: form.email, role: form.role,
        ...(needsFranchise && form.franchiseId && { franchiseId: form.franchiseId }),
        ...(needsOutlet && form.outletId && { outletId: form.outletId }),
      });
      setForm({ name: "", email: "", role: "", franchiseId: "", outletId: "" });
      onClose(); onCreated(result.tempPassword);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Create User</h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">A temporary password will be generated</p>
          </div>
          {/* <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button> */}
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "name", label: "Full Name", placeholder: "Jane Smith", type: "text" },
              { key: "email", label: "Email", placeholder: "jane@example.com", type: "email" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">{label} <span className="text-red-400">*</span></label>
                <Input value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder} type={type} required
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400" />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Role <span className="text-red-400">*</span></label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value, franchiseId: "", outletId: "" })} required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all">
              <option value="">Select a role…</option>
              {availableRoles.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          {needsFranchise && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Franchise <span className="text-red-400">*</span></label>
              <select value={form.franchiseId} onChange={e => setForm({ ...form, franchiseId: e.target.value, outletId: "" })} required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all">
                <option value="">Select a franchise…</option>
                {franchises.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
          )}

          {needsOutlet && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Outlet <span className="text-red-400">*</span></label>
              <select value={form.outletId} onChange={e => setForm({ ...form, outletId: e.target.value })} required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all">
                <option value="">Select an outlet…</option>
                {outletsForSelection.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Create User"}
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
export default function UserPage() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermission();

  const [users, setUsers] = useState<User[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allRoles = ["ALL", "SUPER_ADMIN", "FRANCHISE_ADMIN", "OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF"];

  async function fetchUsers(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [userList, franchiseList, outletList] = await Promise.all([
        getUsers(),
        getFranchises().catch(() => []),
        getOutlets().catch(() => []),
      ]);
      setUsers(userList);
      setFranchises(franchiseList);
      setOutlets(outletList);
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [searchTerm, roleFilter]);

  const activeCount = users.filter(u => u.status === "ACTIVE").length;
  const showShimmer = loading || refreshing;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">Identity</span>
          </div>
          {/* No inline counts — shown in pills below */}
          <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm font-satoshi text-slate-500 mt-0.5">Manage platform users, roles, and access levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            title="Refresh"
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
          {hasPermission(PERMISSIONS.USERS_CREATE) && (
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all">
              <Plus className="w-4 h-4" /> Create User
            </button>
          )}
        </div>
      </div>

      {/* ── Stat pills only ── */}
      <div className="flex flex-wrap gap-2">
        {showShimmer ? (
          [80, 72, 80].map((w, i) => (
            <div key={i} className="relative overflow-hidden bg-slate-100 rounded-lg h-8" style={{ width: w }}>
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          ))
        ) : (
          [
            { label: "Total", value: users.length, cls: "bg-slate-100 text-slate-700 border-slate-200" },
            { label: "Active", value: activeCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Inactive", value: users.length - activeCount, cls: "bg-slate-50 text-slate-400 border-slate-200" },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-clash-semibold border ${s.cls}`}>
              {s.value} <span className="font-satoshi font-normal text-xs opacity-70">{s.label}</span>
            </div>
          ))
        )}
      </div>

      {/* ── Search + Role filter ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name or email…" className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {allRoles.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 h-10 rounded-xl text-xs font-clash-semibold transition-all whitespace-nowrap ${roleFilter === r ? "bg-orange-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {r === "ALL" ? "All Roles" : r.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["User", "Email", "Role", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <ShimmerCell w="w-32" />
                  <ShimmerCell w="w-40" />
                  <ShimmerCell w="w-28" />
                  <ShimmerCell w="w-16" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div>
                    <p className="font-clash-semibold text-slate-600">No users found</p>
                    <p className="font-satoshi text-slate-400 text-sm">{searchTerm ? "Try a different search term" : "Create your first user to get started"}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(u => (
                <tr key={u._id} className="group hover:bg-orange-50/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[12px] font-clash-bold text-orange-600">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-clash-semibold text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-satoshi text-sm text-slate-500">{u.email}</td>
                  <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
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
      <CreateUserModal open={open} onClose={() => setOpen(false)} currentUser={currentUser} franchises={franchises} outlets={outlets} onCreated={pw => setGeneratedPassword(pw)} />
      {generatedPassword && <TempPasswordModal password={generatedPassword} onClose={() => setGeneratedPassword(null)} />}

      <style>{`@keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(250%); } }`}</style>
    </div>
  );
}