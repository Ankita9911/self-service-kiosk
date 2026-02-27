import { useState, useMemo, useEffect } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";

import { useUsers } from "../hooks/useUsers";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { ShimmerCell } from "../components/ShimmerCell";
import { CreateUserModal } from "../components/CreateUserModal";
import { TempPasswordModal } from "../components/TempPasswordModal";
import { UserRowMenu } from "../components/UserRowMenu";

import { Users, Plus, Search, RefreshCcw } from "lucide-react";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export default function UserPage() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermission();

  const {
    users,
    franchises,
    outlets,
    loading,
    refreshing,
    fetchUsers,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleChangeRole,
    handleChangeStatus,
    handleResetPassword,
  } = useUsers();

  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        roleFilter === "ALL" || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const paginated = useMemo(() => {
    return filtered.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  const activeCount = users.filter(
    (u) => u.status === "ACTIVE"
  ).length;

  const showShimmer = loading || refreshing;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-medium text-indigo-500 uppercase tracking-widest">
              Users Directory
            </span>
          </div>
          <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Team
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
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
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
      <div className="flex flex-wrap gap-2">
        {showShimmer ? (
          [80, 76, 84].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-white/[0.04] dark:via-white/10 dark:to-white/[0.04] animate-shimmer bg-[length:400%_100%]"
              style={{ width: w }}
            />
          ))
        ) : (
          [
            { label: "Total", value: users.length, cls: "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]" },
            { label: "Active", value: activeCount, cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
            { label: "Inactive", value: users.length - activeCount, cls: "bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/[0.08]" },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${s.cls}`}
            >
              <span className="tabular-nums font-semibold">{s.value}</span>
              <span className="text-xs font-normal opacity-70">{s.label}</span>
            </div>
          ))
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            placeholder="Search by name or email…"
            className="w-full pl-10 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-10 w-44 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-400/15 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            {allRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "ALL" ? "All Roles" : r.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
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

          <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <ShimmerCell w="w-32" />
                  <ShimmerCell w="w-40" />
                  <ShimmerCell w="w-28" />
                  <ShimmerCell w="w-16" />
                  <td className="px-5 py-4 w-10" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
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
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.04] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center">
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
        franchises={franchises}
        outlets={outlets}
        onCreated={(pw) => setGeneratedPassword(pw)}
      />

      {generatedPassword && (
        <TempPasswordModal
          password={generatedPassword}
          onClose={() => setGeneratedPassword(null)}
        />
      )}
    </div>
  );
}