import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { Device } from "../types/device.types";

interface Props {
  device: Device;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteDeviceModal({ device, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Delete device?</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                {device.deviceId}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                await onConfirm();
                setLoading(false);
              }}
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
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