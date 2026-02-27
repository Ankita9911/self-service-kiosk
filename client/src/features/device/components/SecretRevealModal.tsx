import { useState } from "react";
import { Copy, Check, KeyRound, ShieldAlert } from "lucide-react";

export function SecretRevealModal({
  secret,
  onClose,
}: {
  secret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />

        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Device Created!</h3>
              <p className="text-emerald-100 text-xs">Save this secret — it won't be shown again</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-emerald-400 break-all leading-relaxed border border-slate-800 relative">
            {secret}
            <button
              onClick={copy}
              className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              This secret authenticates the kiosk device. Store it securely — it cannot be recovered once this dialog is closed.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-slate-900 dark:bg-white/[0.08] hover:bg-slate-800 dark:hover:bg-white/[0.12] text-white text-sm font-medium transition-colors"
          >
            I've saved the secret
          </button>
        </div>
      </div>
    </div>
  );
}