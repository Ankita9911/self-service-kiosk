import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

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
  onSubmit: (form: {
    franchiseId: string;
    name: string;
    outletCode: string;
    address: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    franchiseId: editing?.franchiseId || "",
    name: editing?.name || "",
    outletCode: editing?.outletCode || "",
    address: editing?.address || "",
  });
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setForm({
      franchiseId: editing?.franchiseId || "",
      name: editing?.name || "",
      outletCode: editing?.outletCode || "",
      address: editing?.address || "",
    });
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      let msg='outlet created successfully!'
      if(editing) msg='Outlet updated successfully!'
      toast.success(msg);
    } catch(e){
      toast.error('failed to update or create outlet')
    }
    finally {
      setSubmitting(false);

    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">
              {editing ? "Edit Outlet" : "Create New Outlet"}
            </h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">
              {editing
                ? "Update the outlet details below"
                : "Fill in the details to register a new outlet"}
            </p>
          </div>
          {/* <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button> */}
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                Franchise <span className="text-red-400">*</span>
              </label>
              <select
                value={form.franchiseId}
                onChange={(e) =>
                  setForm({ ...form, franchiseId: e.target.value })
                }
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
              >
                <option value="">Select a franchise…</option>
                {franchises.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {[
            {
              key: "name",
              label: "Outlet Name",
              placeholder: "e.g. Downtown Branch",
              required: true,
            },
            {
              key: "outletCode",
              label: "Outlet Code",
              placeholder: "e.g. HK-001",
              required: true,
            },
            {
              key: "address",
              label: "Address",
              placeholder: "Full street address",
              required: false,
            },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">
                {label}
                {required ? (
                  <span className="text-red-400 ml-1">*</span>
                ) : (
                  <span className="text-slate-400 font-satoshi normal-case ml-1">
                    (optional)
                  </span>
                )}
              </label>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required={required}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
              />
            </div>
          ))}
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
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : editing ? (
                "Save Changes"
              ) : (
                "Create Outlet"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
