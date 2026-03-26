import {
  LayoutDashboard,
  Store,
  Users,
  Activity,
  BarChart3,
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  Package,
  BookOpen,
  ArrowUpDown,
  ClipboardList,
} from "lucide-react";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { FEATURE_FLAGS } from "@/shared/constants/featureFlags";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    label: "Franchises",
    path: "/super-admin/franchises",
    icon: Users,
    permission: PERMISSIONS.FRANCHISE_VIEW,
  },
  {
    label: "Outlets",
    path: "/outlets",
    icon: Store,
    permission: PERMISSIONS.OUTLET_VIEW,
  },
  {
    label: "Menu",
    path: "/menu",
    icon: UtensilsCrossed,
    permission: PERMISSIONS.MENU_MANAGE,
  },
  {
    label: "Devices",
    path: "/devices",
    icon: Activity,
    permission: PERMISSIONS.DEVICE_VIEW,
  },
  ...(FEATURE_FLAGS.KIOSK_TELEMETRY_ADMIN_ENABLED
    ? [
        {
          label: "Kiosk Telemetry",
          path: "/telemetry/kiosk",
          icon: BarChart3,
          permission: PERMISSIONS.TELEMETRY_VIEW,
        },
      ]
    : []),
  {
    label: "Users",
    path: "/users",
    icon: Users,
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    label: "Ingredients",
    path: "/ingredients",
    icon: Package,
    permission: PERMISSIONS.INGREDIENT_MANAGE,
  },
  {
    label: "Recipes",
    path: "/recipes",
    icon: BookOpen,
    permission: PERMISSIONS.RECIPE_MANAGE,
  },
  {
    label: "Stock Log",
    path: "/stock-transactions",
    icon: ArrowUpDown,
    permission: PERMISSIONS.INVENTORY_MANAGE,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ClipboardList,
    permission: PERMISSIONS.ORDERS_VIEW,
  },
  {
    label: "Kitchen Display",
    path: "/kitchen",
    icon: ChefHat,
    permission: PERMISSIONS.ORDERS_KITCHEN_VIEW,
  },
  {
    label: "Pickup Counter",
    path: "/pickup",
    icon: ShoppingBag,
    permission: PERMISSIONS.ORDERS_PICKUP_VIEW,
  },
];
