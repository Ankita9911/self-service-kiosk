import { useState, useEffect, useRef } from "react";
import { MoreVertical, Trash2, Pencil, Power, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input"; 
import { toast } from "react-hot-toast"; 

interface Props {
  deviceName: string;
  status: "ACTIVE" | "INACTIVE";
  canEdit: boolean;
  canDelete: boolean;
  canToggleStatus: boolean;
  onEdit: (newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onToggleStatus: () => Promise<void>;
}

export function DeviceRowMenu({
  deviceName,
  status,
  canEdit,
  canDelete,
  canToggleStatus,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState(deviceName);

  // Dialog States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleAction = async (
    action: () => Promise<void>, 
    successMsg: string,
    closeDialog: () => void
  ) => {
    setIsLoading(true);
    try {
      await action();
      toast.success(successMsg);
      setMenuOpen(false);
      closeDialog();
    } catch (error) {
      toast.error("Action failed. Please try again.");
      console.error("Action failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit && !canDelete && !canToggleStatus) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !isLoading && setMenuOpen((v) => !v)}
        disabled={isLoading}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {menuOpen && (
        <div className="absolute right-5 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {canEdit && (
            <button
              onClick={() => { setShowEditDialog(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-slate-600 hover:bg-slate-50"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Rename
            </button>
          )}

          {canToggleStatus && (
            <button
              onClick={() => { setShowStatusDialog(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-slate-600 hover:bg-slate-50"
            >
              <Power className="w-3.5 h-3.5 text-slate-400" />
              {status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          )}

          {canDelete && (
            <>
              <div className="h-px bg-slate-100 mx-3" />
              <button
                onClick={() => { setShowDeleteDialog(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      )}

      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          {isLoading && <DialogLoader label="Updating name..." />}
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Device</AlertDialogTitle>
            <AlertDialogDescription>Enter a new name for this device.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Device name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleAction(() => onEdit(newName), "Device renamed successfully", () => setShowEditDialog(false));
              }}
              disabled={isLoading || !newName.trim()}
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          {isLoading && <DialogLoader label="Updating status..." />}
          <AlertDialogHeader>
            <AlertDialogTitle>{status === "ACTIVE" ? "Deactivate" : "Activate"} Device?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {status === "ACTIVE" ? "deactivate" : "activate"} <strong>{deviceName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleAction(onToggleStatus, `Device ${status === "ACTIVE" ? "deactivated" : "activated"}`, () => setShowStatusDialog(false));
              }}
              disabled={isLoading}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          {isLoading && <DialogLoader label="Deleting device..." color="text-red-600" />}
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deviceName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleAction(onDelete, "Device deleted successfully", () => setShowDeleteDialog(false));
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DialogLoader({ label, color = "text-orange-600" }: { label: string; color?: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] rounded-lg">
      <Loader2 className={`h-8 w-8 animate-spin ${color}`} />
      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}