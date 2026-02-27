import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  item: any | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteItemModal({ open, item, onClose, onConfirm }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try { await onConfirm(); }
    finally { setIsDeleting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Item</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/8 border border-red-100 dark:border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold">&quot;{item?.name}&quot;</span> from the menu?
            </p>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Trash2 className="w-3.5 h-3.5" /> Delete Item</>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}