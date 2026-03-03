import { Navigate } from "react-router-dom";
import { getKioskToken } from "@/shared/lib/kioskSession";

interface Props {
  children: React.ReactNode;
}

export default function KioskProtectedRoute({ children }: Props) {
  const kioskToken = getKioskToken();

  if (!kioskToken) {
    return <Navigate to="/kiosk/login" replace />;
  }

  return <>{children}</>;
}
