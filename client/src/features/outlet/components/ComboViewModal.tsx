import { Layers, Receipt, Sparkles, X } from "lucide-react";
import type { Combo } from "@/features/kiosk/types/menu.types";

interface Props {
  combo: Combo;
  onClose: () => void;
}

function serviceTypeLabel(serviceType?: Combo["serviceType"]) {
  if (serviceType === "DINE_IN") return "Dine In";
  if (serviceType === "TAKE_AWAY") return "Take Away";
  return "Both";
}

export function ComboViewModal({ combo, onClose }: Props) {
  const savings = Math.max(0, (combo.originalPrice ?? 0) - combo.comboPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:bg-[#1a1d26]">
        <div className="h-0.5 bg-linear-to-r from-orange-400 via-amber-500 to-orange-600" />

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/8">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Combo Details
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/6 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative aspect-video bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          {combo.imageUrl ? (
            <img
              src={combo.imageUrl}
              alt={combo.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Layers className="h-12 w-12 text-orange-300 dark:text-orange-600" />
            </div>
          )}

          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white">
            COMBO
          </span>

          {savings > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
              SAVE Rs {savings.toFixed(0)}
            </span>
          )}
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                {combo.name}
              </h4>
              {combo.description ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {combo.description}
                </p>
              ) : (
                <p className="mt-1 text-sm italic text-slate-400 dark:text-slate-600">
                  No description provided.
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              {combo.originalPrice > combo.comboPrice && (
                <p className="text-xs text-slate-400 line-through">
                  Rs {combo.originalPrice.toFixed(2)}
                </p>
              )}
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                Rs {combo.comboPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-white/8 dark:text-slate-300">
              <Receipt className="h-3 w-3" />
              {combo.items.length} items included
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles className="h-3 w-3" />
              {serviceTypeLabel(combo.serviceType)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/8 dark:bg-white/4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Included Items
            </p>
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {combo.items.map((item, idx) => (
                <div
                  key={`${item.menuItemId}-${idx}`}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-white/6"
                >
                  <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                    {item.name}
                  </span>
                  <span className="ml-2 shrink-0 rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                    {item.quantity}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-full rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/8 dark:text-slate-300 dark:hover:bg-white/4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
