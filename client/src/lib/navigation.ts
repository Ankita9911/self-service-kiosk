import {
  LayoutDashboard,
  Store,
  Users,
  Activity,
  UtensilsCrossed,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";

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

];
