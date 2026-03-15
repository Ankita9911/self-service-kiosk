import { useState, useMemo, useEffect } from "react";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/constants/permissions";
import useAuth from "@/shared/hooks/useAuth";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { useDevices } from "../hooks/useDevice";
import { DeviceHeader } from "../components/DeviceHeader";
import { DeviceStats } from "../components/DeviceStats";
import { DeviceFilters } from "../components/DeviceFilters";
import { DeviceTable } from "../components/DeviceTable";
import { CreateDeviceModal } from "../components/CreateDeviceModal";
import { SecretRevealModal } from "../components/SecretRevealModal";
import { ShieldAlert } from "lucide-react";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Device } from "../types/device.types";

export default function DevicePage() {
  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const canView         = hasPermission(PERMISSIONS.DEVICE_VIEW);
  const canCreate       = hasPermission(PERMISSIONS.DEVICE_CREATE);
  const canUpdate       = hasPermission(PERMISSIONS.DEVICE_UPDATE);
  const canDelete       = hasPermission(PERMISSIONS.DEVICE_DELETE);
  const canChangeStatus = hasPermission(PERMISSIONS.DEVICE_CHANGE_STATUS);

  const isSuperAdmin    = user?.role === "SUPER_ADMIN";
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";

  const [open, setOpen]                 = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [franchises, setFranchises]     = useState<Franchise[]>([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [franchiseFilter, setFranchiseFilter] = useState("ALL");
  const [outletFilter, setOutletFilter] = useState("ALL");

  const {
    devices, outlets,
    loading, refreshing,
    totalDevices, activeDevices, totalMatching,
    page, pageSize, hasPrevPage, hasNextPage,
    goToNextPage, goToPrevPage, setPageSize, resetToFirstPage,
    fetchData, handleCreate,
    handleUpdate,
    handleDelete: deleteDeviceHook,
    handleStatusChange,
  } = useDevices(canView, {
    search: searchTerm,
    status: statusFilter,
    franchiseId: franchiseFilter,
    outletId: outletFilter,
  });

  useEffect(() => {
    if (isSuperAdmin && canView) {
      getFranchises().then(setFranchises).catch(() => {});
    }
  }, [isSuperAdmin, canView]);

  const filterableOutlets = useMemo(() => {
    if (isSuperAdmin && franchiseFilter !== "ALL") {
      return outlets.filter((o) => (o as any).franchiseId === franchiseFilter);
    }
    return outlets;
  }, [outlets, isSuperAdmin, franchiseFilter]);

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
    resetToFirstPage();
  };

  const handleToggleStatus = async (device: Device) => {
    await handleStatusChange(device.deviceId, device.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  };

  const handleDelete = async (device: Device) => {
    await deleteDeviceHook(device.deviceId);
  };

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

  return (
    <div className="space-y-6">
      <DeviceHeader
        refreshing={refreshing}
        canCreate={canCreate}
        onRefresh={() => fetchData(true)}
        onCreate={() => setOpen(true)}
      />

      <DeviceStats
        totalDevices={totalDevices}
        activeDevices={activeDevices}
        loading={loading || refreshing}
      />

      <DeviceFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={(v) => { setSearchTerm(v); resetToFirstPage(); }}
        onStatusChange={(v) => { setStatusFilter(v); resetToFirstPage(); }}
        isSuperAdmin={isSuperAdmin}
        franchises={franchises}
        franchiseFilter={franchiseFilter}
        onFranchiseChange={(v) => { setFranchiseFilter(v); setOutletFilter("ALL"); resetToFirstPage(); }}
        filterableOutlets={(isSuperAdmin || isFranchiseAdmin) ? filterableOutlets : undefined}
        outletFilter={outletFilter}
        onOutletChange={(v) => { setOutletFilter(v); resetToFirstPage(); }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <DeviceTable
        devices={devices}
        outlets={outlets}
        loading={loading || refreshing}
        searchTerm={searchTerm}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canChangeStatus={canChangeStatus}
        total={totalMatching}
        page={page}
        pageSize={pageSize}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        onPageSizeChange={setPageSize}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

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
