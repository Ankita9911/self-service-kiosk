import {
  CalendarDays,
  RefreshCw,
  RotateCcw,
  Store,
  Smartphone,
} from "lucide-react";
import type { ReactNode } from "react";
import { Combobox } from "@/shared/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { KioskTelemetryFilters } from "../types/telemetry.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import type { Device } from "@/features/device/types/device.types";

interface Props {
  filters: KioskTelemetryFilters;
  onChange: (next: Partial<KioskTelemetryFilters>) => void;
  onRefresh: () => void;
  onReset: () => void;
  refreshing: boolean;
  outlets?: Outlet[];
  devices?: Device[];
  isSuperAdmin?: boolean;
  isFranchiseAdmin?: boolean;
  hasOutletId?: boolean;
}

function FilterField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2.5 ${className}`}>
      <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const PANEL_CLASSNAME =
  "rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/8 dark:bg-[#111318]";

const FIELD_SHELL_CLASSNAME =
  "rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/8 dark:bg-white/[0.025]";

const INPUT_CLASSNAME =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/8 dark:bg-[#161920] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-70 dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:opacity-90";

const PAGE_OPTIONS = [
  { value: "ALL", label: "All Pages" },
  { value: "login", label: "Login" },
  { value: "landing", label: "Landing" },
  { value: "order_type", label: "Order Type" },
  { value: "menu", label: "Menu" },
];

const COMPONENT_OPTIONS = [
  { value: "ALL", label: "All Components" },
  { value: "cart", label: "Cart" },
  { value: "checkout", label: "Checkout" },
  { value: "payment", label: "Payment" },
  { value: "login_form", label: "Login Form" },
  { value: "menu_grid", label: "Menu Grid" },
  { value: "category_tabs", label: "Category Tabs" },
];

export function KioskTelemetryFilters({
  filters,
  onChange,
  onRefresh,
  onReset,
  refreshing,
  outlets = [],
  devices = [],
  isSuperAdmin = false,
  isFranchiseAdmin = false,
  hasOutletId = false,
}: Props) {
  const outletOptions = [
    { value: "", label: "All Outlets" },
    ...outlets.map((o) => ({ value: o._id, label: o.name })),
  ];

  const deviceOptions = [
    { value: "", label: "All Devices" },
    ...devices.map((d) => ({ value: d.deviceId, label: d.name || d.deviceId })),
  ];

  return (
    <section className={PANEL_CLASSNAME}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
            Query Controls
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            Slice kiosk behavior by time, device, and UI surface
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Adjust the date range, outlet scope, and UI surface to isolate where
            kiosk sessions slow down or drop off.
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-white/8 dark:bg-transparent dark:text-slate-300 dark:hover:border-white/14 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-[13px] font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className={`mt-6 ${FIELD_SHELL_CLASSNAME}`}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          <FilterField label="From" className="xl:col-span-2">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="date"
                value={filters.from}
                onChange={(event) => onChange({ from: event.target.value })}
                className={`${INPUT_CLASSNAME} pl-11`}
              />
            </div>
          </FilterField>

          <FilterField label="To" className="xl:col-span-2">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="date"
                value={filters.to}
                onChange={(event) => onChange({ to: event.target.value })}
                className={`${INPUT_CLASSNAME} pl-11`}
              />
            </div>
          </FilterField>

          {(isSuperAdmin || isFranchiseAdmin) && !hasOutletId && (
            <FilterField label="Outlet" className="xl:col-span-2">
              <Combobox
                value={filters.outletId || ""}
                onValueChange={(v) => onChange({ outletId: v })}
                options={outletOptions}
                placeholder="All Outlets"
                searchPlaceholder="Search outlets…"
                emptyText="No outlets found"
                icon={<Store className="h-3.5 w-3.5" />}
                className="h-11 w-full rounded-2xl border-slate-200 bg-white px-3.5 dark:border-white/8 dark:bg-[#161920]"
              />
            </FilterField>
          )}

          <FilterField
            label="Device"
            className={
              isSuperAdmin || isFranchiseAdmin
                ? "xl:col-span-2"
                : "xl:col-span-3"
            }
          >
            <Combobox
              value={filters.deviceId || ""}
              onValueChange={(v) => onChange({ deviceId: v })}
              options={deviceOptions}
              placeholder="All Devices"
              searchPlaceholder="Search devices…"
              emptyText="No devices found"
              icon={<Smartphone className="h-3.5 w-3.5" />}
              className="h-11 w-full rounded-2xl border-slate-200 bg-white px-3.5 dark:border-white/8 dark:bg-[#161920]"
            />
          </FilterField>

          <FilterField
            label="Page"
            className={
              isSuperAdmin || isFranchiseAdmin
                ? "xl:col-span-2"
                : "xl:col-span-3"
            }
          >
            <Select
              value={filters.page || "ALL"}
              onValueChange={(v) => onChange({ page: v === "ALL" ? "" : v })}
            >
              <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-white px-3.5 text-[13px] text-slate-700 dark:border-white/8 dark:bg-[#161920] dark:text-slate-200 focus:ring-indigo-400/20">
                <SelectValue placeholder="All Pages" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 bg-white dark:border-white/8 dark:bg-[#1a1d26]">
                {PAGE_OPTIONS.map((p) => (
                  <SelectItem
                    key={p.value}
                    value={p.value}
                    className="rounded-lg px-2 py-1.5 text-[13px]"
                  >
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Component" className="xl:col-span-2">
            <Select
              value={filters.component || "ALL"}
              onValueChange={(v) =>
                onChange({ component: v === "ALL" ? "" : v })
              }
            >
              <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-white px-3.5 text-[13px] text-slate-700 dark:border-white/8 dark:bg-[#161920] dark:text-slate-200 focus:ring-indigo-400/20">
                <SelectValue placeholder="All Components" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 bg-white dark:border-white/8 dark:bg-[#1a1d26]">
                {COMPONENT_OPTIONS.map((c) => (
                  <SelectItem
                    key={c.value}
                    value={c.value}
                    className="rounded-lg px-2 py-1.5 text-[13px]"
                  >
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </div>
      </div>
    </section>
  );
}
