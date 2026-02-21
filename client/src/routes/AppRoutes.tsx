import { Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import {ForceReset} from "@/pages/auth/ForceReset";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import FranchisePage from "@/pages/super-admin/FranchisePage";
import OutletPage from "@/pages/outlets/OutletPage";
import OutletMenuPage from "@/pages/outlets/OutletMenuPage";
import MenuLandingPage from "@/pages/outlets/MenuLandingPage";
import DevicePage from "@/pages/devices/DevicePage";
import KioskPage from "@/pages/kiosk/KioskPage";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "@/layout/AppLayout";
import { PERMISSIONS } from "@/lib/permissions";
import {ResetPassword} from "@/pages/auth/ResetPassword";
import UserPage from "@/pages/users/UserPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 Force Reset (Protected but no layout) */}
      <Route
        path="/force-reset"
        element={
          <ProtectedRoute>
            <ForceReset />
          </ProtectedRoute>
        }
      />

      {/* 🔐 Kiosk (Protected but no layout - full screen) */}
      <Route
        path="/kiosk"
        element={
          <ProtectedRoute>
            <KioskPage />
          </ProtectedRoute>
        }
      />

      {/* 🔐 All Main App Routes (With Layout) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/franchises"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.FRANCHISE_VIEW}>
              <FranchisePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/outlets"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.OUTLET_VIEW}>
              <OutletPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.MENU_MANAGE}>
              <MenuLandingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/outlets/:outletId/menu"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.MENU_MANAGE}>
              <OutletMenuPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/devices"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DEVICE_VIEW}>
              <DevicePage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
