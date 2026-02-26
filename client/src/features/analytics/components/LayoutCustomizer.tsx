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

export function LayoutCustomizer({
    layout,
    widgetLabels,
    onToggle,
    onMove,
    onReset,
}: Props) {
    const [open, setOpen] = useState(false);
    const sorted = [...layout].sort((a, b) => a.order - b.order);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 text-sm font-satoshi-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:shadow-sm transition-all"
                title="Customize layout"
            >
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Customize</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <div>
                            <p className="text-sm font-clash-semibold text-slate-800">
                                Layout
                            </p>
                            <p className="text-xs text-slate-400 font-satoshi">
                                Drag or reorder widgets
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onReset}
                                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                                title="Reset to default"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-3 max-h-80 overflow-y-auto space-y-1">
                        {sorted.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${item.visible
                                        ? "bg-slate-50 hover:bg-slate-100"
                                        : "bg-white hover:bg-slate-50 opacity-50"
                                    }`}
                            >
                                <span className="text-xs font-satoshi-medium text-slate-700 truncate flex-1">
                                    {widgetLabels[item.id] || item.id}
                                </span>
                                <div className="flex items-center gap-1 ml-2">
                                    <button
                                        onClick={() => onMove(item.id, "up")}
                                        disabled={idx === 0}
                                        className="p-1 rounded-lg hover:bg-white disabled:opacity-20 text-slate-400 hover:text-slate-600"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => onMove(item.id, "down")}
                                        disabled={idx === sorted.length - 1}
                                        className="p-1 rounded-lg hover:bg-white disabled:opacity-20 text-slate-400 hover:text-slate-600"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => onToggle(item.id)}
                                        className={`p-1 rounded-lg ${item.visible
                                                ? "text-orange-500 hover:bg-orange-50"
                                                : "text-slate-400 hover:bg-slate-50"
                                            }`}
                                    >
                                        {item.visible ? (
                                            <Eye className="w-3.5 h-3.5" />
                                        ) : (
                                            <EyeOff className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
