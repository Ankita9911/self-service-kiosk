import { useEffect, useState } from "react";
import { usePermission } from "@/shared/hooks/usePermissions";
import { DASHBOARD_CARDS } from "../config/dashboard.config";

export function useDashboard() {
  const { hasPermission } = usePermission();

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const visibleCards = DASHBOARD_CARDS.filter((c) =>
    hasPermission(c.permission)
  );

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return {
    loading,
    currentTime,
    visibleCards,
    greeting,
  };
}