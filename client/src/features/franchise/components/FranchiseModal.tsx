import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/commonFunction";
import type { Franchise } from "../types/franchise.types";

interface FranchiseForm {
  name: string;
  brandCode: string;
  contactEmail: string;
}

interface FranchiseModalProps {
  open: boolean;
  editing: Franchise | null;
  onClose: () => void;
  onCreate: (data: FranchiseForm) => Promise<void>;
  onUpdate: (id: string, data: FranchiseForm) => Promise<void>;
}

export function FranchiseModal({
  open,
  editing,
  onClose,
  onCreate,
  onUpdate,
}: FranchiseModalProps) {
  const [form, setForm] = useState<FranchiseForm>({
    name: "",
    brandCode: "",
    contactEmail: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setDone(false);
      setForm({
        name: editing?.name || "",
        brandCode: editing?.brandCode || "",
        contactEmail: editing?.contactEmail || "",
      });
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await onUpdate(editing._id, form);
      } else {
        await onCreate(form);
      }

      setDone(true);

      setTimeout(() => {
        onClose();
      }, 800);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: "scaleIn 0.15s ease-out forwards" }}
      >
        <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />

        {done ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>

            <p className="font-clash-bold text-slate-900 text-lg">
              {editing ? "Changes saved!" : "Franchise registered!"}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-7 pt-6 pb-5 flex items-start justify-between border-b border-slate-100">
              <div>
                <p className="text-[10px] font-clash-semibold text-orange-500 uppercase tracking-[0.15em] mb-1">
                  {editing ? "Editing" : "New Partner"}
                </p>

                <h2 className="text-lg font-clash-bold text-slate-900">
                  {editing ? "Update Franchise" : "Register Franchise"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              {(
                [
                  {
                    key: "name",
                    label: "Franchise Name",
                    placeholder: "e.g. Downtown Kiosk Group",
                    required: true,
                    type: "text",
                    hint: "",
                  },
                  {
                    key: "brandCode",
                    label: "Brand Code",
                    placeholder: "e.g. DKG-01",
                    required: true,
                    type: "text",
                    hint: "Unique identifier used across the platform",
                  },
                  {
                    key: "contactEmail",
                    label: "Contact Email",
                    placeholder: "contact@franchise.com",
                    required: false,
                    type: "email",
                    hint: "",
                  },
                ] as const
              ).map(({ key, label, placeholder, required, type, hint }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-[11px] font-clash-semibold text-slate-500 uppercase tracking-widest">
                    {label}
                    {required && (
                      <span className="text-orange-500 ml-1">*</span>
                    )}
                  </label>

                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:
                          key === "brandCode"
                            ? e.target.value.toUpperCase()
                            : e.target.value,
                      })
                    }
                    required={required}
                    placeholder={placeholder}
                    className={cn(
                      "w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all",
                      key === "brandCode"
                        ? "font-mono uppercase"
                        : "font-satoshi"
                    )}
                  />

                  {hint && (
                    <p className="text-[11px] font-satoshi text-slate-400">
                      {hint}
                    </p>
                  )}
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editing ? (
                    "Save Changes"
                  ) : (
                    "Register Partner"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}