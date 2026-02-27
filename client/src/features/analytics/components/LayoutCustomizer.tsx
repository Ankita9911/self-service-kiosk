import { useState } from "react";
import { Settings2, X, RotateCcw, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import type { LayoutItem } from "../hooks/useAnalyticsLayout";

interface Props {
  layout: LayoutItem[];
  widgetLabels: Record<string, string>;
  onToggle: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onReset: () => void;
}

export function LayoutCustomizer({ layout, widgetLabels, onToggle, onMove, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const sorted = [...layout].sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white dark:bg-[#161920]
          border border-slate-100 dark:border-white/[0.08]
          text-[12.5px] font-medium text-slate-500 dark:text-slate-400
          hover:text-slate-700 dark:hover:text-slate-200
          hover:border-slate-200 dark:hover:border-white/[0.15]
          transition
        "
      >
        <Settings2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Customize</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="
            absolute right-0 top-full mt-2 w-72 z-50
            bg-white dark:bg-[#1a1d26]
            border border-slate-100 dark:border-white/[0.08]
            rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30
            overflow-hidden animate-scale-in
          ">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 dark:border-white/[0.06]">
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-white">Customize Layout</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Show or reorder widgets</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onReset}
                  className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  title="Reset to default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Widget list */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-0.5 scrollbar-hide">
              {sorted.map((item, idx) => (
                <div
                  key={item.id}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors
                    ${item.visible
                      ? "bg-slate-50 dark:bg-white/[0.04]"
                      : "opacity-50 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }
                  `}
                >
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                    {widgetLabels[item.id] || item.id}
                  </span>

                  <div className="flex items-center gap-0.5 ml-2 shrink-0">
                    <button
                      onClick={() => onMove(item.id, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-white/[0.08] disabled:opacity-20 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onMove(item.id, "down")}
                      disabled={idx === sorted.length - 1}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-white/[0.08] disabled:opacity-20 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onToggle(item.id)}
                      className={`p-1 rounded-lg transition ${
                        item.visible
                          ? "text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                          : "text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.visible
                        ? <Eye className="w-3.5 h-3.5" />
                        : <EyeOff className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}