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
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-5 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-500 overflow-hidden"
          style={{ animation: "fadeDown 0.12s ease-out forwards" }}
        >
          {showMenu && (
            <button
              onClick={() => {
                setOpen(false);
                onMenu?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-satoshi text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" /> Manage
              Menu
            </button>
          )}
          {showEdit && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-satoshi text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit details
            </button>
          )}
          {(showMenu || showEdit) && showDelete && (
            <div className="h-px bg-slate-100 mx-3" />
          )}
          {showDelete && (
            <button
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-satoshi text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
