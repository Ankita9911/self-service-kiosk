import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or loading spinner
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction exists
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
