import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { Franchise } from "../types/franchise.types";

interface Props {
  franchise: Franchise;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteModal({ franchise, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        className="
        relative w-full max-w-sm overflow-hidden
        bg-white dark:bg-[#1a1d26]
        border border-slate-100 dark:border-white/[0.08]
        rounded-2xl shadow-2xl shadow-slate-300/20 dark:shadow-black/40
        animate-scale-in
      "
      >
        <div className="h-0.5 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="pt-0.5">
              <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-snug">
                Delete this franchise?
              </p>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[200px]">
                {franchise.name}
              </p>
              <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              className="
                flex-1 h-10 rounded-xl text-[13px] font-semibold
                border border-slate-200 dark:border-white/[0.08]
                text-slate-600 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-white/[0.04]
                transition
              "
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="
                flex-1 h-10 rounded-xl text-[13px] font-semibold
                bg-red-500 hover:bg-red-600
                text-white flex items-center justify-center gap-2
                transition disabled:opacity-60
                shadow-lg shadow-red-500/20
              "
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
