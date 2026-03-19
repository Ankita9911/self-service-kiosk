import { useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useUsers } from "../hooks/useUsers";
import { UserStats } from "../components/UserStats";
import { UserFilters } from "../components/UserFilters";
import { UserTable } from "../components/UserTable";
import { CreateUserModal } from "../components/CreateUserModal";
import { TempPasswordModal } from "../components/TempPasswordModal";
import { Plus, RefreshCcw } from "lucide-react";

const ASSIGNABLE_ROLES = [
  "FRANCHISE_ADMIN",
  "OUTLET_MANAGER",
  "KITCHEN_STAFF",
  "PICKUP_STAFF",
] as const;

export default function UserPage() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermission();

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isFranchiseAdmin = currentUser?.role === "FRANCHISE_ADMIN";

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [franchiseFilter, setFranchiseFilter] = useState("ALL");
  const [outletFilter, setOutletFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const {
    users,
    franchises,
    outlets,
    loading,
    refreshing,
    totalUsers,
    activeUsers,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    fetchUsers,
    handleUpdate,
    handleDelete,
    handleChangeRole,
    handleChangeStatus,
    handleResetPassword,
  } = useUsers({
    search: searchTerm,
    role: roleFilter,
    franchiseId: franchiseFilter,
    outletId: outletFilter,
    status: statusFilter,
  });

  const [open, setOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<{
    password: string;
    email: string;
  } | null>(null);

  const isFiltered =
    searchTerm !== "" ||
    roleFilter !== "ALL" ||
    (isSuperAdmin && franchiseFilter !== "ALL") ||
    ((isSuperAdmin || isFranchiseAdmin) && outletFilter !== "ALL") ||
    statusFilter !== "ALL";

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setFranchiseFilter("ALL");
    setOutletFilter("ALL");
    setStatusFilter("ALL");
    resetToFirstPage();
  };

  const showShimmer = loading || refreshing;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage platform users, roles, and access levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/4 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          {hasPermission(PERMISSIONS.USERS_CREATE) && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>
      </div>

      <UserStats
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        loading={showShimmer}
      />

      <UserFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        franchiseFilter={franchiseFilter}
        outletFilter={outletFilter}
        franchises={franchises}
        outlets={outlets}
        isSuperAdmin={isSuperAdmin}
        isFranchiseAdmin={isFranchiseAdmin}
        isFiltered={isFiltered}
        onSearchChange={setSearchTerm}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onFranchiseChange={(v) => {
          setFranchiseFilter(v);
          setOutletFilter("ALL");
        }}
        onOutletChange={setOutletFilter}
        onClearFilters={clearFilters}
        onResetPage={resetToFirstPage}
      />

      <UserTable
        users={users}
        loading={showShimmer}
        searchTerm={searchTerm}
        total={totalMatching}
        page={page}
        pageSize={pageSize}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        assignableRoles={ASSIGNABLE_ROLES as unknown as any[]}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        onPageSizeChange={setPageSize}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onChangeRole={handleChangeRole}
        onChangeStatus={handleChangeStatus}
        onResetPassword={handleResetPassword}
      />

      <CreateUserModal
        open={open}
        onClose={() => setOpen(false)}
        currentUser={currentUser}
        franchises={franchises.filter((f) => f.status === "ACTIVE")}
        outlets={outlets}
        onCreated={(pw, email) => {
          fetchUsers(true);
          setCreatedUser({ password: pw, email });
        }}
      />

      {createdUser && (
        <TempPasswordModal
          password={createdUser.password}
          email={createdUser.email}
          onClose={() => setCreatedUser(null)}
        />
      )}
    </div>
  );
}
