import { useState, useEffect, useRef } from "react";
import {
  MoreVertical, Trash2, Pencil, Power, KeyRound, ShieldCheck, Loader2, Eye, EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import type { User } from "@/features/users/types/user.types";
import type { UserRole } from "../validations/user.schemas";

interface Props {
  user: User;
  canEdit: boolean;
  canDelete: boolean;
  canChangeRole: boolean;
  canChangeStatus: boolean;
  canResetPassword: boolean;
  availableRoles: UserRole[];
  onEdit: (payload: { name: string; email: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onChangeRole: (role: string) => Promise<void>;
  onToggleStatus: () => Promise<void>;
  onResetPassword: () => Promise<string>;
}

type ModalType = "edit" | "role" | "status" | "resetPw" | "showPw" | "delete" | null;

export function UserRowMenu({
  user, canEdit, canDelete, canChangeRole, canChangeStatus, canResetPassword,
  availableRoles, onEdit, onDelete, onChangeRole, onToggleStatus, onResetPassword,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [newRole, setNewRole] = useState(user.role);
  const [tempPw, setTempPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

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
      const result = await action();
      toast.success(successMsg);
      close();
      return result;
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const hasAny = canEdit || canDelete || canChangeRole || canChangeStatus || canResetPassword;
  if (!hasAny) return null;

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger ── */}
      <button
        onClick={() => !busy && setMenuOpen((v) => !v)}
        disabled={busy}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {/* ── Dropdown ── */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1a1d26] rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {canEdit && (
            <button
              onClick={() => { setEditName(user.name); setEditEmail(user.email); open("edit"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit User
            </button>
          )}
          {canChangeRole && (
            <button
              onClick={() => { setNewRole(user.role); open("role"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Change Role
            </button>
          )}
          {canChangeStatus && (
            <button
              onClick={() => open("status")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <Power className="w-3.5 h-3.5 text-slate-400" />
              {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          )}
          {canResetPassword && (
            <button
              onClick={() => open("resetPw")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Reset Password
            </button>
          )}
          {canDelete && (
            <>
              <div className="h-px bg-slate-100 dark:bg-white/[0.06] mx-3" />
              <button
                onClick={() => open("delete")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete User
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {modal === "edit" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Edit User</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update name and email for <span className="font-medium">{user.name}</span>
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all"
              />
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={close} disabled={busy} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button
              onClick={() => run(() => onEdit({ name: editName.trim(), email: editEmail.trim() }), "User updated")}
              disabled={busy || !editName.trim() || !editEmail.trim()}
              className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Change Role Modal ── */}
      {modal === "role" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Change Role</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assign a new role to <span className="font-medium">{user.name}</span>
            </p>
          </div>
          <div className="px-5 py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-400/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={close} disabled={busy} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button
              onClick={() => run(() => onChangeRole(newRole), "Role updated")}
              disabled={busy || newRole === user.role}
              className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Role"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Toggle Status Modal ── */}
      {modal === "status" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500" />
          <div className="px-5 py-5 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              {user.status === "ACTIVE" ? "Deactivate" : "Activate"} User?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Are you sure you want to {user.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">{user.name}</span>?
              {user.status === "ACTIVE" && " They will lose access to the platform."}
            </p>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={close} disabled={busy} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button
              onClick={() => run(onToggleStatus, `User ${user.status === "ACTIVE" ? "deactivated" : "activated"}`)}
              disabled={busy}
              className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Reset Password Confirm Modal ── */}
      {modal === "resetPw" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
          <div className="px-5 py-5 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Reset Password?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              A new temporary password will be generated for{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">{user.name}</span>. They must change it on next login.
            </p>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={close} disabled={busy} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  const pw = await onResetPassword();
                  setTempPw(pw);
                  setShowPw(false);
                  setModal("showPw");
                  toast.success("Password reset successfully");
                } catch {
                  toast.error("Failed to reset password");
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="flex-1 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Reset Password"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Show New Password Modal ── */}
      {modal === "showPw" && (
        <Modal onClose={close}>
          <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500 text-left" />
          <div className="px-5 py-5 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Temporary Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share this with <span className="font-medium">{user.name}</span> securely. It won't be shown again.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <code className={`text-sm font-mono text-amber-800 dark:text-amber-300 tracking-wider flex-1 transition-all ${showPw ? "" : "blur-sm select-none"}`}>
                {tempPw}
              </code>
              <button onClick={() => setShowPw((v) => !v)} className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors flex-shrink-0">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2">
              User will be prompted to change this password on next login.
            </p>
          </div>
          <div className="px-5 pb-5">
            <button onClick={close} className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {modal === "delete" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-600" />
          <div className="px-5 py-5 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Delete User?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              This will permanently delete{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">{user.name}</span>. This action cannot be undone.
            </p>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={close} disabled={busy} className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button
              onClick={() => run(onDelete, "User deleted")}
              disabled={busy}
              className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-sm overflow-visible animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}
