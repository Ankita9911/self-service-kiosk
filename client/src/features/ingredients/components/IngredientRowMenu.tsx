import { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  Trash2,
  Pencil,
  ArrowUpDown,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Ingredient } from "../types/ingredient.types";

interface Props {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: () => Promise<void>;
  onAdjustStock: (ingredient: Ingredient) => void;
}

type ModalType = "delete" | null;

export function IngredientRowMenu({
  ingredient,
  onEdit,
  onDelete,
  onAdjustStock,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [openAbove, setOpenAbove] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const open = (m: ModalType) => {
    setModal(m);
    setMenuOpen(false);
  };
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

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
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
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreVertical className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div
          className={`absolute right-0 ${openAbove ? "bottom-full mb-1.5" : "top-full mt-1.5"} w-48 bg-white dark:bg-[#1a1d26] rounded-xl border border-slate-200 dark:border-white/8 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              onEdit(ingredient);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              onAdjustStock(ingredient);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500" /> Adjust
            Stock
          </button>

          <div className="h-px bg-slate-100 dark:bg-white/6 mx-3" />
          <button
            onClick={() => open("delete")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/6 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <Modal onClose={!busy ? close : undefined}>
          <div className="h-0.5 bg-linear-to-r from-red-400 to-red-600" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
                  Delete Ingredient
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-40">
                  {ingredient.name}
                </p>
              </div>
            </div>
            {!busy && (
              <button
                onClick={close}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently delete{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {ingredient.name}
              </strong>
              . This action cannot be undone.
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
              onClick={() => run(onDelete, "Ingredient deleted")}
              disabled={busy}
              className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}
