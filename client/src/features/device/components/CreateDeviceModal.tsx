import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Plus, RefreshCcw } from "lucide-react";
import type { Outlet } from "@/shared/types/outlet.types";

interface Props {
  open: boolean;
  onClose: () => void;
  outlets: Outlet[];
  onCreate: (data: { outletId: string; name?: string }) => Promise<string>;
  onCreated: (secret: string) => void;
}

export function CreateDeviceModal({
  open,
  onClose,
  outlets,
  onCreate,
  onCreated,
}: Props) {
  const [form, setForm] = useState({ outletId: "", name: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.outletId) return;

    setSubmitting(true);
    try {
      const secret = await onCreate({
        outletId: form.outletId,
        name: form.name || undefined,
      });

      setForm({ outletId: "", name: "" });
      onClose();
      onCreated(secret);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Register Kiosk Device</h3>
            <p className="text-xs font-satoshi text-slate-500 mt-0.5">Assign device to an outlet</p>
          </div>
          {/* <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button> */}
        </div>
        <form onSubmit={()=>{handleSubmit}} className="px-6 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Outlet <span className="text-red-400">*</span></label>
            <select value={form.outletId} onChange={e => setForm({ ...form, outletId: e.target.value })} required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-satoshi text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all">
              <option value="">Select an outlet…</option>
              {outlets.map(o => <option key={o._id} value={o._id}>{o.name} ({o.outletCode})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-clash-semibold text-slate-600 uppercase tracking-wide">Device Name <span className="text-slate-400 font-satoshi normal-case">(optional)</span></label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Counter 1 Kiosk"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting || !form.outletId}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Register Device</>}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}