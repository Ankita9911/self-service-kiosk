import { useState, useEffect, useRef } from "react";
import { MoreVertical, UtensilsCrossed, Pencil, Trash2 } from "lucide-react";

export function RowMenu({
  onEdit,
  onDelete,
  onMenu,
  showEdit,
  showDelete,
  showMenu,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onMenu?: () => void;
  showEdit: boolean;
  showDelete: boolean;
  showMenu: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  if (!showEdit && !showDelete && !showMenu) return null;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          h-7 w-7 rounded-lg flex items-center justify-center
          text-slate-300 dark:text-slate-600
          hover:text-slate-600 dark:hover:text-slate-300
          hover:bg-slate-100 dark:hover:bg-white/[0.07]
          transition-all
        "
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="
          absolute right-0 top-full mt-1.5 w-44 z-20 overflow-hidden
          bg-white dark:bg-[#1a1d26]
          border border-slate-100 dark:border-white/[0.08]
          rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/30
        ">
          {showMenu && (
            <button
              onClick={() => { setOpen(false); onMenu?.(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Manage Menu
            </button>
          )}
          {showEdit && (
            <button
              onClick={() => { setOpen(false); onEdit?.(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Edit details
            </button>
          )}
          {(showMenu || showEdit) && showDelete && (
            <div className="h-px bg-slate-100 dark:bg-white/[0.06] mx-3" />
          )}
          {showDelete && (
            <button
              onClick={() => { setOpen(false); onDelete?.(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
