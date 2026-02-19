import { Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import FranchisePage from "@/pages/super-admin/FranchisePage";
import OutletPage from "@/pages/outlets/OutletPage";
function Dashboard() {
  return <h1 className="p-10">Dashboard</h1>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
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
    </Routes>
  );
}
