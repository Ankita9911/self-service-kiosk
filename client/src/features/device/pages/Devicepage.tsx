import { useState, useMemo, useEffect } from "react";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";
import useAuth from "@/shared/hooks/useAuth";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import { getFranchises } from "@/features/franchise/services/franchise.service";

import { useDevices } from "../hooks/useDevice";
import { DeviceHeader } from "../components/DeviceHeader";
import { DeviceStats } from "../components/DeviceStats";
import { DeviceFilters } from "../components/DeviceFilters";
import { StatusBadge } from "../components/StatusBadge";
import { ShimmerCell, Shimmer } from "../components/ShimmerCell";
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

  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";

  const [open, setOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [franchiseFilter, setFranchiseFilter] = useState("ALL");
  const [outletFilter, setOutletFilter]     = useState("ALL");

  const {
    devices,
    allDevices,
    outlets,
    loading,
    refreshing,
    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete: deleteDeviceHook,
    handleStatusChange,
  } = useDevices(canView, { search: searchTerm, status: statusFilter, franchiseId: franchiseFilter, outletId: outletFilter });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    if (isSuperAdmin && canView) {
      getFranchises().then(setFranchises).catch(() => {});
    }
  }, [isSuperAdmin, canView]);

  // Outlets available for the outlet filter dropdown
  // Super admin: all outlets, optionally filtered by selected franchise
  // Franchise admin: all their outlets (already scoped by API)
  const filterableOutlets = useMemo(() => {
    if (isSuperAdmin && franchiseFilter !== "ALL") {
      return outlets.filter((o) => (o as any).franchiseId === franchiseFilter);
    }
    return outlets;
  }, [outlets, isSuperAdmin, franchiseFilter]);

  const paginatedDevices = useMemo(() => {
    return devices.slice((page - 1) * pageSize, page * pageSize);
  }, [devices, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, franchiseFilter, outletFilter]);

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "ALL" ||
    franchiseFilter !== "ALL" ||
    outletFilter !== "ALL";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setFranchiseFilter("ALL");
    setOutletFilter("ALL");
    setPage(1);
  };

  function getOutletName(d: Device): string {
    if ((d as any).outlet?.name) return (d as any).outlet.name;
    const found = outlets.find(
      (o) => o._id === (d.outletId || (d as any).outlet),
    );
    return found?.name || "—";
  }

  function formatLastSeen(d: Device): string {
    if (!d.lastSeenAt) return "Never";
    return new Date(d.lastSeenAt).toLocaleString([], {
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

  return (
    <div className="space-y-6">
      <DeviceHeader
        refreshing={refreshing}
        canCreate={canCreate}
        onRefresh={() => fetchData(true)}
        onCreate={() => setOpen(true)}
      />

      <DeviceStats devices={allDevices} loading={showShimmer} />

      <DeviceFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        isSuperAdmin={isSuperAdmin}
        franchises={franchises}
        franchiseFilter={franchiseFilter}
        onFranchiseChange={(v) => { setFranchiseFilter(v); setOutletFilter("ALL"); }}
        filterableOutlets={(isSuperAdmin || isFranchiseAdmin) ? filterableOutlets : undefined}
        outletFilter={outletFilter}
        onOutletChange={setOutletFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
              {[
                "Device ID",
                "Name",
                "Outlet",
                "Status",
                "Last Seen",
                "",
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

          <tbody className="divide-y divide-slate-50 dark:divide-white/4">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {/* Device ID — mono badge */}
                  <td className="px-5 py-4">
                    <Shimmer w="w-28" h="h-6" rounded="rounded-lg" />
                  </td>
                  {/* Name */}
                  <ShimmerCell w="w-24" />
                  {/* Outlet */}
                  <ShimmerCell w="w-32" />
                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <Shimmer w="w-16" h="h-6" rounded="rounded-full" />
                  </td>
                  {/* Last Seen */}
                  <ShimmerCell w="w-28" />
                  {/* Actions */}
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
              paginatedDevices.map((d) => (
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

        {!showShimmer && devices.length > 0 && (
          <TablePagination
            total={devices.length}
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
