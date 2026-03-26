import type { KioskTelemetryComponents } from "../types/telemetry.types";

interface Props {
  data: KioskTelemetryComponents | null;
  loading: boolean;
}

export function KioskComponentTable({ data, loading }: Props) {
  const items = data?.items ?? [];

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#111318]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
          Component Actions
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Which controls absorb the most interaction volume
        </h3>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:border-white/[0.08] dark:text-slate-500">
              <th className="px-0 py-3 font-semibold">Page</th>
              <th className="px-3 py-3 font-semibold">Component</th>
              <th className="px-3 py-3 font-semibold">Action</th>
              <th className="px-3 py-3 font-semibold">Interactions</th>
              <th className="px-3 py-3 font-semibold">Unique Targets</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 dark:border-white/[0.05]"
                >
                  <td className="px-0 py-3" colSpan={5}>
                    <div className="h-9 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-0 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  No component telemetry available
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={`${item.page}-${item.component}-${item.action}`}
                  className="border-b border-slate-100 text-sm text-slate-600 dark:border-white/[0.05] dark:text-slate-300"
                >
                  <td className="px-0 py-3 font-medium text-slate-900 dark:text-white">
                    {item.page || "unknown"}
                  </td>
                  <td className="px-3 py-3">{item.component || "unknown"}</td>
                  <td className="px-3 py-3">{item.action || "unknown"}</td>
                  <td className="px-3 py-3">{item.count}</td>
                  <td className="px-3 py-3">{item.uniqueTargets}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
