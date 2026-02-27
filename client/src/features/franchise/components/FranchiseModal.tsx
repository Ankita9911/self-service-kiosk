import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import type { Franchise } from "../types/franchise.types";
import { franchiseSchema, type FranchiseFormValues } from "../validations/franchise.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

interface Props {
  open: boolean;
  editing: Franchise | null;
  onClose: () => void;
  onCreate: (data: FranchiseFormValues) => Promise<void>;
  onUpdate: (id: string, data: FranchiseFormValues) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof FranchiseFormValues, string>>;

export function FranchiseModal({ open, editing, onClose, onCreate, onUpdate }: Props) {
  const [form, setForm] = useState<FranchiseFormValues>({ name: "", brandCode: "", contactEmail: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setDone(false);
      setErrors({});
      setForm({
        name: editing?.name || "",
        brandCode: editing?.brandCode || "",
        contactEmail: editing?.contactEmail || "",
      });
    }
  }, [open, editing]);

  function validate(): boolean {
    const result = franchiseSchema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    setErrors(getZodFieldErrors<FranchiseFormValues>(result.error));
    return false;
  }

  function handleChange(key: keyof FranchiseFormValues, raw: string) {
    const value = key === "brandCode" ? raw.toUpperCase() : raw;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      editing ? await onUpdate(editing._id, form) : await onCreate(form);
      setDone(true);
      setTimeout(onClose, 900);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const fields = [
    { key: "name" as const, label: "Franchise Name", placeholder: "e.g. Downtown Kiosk Group", type: "text", required: true, hint: "" },
    { key: "brandCode" as const, label: "Brand Code", placeholder: "e.g. DKG-01", type: "text", required: true, hint: "Unique identifier used across the platform" },
    { key: "contactEmail" as const, label: "Contact Email", placeholder: "contact@franchise.com", type: "email", required: false, hint: "" },
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
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        {done ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-white">
              {editing ? "Changes saved!" : "Franchise registered!"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-50 dark:border-white/[0.06]">
              <div>
                <p className="text-[10.5px] font-semibold text-indigo-500 uppercase tracking-[0.15em] mb-1">
                  {editing ? "Editing" : "New Partner"}
                </p>
                <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                  {editing ? "Update Franchise" : "Register Franchise"}
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
              {fields.map(({ key, label, placeholder, type, required, hint }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                    {required && <span className="text-indigo-500 ml-1">*</span>}
                  </label>

                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className={`
                      w-full h-10 px-3.5 rounded-xl text-[13px]
                      bg-slate-50 dark:bg-white/[0.04]
                      border text-slate-800 dark:text-white
                      placeholder:text-slate-400 dark:placeholder:text-slate-600
                      focus:outline-none focus:ring-2 transition-all
                      ${key === "brandCode" ? "font-mono uppercase tracking-wide" : ""}
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
                    : editing ? "Save Changes" : "Register Partner"
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