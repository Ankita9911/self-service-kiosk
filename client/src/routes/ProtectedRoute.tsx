import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermissions";

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

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Force password reset (block everything except reset page)
  if (
    user.mustChangePassword &&
    location.pathname !== "/force-reset"
  ) {
    return <Navigate to="/force-reset" replace />;
  }

  // 🔐 Permission enforcement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
