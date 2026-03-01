import { useState, useEffect, useRef } from "react";
import { MoreVertical, Trash2, Pencil, Power, Loader2, X, MonitorSmartphone } from "lucide-react";
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

type ModalType = "rename" | "status" | "delete" | null;

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
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [newName, setNewName] = useState(deviceName);

  const ref = useRef<HTMLDivElement>(null);
  const [openAbove, setOpenAbove] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const open = (m: ModalType) => { setModal(m); setMenuOpen(false); };
  const close = () => setModal(null);

  async function run(action: () => Promise<any>, successMsg: string) {
    setBusy(true);
    try {
      await action();
      toast.success(successMsg);
      close();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!canEdit && !canDelete && !canToggleStatus) return null;

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger ── */}
      <button
        ref={btnRef}
        onClick={() => {
          if (!busy) {
            if (btnRef.current) {
              const rect = btnRef.current.getBoundingClientRect();
              setOpenAbove(window.innerHeight - rect.bottom < 200);
            }
            setMenuOpen((v) => !v);
          }
        }}
        disabled={busy}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-all disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {/* ── Dropdown ── */}
      {menuOpen && (
        <div className={`absolute right-0 ${openAbove ? "bottom-full mb-1.5" : "top-full mt-1.5"} w-48 bg-white dark:bg-[#1a1d26] rounded-xl border border-slate-200 dark:border-white/8 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}>
          {canEdit && (
            <button
              onClick={() => { setNewName(deviceName); open("rename"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Rename
            </button>
          )}

          {canToggleStatus && (
            <button
              onClick={() => open("status")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              <Power className="w-3.5 h-3.5 text-slate-400" />
              {status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          )}

          {canDelete && (
            <>
              <div className="h-px bg-slate-100 dark:bg-white/6 mx-3" />
              <button
                onClick={() => open("delete")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/6 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Rename Modal ── */}
      {modal === "rename" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Rename Device</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-40">{deviceName}</p>
              </div>
            </div>
            {!busy && (
              <button onClick={close} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-5 py-4">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
              Device Name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && newName.trim() && run(() => onEdit(newName.trim()), "Device renamed")}
              placeholder="Device name"
              autoFocus
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all"
            />
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={close}
              disabled={busy}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => run(() => onEdit(newName.trim()), "Device renamed")}
              disabled={busy || !newName.trim()}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Toggle Status Modal ── */}
      {modal === "status" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className={`h-0.5 ${status === "ACTIVE" ? "bg-linear-to-r from-amber-400 to-orange-500" : "bg-linear-to-r from-emerald-400 to-emerald-500"}`} />
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                status === "ACTIVE"
                  ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20"
                  : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
              }`}>
                <Power className={`w-3.5 h-3.5 ${status === "ACTIVE" ? "text-amber-500" : "text-emerald-500"}`} />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
                  {status === "ACTIVE" ? "Deactivate" : "Activate"} Device
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-40">{deviceName}</p>
              </div>
            </div>
            {!busy && (
              <button onClick={close} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to {status === "ACTIVE" ? "deactivate" : "activate"} this device?
              {status === "ACTIVE" && " It will immediately lose access to the platform."}
            </p>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={close}
              disabled={busy}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => run(onToggleStatus, `Device ${status === "ACTIVE" ? "deactivated" : "activated"}`)}
              disabled={busy}
              className={`flex-1 h-10 rounded-xl disabled:opacity-50 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                status === "ACTIVE"
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              }`}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (status === "ACTIVE" ? "Deactivate" : "Activate")}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {modal === "delete" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-linear-to-r from-red-400 to-red-600" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Delete Device</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-40">{deviceName}</p>
              </div>
            </div>
            {!busy && (
              <button onClick={close} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently delete this device. This action cannot be undone.
            </p>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={close}
              disabled={busy}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => run(onDelete, "Device deleted")}
              disabled={busy}
              className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5" /> Delete</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}