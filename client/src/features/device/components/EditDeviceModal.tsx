import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { editDeviceSchema } from "../validations/device.schemas";

interface Props {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  onSave: (name: string) => Promise<void>;
}

export function EditDeviceModal({ open, onClose, initialName, onSave }: Props) {
  const [name, setName] = useState(initialName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName || "");
      setError(null);
    }
  }, [open, initialName]);

  function validate(value: string): boolean {
    const result = editDeviceSchema.safeParse({ name: value });
    if (result.success) {
      setError(null);
      return true;
    }
    setError(result.error.issues[0].message);
    return false;
  }

  function handleChange(value: string) {
    setName(value);
    if (error) validate(value);
  }

  async function handleSubmit() {
    if (!validate(name)) return;
    try {
      setLoading(true);
      await onSave(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />
        <div className="p-6 space-y-4">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Rename Device
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Set a friendly name for this device.
            </p>
          </div>
          <div className="space-y-1.5">
            <input
              value={name}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter device name"
              autoFocus
              className={`w-full h-10 px-3.5 rounded-xl border text-sm transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 ${
                error
                  ? "border-red-400 focus:border-red-400"
                  : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-300 dark:focus:border-indigo-500/40"
              }`}
            />
            {error && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                {error}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || loading}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
