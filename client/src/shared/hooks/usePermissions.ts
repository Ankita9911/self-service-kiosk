import  useAuth  from "@/shared/hooks/useAuth";
import { ROLE_PERMISSIONS } from "@/shared/lib/rolePermissions";

export function usePermission() {
  const { user } = useAuth();

  function hasPermission(permission: string) {
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  return { hasPermission };
}
