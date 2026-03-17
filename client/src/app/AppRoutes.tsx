import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import KioskProtectedRoute from "./KioskProtectedRoute";
import { PageLoader } from "./PageLoader";
import AppLayout from "@/shared/components/layout/AppLayout";
import { PERMISSIONS } from "@/shared/constants/permissions";
const Login = lazy(() => import("@/features/auth/pages/Login"));
const ForceReset = lazy(() =>
  import("@/features/auth/pages/ForceReset").then((m) => ({
    default: m.ForceReset,
  })),
);
const ResetPassword = lazy(() =>
  import("@/features/auth/pages/ResetPassword").then((m) => ({
    default: m.ResetPassword,
  })),
);
const FranchisePage = lazy(
  () => import("@/features/franchise/pages/FranchisePage"),
);
const OutletPage = lazy(() => import("@/features/outlet/pages/OutletPage"));
const OutletMenuPage = lazy(
  () => import("@/features/outlet/pages/OutletMenuPage"),
);
const MenuLandingPage = lazy(
  () => import("@/features/outlet/pages/MenuLandingPage"),
);
const DevicePage = lazy(() => import("@/features/device/pages/Devicepage"));
const KioskPage = lazy(() => import("@/features/kiosk/pages/KioskPage"));
const KioskLoginPage = lazy(
  () => import("@/features/kiosk/pages/KioskLoginPage"),
);
const KioskOrderTypePage = lazy(
  () => import("@/features/kiosk/pages/KioskOrderTypePage"),
);
const KioskLandingPage = lazy(
  () => import("@/features/kiosk/pages/KioskLandingPage"),
);
const KitchenPage = lazy(() => import("@/features/kitchen/pages/Kitchenpage"));
const PickupPage = lazy(() => import("@/features/pickup/pages/PickupPage"));
const UserPage = lazy(() => import("@/features/users/pages/UserPage"));
const AnalyticsPage = lazy(
  () => import("@/features/analytics/pages/AnalyticsPage"),
);
const IngredientsPage = lazy(
  () => import("@/features/ingredients/pages/IngredientsPage"),
);
const RecipesPage = lazy(() => import("@/features/recipes/pages/RecipesPage"));
const StockTransactionsPage = lazy(
  () => import("@/features/stockTransactions/pages/StockTransactionsPage"),
);
const OrdersPage = lazy(() => import("@/features/orders/pages/OrdersPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/kiosk/login" element={<KioskLoginPage />} />
        <Route
          path="/kiosk/landing"
          element={
            <KioskProtectedRoute>
              <KioskLandingPage />
            </KioskProtectedRoute>
          }
        />
        <Route
          path="/kiosk/order-type"
          element={
            <KioskProtectedRoute>
              <KioskOrderTypePage />
            </KioskProtectedRoute>
          }
        />
        <Route
          path="/force-reset"
          element={
            <ProtectedRoute>
              <ForceReset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kiosk"
          element={
            <KioskProtectedRoute>
              <KioskPage />
            </KioskProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<AnalyticsPage />} />
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
            path="/menu/:outletId"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.MENU_MANAGE}>
                <OutletMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ingredients"
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.INGREDIENT_MANAGE}
              >
                <IngredientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.RECIPE_MANAGE}>
                <RecipesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-transactions"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.INVENTORY_MANAGE}>
                <StockTransactionsPage />
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
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ORDERS_VIEW}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.ORDERS_KITCHEN_VIEW}
              >
                <KitchenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickup"
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.ORDERS_PICKUP_VIEW}
              >
                <PickupPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
