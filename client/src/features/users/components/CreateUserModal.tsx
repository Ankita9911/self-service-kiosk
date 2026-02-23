import { Input } from "@/shared/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { RefreshCcw } from "lucide-react";
import { createUser} from "@/features/users/services/user.service";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

const OUTLET_SCOPED_ROLES = ["OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF", "KIOSK_DEVICE"];

export function CreateUserModal({ open, onClose, currentUser, franchises, outlets, onCreated }: {
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
              className="flex-1 h-10 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Create User"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
