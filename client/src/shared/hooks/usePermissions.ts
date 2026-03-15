import useAuth from "@/shared/hooks/useAuth";
import { ROLE_PERMISSIONS } from "@/shared/constants/rolePermissions";

export function usePermission() {
  const { user } = useAuth();

  function hasPermission(permission: string): boolean {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role] ?? [];
    return rolePermissions.includes(permission);
  }

  return { hasPermission };
}
