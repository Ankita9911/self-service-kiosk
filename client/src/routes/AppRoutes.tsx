import { Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import FranchisePage from "@/pages/super-admin/FranchisePage";
import OutletPage from "@/pages/outlets/OutletPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import KioskPage from "../pages/kiosk/KioskPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/franchises"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <FranchisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outlets"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "FRANCHISE_ADMIN"]}>
            <OutletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kiosk"
        element={
          <ProtectedRoute>
            <KioskPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
