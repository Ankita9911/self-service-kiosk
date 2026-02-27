import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { RefreshCcw } from "lucide-react";
import { createUser } from "@/features/users/services/user.service";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { createUserSchema, OUTLET_SCOPED_ROLES, type UserRole } from "../validations/user.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

type FormState = { name: string; email: string; role: string; franchiseId: string; outletId: string };
type FieldErrors = Partial<Record<keyof FormState, string>>;

export function CreateUserModal({
  open, onClose, currentUser, franchises, outlets, onCreated,
}: {
  open: boolean; onClose: () => void; currentUser: any;
  franchises: Franchise[]; outlets: Outlet[]; onCreated: (pw: string) => void;
}) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", role: "", franchiseId: "", outletId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const needsFranchise = currentUser?.role === "SUPER_ADMIN" && form.role && form.role !== "SUPER_ADMIN";
  const needsOutlet = form.role && OUTLET_SCOPED_ROLES.includes(form.role as UserRole);

  const outletsForSelection =
    currentUser?.role === "SUPER_ADMIN" && form.franchiseId
      ? outlets.filter((o) => o.franchiseId === form.franchiseId)
      : outlets;

  const availableRoles: UserRole[] =
    currentUser?.role === "SUPER_ADMIN"
      ? ["SUPER_ADMIN", "FRANCHISE_ADMIN", "OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF"]
      : currentUser?.role === "FRANCHISE_ADMIN"
        ? ["OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF"]
        : ["KITCHEN_STAFF", "PICKUP_STAFF"];

  function validate(): boolean {
    const payload = { name: form.name, email: form.email, role: form.role as any, franchiseId: form.franchiseId || undefined, outletId: form.outletId || undefined };
    const result = createUserSchema.safeParse(payload);
    const fieldErrors: FieldErrors = result.success ? {} : getZodFieldErrors<FormState>(result.error);

    if (needsFranchise && !form.franchiseId) fieldErrors.franchiseId = "Please select a franchise";
    if (needsOutlet && !form.outletId) fieldErrors.outletId = "Please select an outlet";

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  }

  function handleChange(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        ...(needsFranchise && form.franchiseId && { franchiseId: form.franchiseId }),
        ...(needsOutlet && form.outletId && { outletId: form.outletId }),
      });
      setForm({ name: "", email: "", role: "", franchiseId: "", outletId: "" });
      setErrors({});
      onClose();
      onCreated(result.tempPassword);
    } finally { setSubmitting(false); }
  }

  const inputCls = (field: keyof FormState) =>
    `h-10 rounded-xl bg-slate-50 font-satoshi text-sm border transition-all focus-visible:outline-none focus-visible:ring-2 ${errors[field] ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400" : "border-slate-200 focus-visible:ring-orange-400/40"}`;

  const selectCls = (field: keyof FormState) =>
    `h-10 rounded-xl font-satoshi text-sm border transition-all ${errors[field] ? "border-red-400" : "border-slate-200"}`;

  const ErrMsg = ({ field }: { field: keyof FormState }) =>
    errors[field] ? (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors[field]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-clash-bold text-slate-900 text-base">Create User</h3>
          <p className="text-xs font-satoshi text-slate-500 mt-0.5">A temporary password will be generated</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Full Name <span className="text-red-400">*</span></label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Jane Smith" type="text" className={inputCls("name")} />
              <ErrMsg field="name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Email <span className="text-red-400">*</span></label>
              <Input value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="jane@example.com" type="email" className={inputCls("email")} />
              <ErrMsg field="email" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Role <span className="text-red-400">*</span></label>
            <Select value={form.role} onValueChange={(val) => setForm((prev) => ({ ...prev, role: val, franchiseId: "", outletId: "" }))}>
              <SelectTrigger className={selectCls("role")}><SelectValue placeholder="Select a role..." /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableRoles.map((r) => <SelectItem key={r} value={r} className="font-satoshi text-sm">{r.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrMsg field="role" />
          </div>

          {needsFranchise && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Franchise <span className="text-red-400">*</span></label>
              <Select value={form.franchiseId} onValueChange={(val) => setForm((prev) => ({ ...prev, franchiseId: val, outletId: "" }))}>
                <SelectTrigger className={selectCls("franchiseId")}><SelectValue placeholder="Select a franchise..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {franchises.map((f) => <SelectItem key={f._id} value={f._id} className="font-satoshi text-sm">{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <ErrMsg field="franchiseId" />
            </div>
          )}

          {needsOutlet && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Outlet <span className="text-red-400">*</span></label>
              <Select value={form.outletId} onValueChange={(val) => handleChange("outletId", val)}>
                <SelectTrigger className={selectCls("outletId")}><SelectValue placeholder="Select an outlet..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {outletsForSelection.map((o) => <SelectItem key={o._id} value={o._id} className="font-satoshi text-sm">{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <ErrMsg field="outletId" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Create User"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}