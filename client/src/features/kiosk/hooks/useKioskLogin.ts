import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { kioskLogin } from "@/features/device/services/device.service";

export function useKioskLogin() {
  const navigate = useNavigate();

  const [deviceId, setDeviceId] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!deviceId.trim() || !secret.trim()) {
      setError("Please enter both Device ID and Secret Key.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { token } = await kioskLogin(
        deviceId.trim().toUpperCase(),
        secret.trim()
      );

      localStorage.setItem("kiosk_token", token);
      navigate("/kiosk", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Invalid Device ID or Secret Key.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return {
    deviceId,
    setDeviceId,
    secret,
    setSecret,
    showSecret,
    setShowSecret,
    loading,
    error,
    handleLogin,
    handleKeyDown,
  };
}