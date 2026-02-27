import { useState, useMemo, useEffect } from "react";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";

import { useDevices } from "../hooks/useDevice";
import { DeviceHeader } from "../components/DeviceHeader";
import { DeviceStats } from "../components/DeviceStats";
import { DeviceFilters } from "../components/DeviceFilters";
import { StatusBadge } from "../components/StatusBadge";
import { ShimmerCell } from "../components/ShimmerCell";
import { CreateDeviceModal } from "../components/CreateDeviceModal";
import { SecretRevealModal } from "../components/SecretRevealModal";
import { DeviceRowMenu } from "../components/DeviceRowMenu";

import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Cpu, ShieldAlert } from "lucide-react";
import type { Device } from "../types/device.types";

export default function DevicePage() {
  const { hasPermission } = usePermission();

  const canView = hasPermission(PERMISSIONS.DEVICE_VIEW);
  const canCreate = hasPermission(PERMISSIONS.DEVICE_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.DEVICE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.DEVICE_DELETE);
  const canChangeStatus = hasPermission(PERMISSIONS.DEVICE_CHANGE_STATUS);

  const {
    devices,
    outlets,
    loading,
    refreshing,
    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete: deleteDeviceHook,
    handleStatusChange,
  } = useDevices(canView);

  const [open, setOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch =
        (d.deviceId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (d.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, statusFilter]);

  const paginatedDevices = useMemo(() => {
    return filteredDevices.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredDevices, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  function getOutletName(d: Device): string {
    if ((d as any).outlet?.name) return (d as any).outlet.name;
    const found = outlets.find(
      (o) => o._id === (d.outletId || (d as any).outlet),
    );
    return found?.name || "—";
  }

  function formatLastSeen(d: Device): string {
    const ts =
      (d as any).lastSeenAt || (d as any).lastSeen || (d as any).last_seen;

    if (!ts) return "Never";

    return new Date(ts).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const showShimmer = loading || refreshing;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-300">Access Restricted</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          You don't have permission to view devices.
        </p>
      </div>
    );
  }

  async function handleToggleStatus(device: Device) {
    const newStatus = device.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await handleStatusChange(device.deviceId, newStatus);
  }

  async function handleDelete(device: Device) {
    await deleteDeviceHook(device.deviceId);
  }

  async function handleSaveEdit(name: string) {
    // no-op: inline rename handled by DeviceRowMenu
    void name;
  }

  return (
    <div className="space-y-6">
      <DeviceHeader
        refreshing={refreshing}
        canCreate={canCreate}
        onRefresh={() => fetchData(true)}
        onCreate={() => setOpen(true)}
      />

      <DeviceStats devices={devices} loading={showShimmer} />

      <DeviceFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />

      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
              {[
                "Device ID",
                "Name",
                "Outlet",
                "Status",
                "Last Seen",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <ShimmerCell w="w-28" />
                  <ShimmerCell w="w-24" />
                  <ShimmerCell w="w-32" />
                  <ShimmerCell w="w-16" />
                  <ShimmerCell w="w-28" />
                  <td />
                </tr>
              ))
            ) : filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
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
              paginatedDevices.map((d) => (
                <tr
                  key={d._id}
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.04] transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-[13px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-lg">
                      {d.deviceId}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {d.name || (
                      <span className="text-slate-400 dark:text-slate-600 italic">Unnamed</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {getOutletName(d)}
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
                        onEdit={(newName) => handleUpdate(d.deviceId, newName)}
                        onDelete={() => handleDelete(d)}
                        onToggleStatus={() => handleToggleStatus(d)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!showShimmer && filteredDevices.length > 0 && (
          <TablePagination
            total={filteredDevices.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        )}
      </div>

      <CreateDeviceModal
        open={open}
        onClose={() => setOpen(false)}
        outlets={outlets}
        onCreate={handleCreate}
        onCreated={(secret) => setCreatedSecret(secret)}
      />

      {createdSecret && (
        <SecretRevealModal
          secret={createdSecret}
          onClose={() => {
            setCreatedSecret(null);
            fetchData(true);
          }}
        />
      )}
    </div>
  );
}
