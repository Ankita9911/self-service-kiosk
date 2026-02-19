import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or loading spinner
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
