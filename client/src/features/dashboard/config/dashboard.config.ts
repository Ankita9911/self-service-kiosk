import { Users, Store, Activity } from "lucide-react";
import { PERMISSIONS } from "@/shared/lib/permissions";

export const DASHBOARD_CARDS = [
  {
    title: "Franchises",
    description:
      "Manage and monitor all registered franchise partners across the network.",
    permission: PERMISSIONS.FRANCHISE_VIEW,
    route: "/super-admin/franchises",
    icon: Users,
    badge: "Partners",
  },
  {
    title: "Outlets",
    description:
      "Oversee operational kiosk outlets, locations, and performance metrics.",
    permission: PERMISSIONS.OUTLET_VIEW,
    route: "/outlets",
    icon: Store,
    badge: "Locations",
  },
  {
    title: "Devices",
    description:
      "Monitor and manage kiosk hardware and software status across all outlets.",
    permission: PERMISSIONS.DEVICE_VIEW,
    route: "/devices",
    icon: Activity,
    badge: "Hardware",
  },
];