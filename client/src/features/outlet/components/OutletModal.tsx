import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { outletSchema } from "../validations/outlet.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

type OutletForm = {
  franchiseId: string;
  name: string;
  outletCode: string;
  address: string;
};
type FieldErrors = Partial<Record<keyof OutletForm, string>>;

export function OutletModal({
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
  onSubmit: (form: OutletForm) => Promise<void>;
}) {
  const [form, setForm] = useState<OutletForm>({
    franchiseId: editing?.franchiseId || "",
    name: editing?.name || "",
    outletCode: editing?.outletCode || "",
    address: editing?.address || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setErrors({});
    setForm({
      franchiseId: editing?.franchiseId || "",
      name: editing?.name || "",
      outletCode: editing?.outletCode || "",
      address: editing?.address || "",
    });
  }, [editing, open]);

  function validate(): boolean {
    if (isSuperAdmin && !form.franchiseId) {
      setErrors((prev) => ({ ...prev, franchiseId: "Please select a franchise" }));
      return false;
    }
    const result = outletSchema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    setErrors(getZodFieldErrors<OutletForm>(result.error));
    return false;
  }

  function handleChange(key: keyof OutletForm, raw: string) {
    const value = key === "outletCode" ? raw.toUpperCase() : raw;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      toast.success(editing ? "Outlet updated successfully!" : "Outlet created successfully!");
    } catch {
      toast.error("Failed to save outlet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: keyof OutletForm) =>
    `h-10 rounded-xl bg-slate-50 font-satoshi text-sm transition-all focus-visible:outline-none focus-visible:ring-2 border ${errors[field]
      ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400"
      : "border-slate-200 focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
    }`;

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
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4" noValidate>
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                Franchise <span className="text-red-400">*</span>
              </label>
              <select
                value={form.franchiseId}
                onChange={(e) => handleChange("franchiseId", e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border font-satoshi text-sm text-slate-700 focus:outline-none focus:ring-2 transition-all bg-slate-50 ${errors.franchiseId
                    ? "border-red-400 focus:ring-red-400/40 focus:border-red-400"
                    : "border-slate-200 focus:ring-orange-400/40 focus:border-orange-400"
                  }`}
              >
                <option value="">Select a franchise…</option>
                {franchises.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
              {errors.franchiseId && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors.franchiseId}
                </p>
              )}
            </div>
          )}

          {[
            { key: "name" as const, label: "Outlet Name", placeholder: "e.g. Downtown Branch", required: true, mono: false },
            { key: "outletCode" as const, label: "Outlet Code", placeholder: "e.g. HK-001", required: true, mono: true },
            { key: "address" as const, label: "Address", placeholder: "Full street address", required: false, mono: false },
          ].map(({ key, label, placeholder, required, mono }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                {label}
                {required
                  ? <span className="text-red-400 ml-1">*</span>
                  : <span className="text-slate-400 font-satoshi normal-case ml-1">(optional)</span>}
              </label>
              <Input
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className={`${inputClass(key)} ${mono ? "uppercase font-mono tracking-wide" : ""}`}
              />
              {errors[key] && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors[key]}
                </p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : editing ? "Save Changes" : "Create Outlet"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
