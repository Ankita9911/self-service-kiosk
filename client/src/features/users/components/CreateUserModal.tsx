import { useState } from "react";
import { UserPlus, Loader2, X } from "lucide-react";
import { createUser } from "@/features/users/services/user.service";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import {
  getCreateUserSchema,
  OUTLET_SCOPED_ROLES,
  type UserRole,
} from "../validations/user.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type FormState = {
  name: string;
  email: string;
  role: string;
  franchiseId: string;
  outletId: string;
};
type FieldErrors = Partial<Record<keyof FormState, string>>;

export function CreateUserModal({
  open,
  onClose,
  currentUser,
  franchises,
  outlets,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  franchises: Franchise[];
  outlets: Outlet[];
  onCreated: (pw: string, email: string) => void;
}) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    role: "",
    franchiseId: "",
    outletId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const needsFranchise =
    currentUser?.role === "SUPER_ADMIN" &&
    form.role &&
    form.role !== "SUPER_ADMIN";
  const needsOutlet =
    form.role && OUTLET_SCOPED_ROLES.includes(form.role as UserRole);

  const outletsForSelection =
    currentUser?.role === "SUPER_ADMIN" && form.franchiseId
      ? outlets.filter((o) => o.franchiseId === form.franchiseId)
      : outlets;

  const availableRoles: UserRole[] =
    currentUser?.role === "SUPER_ADMIN"
      ? ["FRANCHISE_ADMIN"]
      : currentUser?.role === "FRANCHISE_ADMIN"
        ? ["OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF"]
        : ["KITCHEN_STAFF", "PICKUP_STAFF"];

  function validate(): boolean {
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role as any,
      franchiseId: form.franchiseId || undefined,
      outletId: form.outletId || undefined,
    };
    const result = getCreateUserSchema(currentUser?.role).safeParse(payload);
    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors = getZodFieldErrors<FormState>(result.error);
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
        ...(needsFranchise &&
          form.franchiseId && { franchiseId: form.franchiseId }),
        ...(needsOutlet && form.outletId && { outletId: form.outletId }),
      });
      setForm({ name: "", email: "", role: "", franchiseId: "", outletId: "" });
      setErrors({});
      onClose();
      onCreated(result.tempPassword, form.email.trim().toLowerCase());
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = (field: keyof FormState) =>
    `w-full h-10 px-3.5 rounded-xl border text-sm transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 ${
      errors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-300 dark:focus:border-indigo-500/40"
    }`;

  const triggerCls = (field: keyof FormState) =>
    `h-10 rounded-xl border text-sm transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-400/20 ${
      errors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-300 dark:focus:border-indigo-500/40"
    }`;

  const ErrMsg = ({ field }: { field: keyof FormState }) =>
    errors[field] ? (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
        {errors[field]}
      </p>
    ) : null;

  const LabelCls =
    "text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide ";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-white/6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Create User
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                A temporary password will be generated
              </p>
            </div>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 pt-5 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LabelCls}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Jane Smith"
                type="text"
                className={inputCls("name")}
              />
              <ErrMsg field="name" />
            </div>
            <div className="space-y-1.5 mb-1.5">
              <label className={LabelCls}>
                Email <span className="text-red-400">*</span>
              </label>
              <input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="jane@example.com"
                type="email"
                className={inputCls("email")}
              />
              <ErrMsg field="email" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={LabelCls}>
              Role <span className="text-red-400">*</span>
            </label>
            <Select
              value={form.role}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  role: val,
                  franchiseId: "",
                  outletId: "",
                }))
              }
            >
              <SelectTrigger className={triggerCls("role")}>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.length === 0 ? (
                  <div className="px-3 py-4 text-center space-y-0.5">
                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      No roles available
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Contact your system administrator.
                    </p>
                  </div>
                ) : (
                  availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <ErrMsg field="role" />
          </div>

          {needsFranchise && (
            <div className="space-y-1.5">
              <label className={LabelCls}>
                Franchise <span className="text-red-400">*</span>
              </label>
              <Select
                value={form.franchiseId}
                onValueChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    franchiseId: val,
                    outletId: "",
                  }))
                }
              >
                <SelectTrigger className={triggerCls("franchiseId")}>
                  <SelectValue placeholder="Select a franchise..." />
                </SelectTrigger>
                <SelectContent>
                  {franchises.length === 0 ? (
                    <div className="px-3 py-4 text-center space-y-0.5">
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        No franchises found
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Please create a franchise first.
                      </p>
                    </div>
                  ) : (
                    franchises.map((f) => (
                      <SelectItem key={f._id} value={f._id}>
                        {f.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <ErrMsg field="franchiseId" />
            </div>
          )}

          {needsOutlet && (
            <div className="space-y-1.5">
              <label className={LabelCls}>
                Outlet <span className="text-red-400">*</span>
              </label>
              <Select
                value={form.outletId}
                onValueChange={(val) => handleChange("outletId", val)}
              >
                <SelectTrigger className={triggerCls("outletId")}>
                  <SelectValue placeholder="Select an outlet..." />
                </SelectTrigger>
                <SelectContent>
                  {outletsForSelection.length === 0 ? (
                    <div className="px-3 py-4 text-center space-y-0.5">
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        No outlets found
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Please create an outlet first.
                      </p>
                    </div>
                  ) : (
                    outletsForSelection.map((o) => (
                      <SelectItem key={o._id} value={o._id}>
                        {o.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <ErrMsg field="outletId" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
