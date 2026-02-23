import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { PERMISSIONS } from "@/shared/lib/permissions";

export function useMenuLanding(
  user: any,
  hasPermission: (permission: string) => boolean
) {
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.MENU_MANAGE)) {
      navigate("/");
      return;
    }

    if (user?.role === "OUTLET_MANAGER" && user?.outletId) {
      navigate(`/outlets/${user.outletId}/menu`, { replace: true });
      return;
    }

    if (
      user?.role === "FRANCHISE_ADMIN" ||
      user?.role === "SUPER_ADMIN"
    ) {
      getOutlets().then((list) => {
        setOutlets(list);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?.role, user?.outletId, hasPermission, navigate]);

  return { outlets, loading };
}