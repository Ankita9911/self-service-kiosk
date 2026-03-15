import { Users } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";
import { UserRowMenu } from "./UserRowMenu";
import { Shimmer, ShimmerCell } from "./ShimmerCell";
import { CursorPagination } from "@/shared/components/ui/CursorPagination";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { usePermission } from "@/shared/hooks/usePermissions";
import type { User } from "../types/user.types";
import type { UserRole } from "../validations/user.schemas";

interface UserTableProps {
  users: User[];
  loading: boolean;
  searchTerm: string;
  total: number;
  page: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  assignableRoles: UserRole[];
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
  onUpdate: (
    id: string,
    payload: { name: string; email: string },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onChangeRole: (id: string, role: string) => Promise<void>;
  onChangeStatus: (id: string, status: "ACTIVE" | "INACTIVE") => Promise<void>;
  onResetPassword: (id: string) => Promise<string>;
}

export function UserTable({
  users,
  loading,
  searchTerm,
  total,
  page,
  pageSize,
  hasPrevPage,
  hasNextPage,
  assignableRoles,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  onUpdate,
  onDelete,
  onChangeRole,
  onChangeStatus,
  onResetPassword,
}: UserTableProps) {
  const { hasPermission } = usePermission();

  return (
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
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Shimmer
                      w="w-8"
                      h="h-8"
                      rounded="rounded-lg"
                      className="shrink-0"
                    />
                    <Shimmer w="w-28" h="h-4" rounded="rounded-md" />
                  </div>
                </td>
                <ShimmerCell w="w-40" />
                <td className="px-5 py-4">
                  <Shimmer w="w-28" h="h-6" rounded="rounded-lg" />
                </td>
                <td className="px-5 py-4">
                  <Shimmer w="w-16" h="h-6" rounded="rounded-full" />
                </td>
                <td className="px-3 py-4">
                  <Shimmer
                    w="w-6"
                    h="h-6"
                    rounded="rounded-md"
                    className="ml-auto"
                  />
                </td>
              </tr>
            ))
          ) : users.length === 0 ? (
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
            users.map((u) => (
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
                    canChangeStatus={hasPermission(
                      PERMISSIONS.USERS_CHANGE_STATUS,
                    )}
                    canResetPassword={hasPermission(
                      PERMISSIONS.USERS_RESET_PASSWORD,
                    )}
                    availableRoles={assignableRoles}
                    onEdit={(payload) => onUpdate(u._id, payload)}
                    onDelete={() => onDelete(u._id)}
                    onChangeRole={(role) => onChangeRole(u._id, role)}
                    onToggleStatus={() =>
                      onChangeStatus(
                        u._id,
                        u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                      )
                    }
                    onResetPassword={() => onResetPassword(u._id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && users.length > 0 && (
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
