import { Dialog,DialogContent } from "@/shared/components/ui/dialog";
import { useState } from "react";
import { ShieldAlert,Check,KeyRound,Copy } from "lucide-react";
export function TempPasswordModal({ password, onClose }: { password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center"><KeyRound className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="font-clash-bold text-white text-base">User Created!</h3>
              <p className="text-orange-100 text-xs font-satoshi">Share this temporary password with the user</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-base text-orange-300 text-center tracking-widest border border-slate-800 relative">
            {password}
            <button onClick={copy} className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-clash-semibold text-slate-300 transition-all">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-satoshi text-amber-700 leading-relaxed">The user must change this password on first login. This is a one-time display.</p>
          </div>
          <button onClick={onClose} className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-colors">Done</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
