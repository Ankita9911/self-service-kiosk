import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
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
  const [done,       setDone]       = useState(false);
  const [errors,     setErrors]     = useState<FieldErrors>({});

  useEffect(() => {
    setDone(false);
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
      toast.success(editing ? "Outlet updated!" : "Outlet registered!");
      setDone(true);
      setTimeout(onClose, 900);
    } catch {
      toast.error("Failed to save outlet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const fields = [
    { key: "name" as const,       label: "Outlet Name",  placeholder: "e.g. Downtown Branch", type: "text", required: true,  mono: false, hint: "" },
    { key: "outletCode" as const, label: "Outlet Code",  placeholder: "e.g. HK-001",         type: "text", required: true,  mono: true,  hint: "Unique identifier used across the platform" },
    { key: "address" as const,    label: "Address",      placeholder: "Full street address",  type: "text", required: false, mono: false, hint: "" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="
        relative w-full max-w-md overflow-hidden
        bg-white dark:bg-[#1a1d26]
        border border-slate-100 dark:border-white/[0.08]
        rounded-2xl shadow-2xl shadow-slate-300/20 dark:shadow-black/40
        animate-scale-in
      ">
        {/* Indigo top bar */}
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        {done ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-white">
              {editing ? "Changes saved!" : "Outlet registered!"}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-50 dark:border-white/[0.06]">
              <div>
                <p className="text-[10.5px] font-semibold text-indigo-500 uppercase tracking-[0.15em] mb-1">
                  {editing ? "Editing" : "New Location"}
                </p>
                <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                  {editing ? "Update Outlet" : "Register Outlet"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
              {/* Franchise selector (super admin only) */}
              {isSuperAdmin && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Franchise <span className="text-indigo-500">*</span>
                  </label>
                  <select
                    value={form.franchiseId}
                    onChange={(e) => handleChange("franchiseId", e.target.value)}
                    className={`
                      w-full h-10 px-3.5 rounded-xl text-[13px]
                      bg-slate-50 dark:bg-white/[0.04]
                      border text-slate-800 dark:text-white
                      focus:outline-none focus:ring-2 transition-all
                      ${errors.franchiseId
                        ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/15"
                        : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-indigo-400/15"
                      }
                    `}
                  >
                    <option value="">Select a franchise…</option>
                    {franchises.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                  {errors.franchiseId && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-500 dark:bg-red-400" />
                      {errors.franchiseId}
                    </p>
                  )}
                </div>
              )}

              {fields.map(({ key, label, placeholder, type, required, mono, hint }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                    {required && <span className="text-indigo-500 ml-1">*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className={`
                      w-full h-10 px-3.5 rounded-xl text-[13px]
                      bg-slate-50 dark:bg-white/[0.04]
                      border text-slate-800 dark:text-white
                      placeholder:text-slate-400 dark:placeholder:text-slate-600
                      focus:outline-none focus:ring-2 transition-all
                      ${mono ? "font-mono uppercase tracking-wide" : ""}
                      ${errors[key]
                        ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/15"
                        : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-indigo-400/15"
                      }
                    `}
                  />
                  {errors[key] && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-500 dark:bg-red-400" />
                      {errors[key]}
                    </p>
                  )}
                  {hint && !errors[key] && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
                  )}
                </div>
              ))}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    flex-1 h-10 rounded-xl text-[13px] font-semibold
                    border border-slate-200 dark:border-white/[0.08]
                    text-slate-600 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-white/[0.04] transition
                  "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex-1 h-10 rounded-xl text-[13px] font-semibold
                    bg-indigo-600 hover:bg-indigo-700
                    text-white flex items-center justify-center gap-2
                    shadow-lg shadow-indigo-500/20 transition disabled:opacity-60
                  "
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : editing ? "Save Changes" : "Register Outlet"
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
