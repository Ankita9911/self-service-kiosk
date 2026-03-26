import { useEffect } from "react";
import {
  getCurrentVisitorSession,
  trackEvent,
  trackPageView,
} from "@/features/kiosk/telemetry";
import LoginBackground from "../components/LoginBackground";
import KioskLoginCard from "../components/KioskLoginCard";
import { useKioskLogin } from "../hooks/useKioskLogin";

export default function KioskLoginPage() {
  const login = useKioskLogin();

  useEffect(() => {
    trackPageView("login");

    return () => {
      if (!getCurrentVisitorSession()) return;
      trackEvent({
        name: "kiosk.page_exited",
        page: "login",
        component: "page",
        action: "exit",
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-linear-to-br from-[#e6f7f3] via-[#f7fcfb] to-white p-4 md:p-6">
      <LoginBackground />

      <KioskLoginCard
        deviceId={login.deviceId}
        setDeviceId={login.setDeviceId}
        secret={login.secret}
        setSecret={login.setSecret}
        showSecret={login.showSecret}
        setShowSecret={login.setShowSecret}
        loading={login.loading}
        error={login.error}
        onLogin={login.handleLogin}
        onKeyDown={login.handleKeyDown}
      />
    </div>
  );
}
