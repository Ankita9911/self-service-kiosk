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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-7 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <div>
              <p className="font-clash-bold text-slate-900">Delete device?</p>
              <p className="font-satoshi text-slate-500 text-sm mt-0.5">
                {device.deviceId}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50"
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
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-clash-semibold flex items-center justify-center gap-2"
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