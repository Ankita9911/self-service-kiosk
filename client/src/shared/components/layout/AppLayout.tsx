import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { LogoutModal } from "./LogoutModal";
import useAuth from "@/shared/hooks/useAuth";
import { useLowStockAlert } from "@/shared/hooks/useLowStockAlert";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useLowStockAlert(user?.outletId ?? undefined);

  const handleLogoutConfirm = () => {
    logout();
    setLogoutOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fb] dark:bg-[#0d0f16] transition-colors duration-300">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AppHeader user={user} onLogoutRequest={() => setLogoutOpen(true)} />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <LogoutModal
        open={logoutOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
