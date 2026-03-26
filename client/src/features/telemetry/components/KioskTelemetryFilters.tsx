import { RefreshCw, RotateCcw } from "lucide-react";
import type { KioskTelemetryFilters } from "../types/telemetry.types";

interface Props {
  filters: KioskTelemetryFilters;
  onChange: (next: Partial<KioskTelemetryFilters>) => void;
  onRefresh: () => void;
  onReset: () => void;
  refreshing: boolean;
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const INPUT_CLASSNAME =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500";

export function KioskTelemetryFilters({
  filters,
  onChange,
  onRefresh,
  onReset,
  refreshing,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
            Query Controls
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            Slice kiosk behavior by time, device, and UI surface
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[12px] font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-white/[0.08] dark:text-slate-300 dark:hover:border-white/[0.14] dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-[12px] font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FilterField label="From">
          <input
            type="date"
            value={filters.from}
            onChange={(event) => onChange({ from: event.target.value })}
            className={INPUT_CLASSNAME}
          />
        </FilterField>

        <FilterField label="To">
          <input
            type="date"
            value={filters.to}
            onChange={(event) => onChange({ to: event.target.value })}
            className={INPUT_CLASSNAME}
          />
        </FilterField>

        <FilterField label="Outlet Id">
          <input
            type="text"
            value={filters.outletId}
            onChange={(event) => onChange({ outletId: event.target.value })}
            placeholder="Optional for scoped users"
            className={INPUT_CLASSNAME}
          />
        </FilterField>

        <FilterField label="Device Id">
          <input
            type="text"
            value={filters.deviceId}
            onChange={(event) => onChange({ deviceId: event.target.value })}
            placeholder="Kiosk device id"
            className={INPUT_CLASSNAME}
          />
        </FilterField>

        <FilterField label="Page">
          <input
            type="text"
            value={filters.page}
            onChange={(event) => onChange({ page: event.target.value })}
            placeholder="menu, login, checkout"
            className={INPUT_CLASSNAME}
          />
        </FilterField>

        <FilterField label="Component">
          <input
            type="text"
            value={filters.component}
            onChange={(event) => onChange({ component: event.target.value })}
            placeholder="cart_panel, payment_dialog"
            className={INPUT_CLASSNAME}
          />
        </FilterField>
      </div>
    </section>
  );
}
