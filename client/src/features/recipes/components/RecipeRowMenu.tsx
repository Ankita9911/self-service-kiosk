import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeRowMenu({ onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={() => {
          if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setOpenAbove(window.innerHeight - rect.bottom < 140);
          }
          setMenuOpen((v) => !v);
        }}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-all"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div
          className={`absolute right-0 ${
            openAbove ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-44 bg-white dark:bg-[#1a1d26] rounded-xl border border-slate-200 dark:border-white/8 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
            Edit
          </button>
          <div className="h-px bg-slate-100 dark:bg-white/6 mx-3" />
          <button
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/6 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
