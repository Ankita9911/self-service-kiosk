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

import { Users, Plus, Search, RefreshCcw } from "lucide-react";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/commonFunction";

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
  } = useUsers();

  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allRoles = [
    "ALL",
    "SUPER_ADMIN",
    "FRANCHISE_ADMIN",
    "OUTLET_MANAGER",
    "KITCHEN_STAFF",
    "PICKUP_STAFF",
  ];

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
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-widest">
              Identity
            </span>
          </div>

          <h1 className="text-[28px] font-clash-bold text-slate-900 tracking-tight">
            User Management
          </h1>

          <p className="text-sm font-satoshi text-slate-500 mt-0.5">
            Manage platform users, roles, and access levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            title="Refresh"
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50"
          >
            <RefreshCcw
              className={cn("w-4 h-4", refreshing && "animate-spin")}
            />
          </button>

          {hasPermission(PERMISSIONS.USERS_CREATE) && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Pills ── */}
      <div className="flex flex-wrap gap-2">
        {showShimmer ? (
          [80, 72, 80].map((w, i) => (
            <div
              key={i}
              className="relative overflow-hidden bg-slate-100 rounded-lg h-8"
              style={{ width: w }}
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          ))
        ) : (
          [
            {
              label: "Total",
              value: users.length,
              cls: "bg-slate-100 text-slate-700 border-slate-200",
            },
            {
              label: "Active",
              value: activeCount,
              cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
              label: "Inactive",
              value: users.length - activeCount,
              cls: "bg-slate-50 text-slate-400 border-slate-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-clash-semibold border ${s.cls}`}
            >
              {s.value}
              <span className="font-satoshi font-normal text-xs opacity-70">
                {s.label}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Search + Role Filter ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <Input
            placeholder="Search by name or email…"
            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 font-satoshi text-sm focus-visible:ring-orange-400/40 focus-visible:border-orange-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {allRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 h-10 rounded-xl text-xs font-clash-semibold transition-all whitespace-nowrap ${
                roleFilter === r
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {r === "ALL" ? "All Roles" : r.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["User", "Email", "Role", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {showShimmer ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <ShimmerCell w="w-32" />
                  <ShimmerCell w="w-40" />
                  <ShimmerCell w="w-28" />
                  <ShimmerCell w="w-16" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="font-clash-semibold text-slate-600">
                      No users found
                    </p>
                    <p className="font-satoshi text-slate-400 text-sm">
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
                  className="group hover:bg-orange-50/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <span className="text-[12px] font-clash-bold text-orange-600">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-clash-semibold text-slate-800 text-sm">
                        {u.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-satoshi text-sm text-slate-500">
                    {u.email}
                  </td>

                  <td className="px-5 py-4">
                    <RoleBadge role={u.role} />
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={u.status} />
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

      <style>{`
        @keyframes shimmer {
          0% { transform:translateX(-100%); }
          100% { transform:translateX(250%); }
        }
      `}</style>
    </div>
  );
}