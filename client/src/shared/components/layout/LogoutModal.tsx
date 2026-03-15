import { LogOut } from "lucide-react";

interface LogoutModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ open, onConfirm, onCancel }: LogoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] border border-slate-100 dark:border-white/[0.08] rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <div className="w-11 h-11 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800 dark:text-white text-center mb-1">
          Sign out?
        </h3>
        <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center mb-7">
          You'll be redirected to the login page.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-[13px] text-white transition font-semibold shadow-sm shadow-red-200 dark:shadow-red-900/30"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
