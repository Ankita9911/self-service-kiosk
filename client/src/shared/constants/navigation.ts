import {
  LayoutDashboard,
  Store,
  Users,
  Activity,
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  Package,
  BookOpen,
  ArrowUpDown,
} from "lucide-react";
import { PERMISSIONS } from "@/shared/lib/permissions";

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
