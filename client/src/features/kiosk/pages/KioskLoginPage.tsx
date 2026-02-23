import LoginBackground from "../components/LoginBackground";
import KioskLoginCard from "../components/KioskLoginCard";
import { useKioskLogin } from "../hooks/useKioskLogin";

export default function KioskLoginPage() {
  const login = useKioskLogin();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 60% 10%, #fff7ed 0%, #ffedd5 40%, #fed7aa 100%)",
      }}
    >
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