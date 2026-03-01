import { useState } from "react";
import { MonitorSmartphone, Plus, Loader2, X } from "lucide-react";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { createDeviceSchema } from "../validations/device.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  outlets: Outlet[];
  onCreate: (data: { outletId: string; name?: string }) => Promise<string>;
  onCreated: (secret: string) => void;
}

type FormState = { outletId: string; name: string };
type FieldErrors = Partial<Record<keyof FormState, string>>;

export function CreateDeviceModal({ open, onClose, outlets, onCreate, onCreated }: Props) {
  const [form, setForm] = useState<FormState>({ outletId: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  if (!open) return null;

  function validate(): boolean {
    const result = createDeviceSchema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    setErrors(getZodFieldErrors<FormState>(result.error));
    return false;
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
      const secret = await onCreate({ outletId: form.outletId, name: form.name.trim() || undefined });
      setForm({ outletId: "", name: "" });
      setErrors({});
      onClose();
      onCreated(secret);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <MonitorSmartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Register Kiosk Device</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assign device to an outlet</p>
            </div>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Outlet <span className="text-red-400">*</span>
            </label>
            <Select value={form.outletId} onValueChange={(val) => handleChange("outletId", val)}>
              <SelectTrigger className={`h-10 rounded-xl border text-sm transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-400/20 ${
                errors.outletId
                  ? "border-red-400 focus:border-red-400"
                  : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-300 dark:focus:border-indigo-500/40"
              }`}>
                <SelectValue placeholder="Select an outlet..." />
              </SelectTrigger>
              <SelectContent>
                {outlets.length === 0 ? (
                  <div className="px-3 py-4 text-center space-y-0.5">
                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">No outlets found</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Please create an outlet first.</p>
                  </div>
                ) : (
                  outlets.map((o) => (
                    <SelectItem key={o._id} value={o._id}>{o.name} ({o.outletCode})</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.outletId && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors.outletId}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Device Name <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Counter 1 Kiosk"
              className={`w-full h-10 px-3.5 rounded-xl border text-sm transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 ${
                errors.name
                  ? "border-red-400 focus:border-red-400"
                  : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-300 dark:focus:border-indigo-500/40"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />{errors.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Register</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}