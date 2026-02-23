import { Routes, Route } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import {ForceReset} from "@/features/auth/pages/ForceReset";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import FranchisePage from "@/features/franchise/pages/FranchisePage";;
import OutletPage from "@/features/outlet/pages/OutletPage";
import OutletMenuPage from "@/features/outlet/pages/OutletMenuPage";
import MenuLandingPage from "@/features/outlet/pages/MenuLandingPage";
import DevicePage from "@/features/device/pages/Devicepage";
import KioskPage from "@/pages/kiosk/KioskPage";
import KioskLoginPage from "@/pages/kiosk/KioskLoginPage";
import KitchenPage from "@/pages/kitchen/KitchenPage";
import PickupPage from "@/pages/pickup/PickupPage";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "@/shared/components/layout/AppLayout";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { ResetPassword} from "@/features/auth/pages/ResetPassword"
import UserPage from "@/features/users/pages/UserPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* 🖥️ Kiosk Login — public, no auth needed */}
      <Route path="/kiosk/login" element={<KioskLoginPage />} />

      {/* 🔐 Force Reset (Protected but no layout) */}
      <Route
        path="/force-reset"
        element={
          <ProtectedRoute>
            <ForceReset />
          </ProtectedRoute>
        }
      />

      {/* 🖥️ Kiosk — full screen, guarded internally by KioskPage itself */}
      <Route path="/kiosk" element={<KioskPage />} />

      {/* 🔐 All Main App Routes (With Layout) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
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
          path="/users"
          element={
            <ProtectedRoute>
              <UserPage />
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

        {/* 🍳 Kitchen Display */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ORDERS_KITCHEN_VIEW}>
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        {/* 🛍️ Pickup Counter */}
        <Route
          path="/pickup"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ORDERS_PICKUP_VIEW}>
              <PickupPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}