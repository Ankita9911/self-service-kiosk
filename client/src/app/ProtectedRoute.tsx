import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
interface Props {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
}: Props) {
  const { user, loading } = useAuth();
  const { hasPermission } = usePermission();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (
    user.mustChangePassword &&
    location.pathname !== "/force-reset"
  ) {
    return <Navigate to="/force-reset" replace />;
  }
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
