import type { Device } from "../types/device.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { Cpu } from "lucide-react";
import { ShimmerCell, Shimmer } from "./ShimmerCell";
import { StatusBadge } from "./StatusBadge";
import { DeviceRowMenu } from "./DeviceRowMenu";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";

function getOutletName(device: Device, outlets: Outlet[]): string {
  if ((device as any).outlet?.name) return (device as any).outlet.name;
  return (
    outlets.find((o) => o._id === (device.outletId || (device as any).outlet))
      ?.name ?? "—"
  );
}

function formatLastSeen(device: Device): string {
  if (!device.lastSeenAt) return "Never";
  return new Date(device.lastSeenAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface DeviceTableProps {
  devices: Device[];
  outlets: Outlet[];
  loading: boolean;
  searchTerm: string;
  canUpdate: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  total: number;
  page: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
  onUpdate: (deviceId: string, name: string) => Promise<void>;
  onDelete: (device: Device) => Promise<void>;
  onToggleStatus: (device: Device) => Promise<void>;
}

const TABLE_HEADERS = [
  "Device ID",
  "Name",
  "Outlet",
  "Status",
  "Last Seen",
  "",
];

export function DeviceTable({
  devices,
  outlets,
  loading,
  searchTerm,
  canUpdate,
  canDelete,
  canChangeStatus,
  total,
  page,
  pageSize,
  hasPrevPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  onUpdate,
  onDelete,
  onToggleStatus,
}: DeviceTableProps) {
  return (
    <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50 dark:divide-white/4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-4">
                  <Shimmer w="w-28" h="h-6" rounded="rounded-lg" />
                </td>
                <ShimmerCell w="w-24" />
                <ShimmerCell w="w-32" />
                <td className="px-5 py-4">
                  <Shimmer w="w-16" h="h-6" rounded="rounded-full" />
                </td>
                <ShimmerCell w="w-28" />
                <td className="px-5 py-4">
                  <Shimmer w="w-6" h="h-6" rounded="rounded-md" />
                </td>
              </tr>
            ))
          ) : devices.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="font-medium text-slate-600 dark:text-slate-300">
                    No devices found
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {searchTerm
                      ? "Try a different search term"
                      : "Register your first device to get started"}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            devices.map((d) => (
              <tr
                key={d._id}
                className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
              >
                <td className="px-5 py-4">
                  <span className="font-mono text-[13px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/6 px-2 py-0.5 rounded-lg">
                    {d.deviceId}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {d.name || (
                    <span className="text-slate-400 dark:text-slate-600 italic">
                      Unnamed
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {getOutletName(d, outlets)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-5 py-4 text-sm text-slate-400 dark:text-slate-500">
                  {formatLastSeen(d)}
                </td>
                <td className="px-5 py-4">
                  {(canUpdate || canDelete || canChangeStatus) && (
                    <DeviceRowMenu
                      deviceName={d.name || d.deviceId}
                      status={d.status}
                      canEdit={canUpdate}
                      canDelete={canDelete}
                      canToggleStatus={canChangeStatus}
                      onEdit={(newName) => onUpdate(d.deviceId, newName)}
                      onDelete={() => onDelete(d)}
                      onToggleStatus={() => onToggleStatus(d)}
                    />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && devices.length > 0 && (
        <CursorPagination
          total={total}
          page={page}
          pageSize={pageSize}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
