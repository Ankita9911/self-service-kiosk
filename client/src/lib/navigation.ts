import {
  LayoutDashboard,
  Store,
  Users,
  Activity,
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
    label: "Devices",
    path: "/devices",
    icon: Activity,
    permission: PERMISSIONS.DEVICE_VIEW,
  },
];
