import { useState, useMemo, useEffect } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";

import { useUsers } from "../hooks/useUsers";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { ShimmerCell, Shimmer } from "../components/ShimmerCell";
import { CreateUserModal } from "../components/CreateUserModal";
import { TempPasswordModal } from "../components/TempPasswordModal";
import { UserRowMenu } from "../components/UserRowMenu";

import { Users, Plus, Search, RefreshCcw, CheckCircle2, XCircle, Building2, Store } from "lucide-react";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export default function UserPage() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermission();

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isFranchiseAdmin = currentUser?.role === "FRANCHISE_ADMIN";

  const {
    users,
    franchises,
    outlets,
    loading,
    refreshing,
    fetchUsers,
    handleUpdate,
    handleDelete,
    handleChangeRole,
    handleChangeStatus,
    handleResetPassword,
  } = useUsers();

  const [open, setOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ password: string; email: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [franchiseFilter, setFranchiseFilter] = useState("ALL");
  const [outletFilter, setOutletFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const allRoles = [
    "ALL",
    "SUPER_ADMIN",
    "FRANCHISE_ADMIN",
    "OUTLET_MANAGER",
    "KITCHEN_STAFF",
    "PICKUP_STAFF",
  ];

  const assignableRoles = allRoles.filter((r) => r !== "ALL") as any[];

  const filterableOutlets = useMemo(() => {
    if (isSuperAdmin && franchiseFilter !== "ALL") {
      return outlets.filter((o) => (o as any).franchiseId === franchiseFilter);
    }
    return outlets;
  }, [isSuperAdmin, franchiseFilter, outlets]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;

      const matchFranchise =
        !isSuperAdmin || franchiseFilter === "ALL" || u.franchiseId === franchiseFilter;

      const matchOutlet =
        outletFilter === "ALL" || u.outletId === outletFilter;

      const matchStatus =
        statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchRole && matchFranchise && matchOutlet && matchStatus;
    });
  }, [users, searchTerm, roleFilter, isSuperAdmin, franchiseFilter, outletFilter, statusFilter]);

  const paginated = useMemo(() => {
    return filtered.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, franchiseFilter, outletFilter, statusFilter]);

  const activeCount = users.filter(
    (u) => u.status === "ACTIVE"
  ).length;

  const showShimmer = loading || refreshing;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {/* <div className="flex items-center gap-2 mb-1"> */}
            {/* <Users className="w-3.5 h-3.5 text-indigo-500" /> */}
            {/* <span className="text-[11px] font-medium text-indigo-500 uppercase tracking-widest">
              Users Directory
            </span> */}
          {/* </div> */}
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage platform users, roles, and access levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            title="Refresh"
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/4 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
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

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: users.length,              icon: <Users        className="w-4 h-4 text-indigo-500"   />, iconBg: "bg-indigo-50 dark:bg-indigo-500/10"   },
          { label: "Active",      value: activeCount,               icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, iconBg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Inactive",    value: users.length - activeCount, icon: <XCircle     className="w-4 h-4 text-slate-400"   />, iconBg: "bg-slate-50 dark:bg-white/5"    },
        ].map(({ label, value, icon, iconBg }) =>
          showShimmer ? (
            <div key={label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
              <div className="relative overflow-hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/6 shrink-0">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="relative overflow-hidden h-5 w-8 rounded bg-slate-100 dark:bg-white/6">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
                </div>
                <div className="relative overflow-hidden h-3 w-14 rounded bg-slate-100 dark:bg-white/6">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
                </div>
              </div>
            </div>
          ) : (
            <div key={label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/7 shadow-sm">
              <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
              <div>
                <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{value}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            placeholder="Search by name or email…"
            className="w-full h-9 pl-9 pr-3.5 rounded-xl bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Franchise filter — super admin only */}
        {isSuperAdmin && (
          <Select value={franchiseFilter} onValueChange={(v) => { setFranchiseFilter(v); setOutletFilter("ALL"); }}>
            <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <SelectValue placeholder="All Franchises" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
              <SelectItem value="ALL" className="text-[13px] rounded-lg">All Franchises</SelectItem>
              {franchises.map((f) => (
                <SelectItem key={f._id} value={f._id} className="text-[13px] rounded-lg">{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Outlet filter — super admin + franchise admin */}
        {(isSuperAdmin || isFranchiseAdmin) && (
          <Select value={outletFilter} onValueChange={setOutletFilter}>
            <SelectTrigger className="h-9 w-44 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <SelectValue placeholder="All Outlets" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
              <SelectItem value="ALL" className="text-[13px] rounded-lg">All Outlets</SelectItem>
              {filterableOutlets.map((o) => (
                <SelectItem key={o._id} value={o._id} className="text-[13px] rounded-lg">{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Role filter */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-9 w-40 rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#161920] text-[13px] text-slate-700 dark:text-slate-200 focus:ring-indigo-400/20">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-white/8 bg-white dark:bg-[#1a1d26]">
            {allRoles.map((r) => (
              <SelectItem key={r} value={r} className="text-[13px] rounded-lg">
                {r === "ALL" ? "All Roles" : r.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status tab */}
        <div className="flex gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/8 rounded-xl p-1">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-7 rounded-lg text-[12px] font-semibold transition-all ${
                statusFilter === s
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/6 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/60 dark:bg-white/2">
              {["User", "Email", "Role", "Status", ""].map((h) => (
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
                  {/* User — avatar circle + name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Shimmer w="w-8" h="h-8" rounded="rounded-lg" className="shrink-0" />
                      <Shimmer w="w-28" h="h-4" rounded="rounded-md" />
                    </div>
                  </td>
                  {/* Email */}
                  <ShimmerCell w="w-40" />
                  {/* Role badge */}
                  <td className="px-5 py-4">
                    <Shimmer w="w-28" h="h-6" rounded="rounded-lg" />
                  </td>
                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <Shimmer w="w-16" h="h-6" rounded="rounded-full" />
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-4">
                    <Shimmer w="w-6" h="h-6" rounded="rounded-md" className="ml-auto" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">
                      No users found
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      {searchTerm
                        ? "Try a different search term"
                        : "Create your first user to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr
                  key={u._id}
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/4 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center">
                        <span className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-300">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {u.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {u.email}
                  </td>

                  <td className="px-5 py-4">
                    <RoleBadge role={u.role} />
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={u.status} />
                  </td>

                  <td className="px-3 py-4 text-right">
                    <UserRowMenu
                      user={u}
                      canEdit={hasPermission(PERMISSIONS.USERS_UPDATE)}
                      canDelete={hasPermission(PERMISSIONS.USERS_DELETE)}
                      canChangeRole={hasPermission(PERMISSIONS.USERS_CHANGE_ROLE)}
                      canChangeStatus={hasPermission(PERMISSIONS.USERS_CHANGE_STATUS)}
                      canResetPassword={hasPermission(PERMISSIONS.USERS_RESET_PASSWORD)}
                      availableRoles={assignableRoles}
                      onEdit={(payload) => handleUpdate(u._id, payload)}
                      onDelete={() => handleDelete(u._id)}
                      onChangeRole={(role) => handleChangeRole(u._id, role)}
                      onToggleStatus={() => handleChangeStatus(u._id, u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                      onResetPassword={() => handleResetPassword(u._id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!showShimmer && filtered.length > 0 && (
          <TablePagination
            total={filtered.length}
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