import { Dialog,DialogContent } from "@/shared/components/ui/dialog";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import {
   AlertTriangle
} from "lucide-react";

export function DeleteModal({ outlet, onConfirm, onCancel }: { outlet: Outlet; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-sm border-slate-200 rounded-2xl p-0 overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-clash-bold text-slate-900 text-base">Delete Outlet?</h3>
            <p className="font-satoshi text-slate-500 text-sm mt-1">
              <span className="font-satoshi-medium text-slate-700">{outlet.name}</span> will be permanently removed.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onConfirm} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-clash-semibold transition-colors shadow-lg shadow-red-500/20">Delete Outlet</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}