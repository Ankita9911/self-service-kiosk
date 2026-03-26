import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { kioskLogin } from "@/features/device/services/device.service";
import {
  flushUrgent,
  trackApiTiming,
  trackEvent,
} from "@/features/kiosk/telemetry";
import {
  setKioskToken,
  setKioskLandingConfig,
} from "@/shared/lib/kioskSession";

export function useKioskLogin() {
  const navigate = useNavigate();

  const [deviceId, setDeviceId] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLogin = async (source: "button" | "keyboard") => {
    trackEvent({
      name: "kiosk.login_submit_clicked",
      page: "login",
      component: "login_form",
      action: "submit",
      target: source,
      payload: {
        hasDeviceId: Boolean(deviceId.trim()),
        hasSecret: Boolean(secret.trim()),
      },
    });

    if (!deviceId.trim() || !secret.trim()) {
      setError("Please enter both Device ID and Secret Key.");
      trackEvent({
        name: "kiosk.login_submit_failed",
        page: "login",
        component: "login_form",
        action: "submit_failed",
        target: source,
        payload: {
          reasonCategory: "missing_fields",
          hasDeviceId: Boolean(deviceId.trim()),
          hasSecret: Boolean(secret.trim()),
        },
      });
      return;
    }

    setError(null);
    setLoading(true);
    const requestStartedAt = performance.now();

    try {
      const { token, landingImage, landingTitle, landingSubtitle } =
        await kioskLogin(deviceId.trim().toUpperCase(), secret.trim());

      trackApiTiming({
        name: "kiosk.login_api_timed",
        apiName: "devices/login",
        durationMs: performance.now() - requestStartedAt,
        success: true,
        page: "login",
        component: "login_form",
        target: source,
      });
      setKioskToken(token);
      setKioskLandingConfig({ landingImage, landingTitle, landingSubtitle });
      trackEvent({
        name: "kiosk.login_submit_succeeded",
        page: "login",
        component: "login_form",
        action: "submit_succeeded",
        target: source,
        payload: {
          deviceId: deviceId.trim().toUpperCase(),
        },
      });
      void flushUrgent();
      navigate("/kiosk/landing", { replace: true });
    } catch (err: unknown) {
      const response = axios.isAxiosError(err) ? err.response : undefined;
      const msg =
        response?.data?.message || "Invalid Device ID or Secret Key.";
      setError(msg);
      trackApiTiming({
        name: "kiosk.login_api_timed",
        apiName: "devices/login",
        durationMs: performance.now() - requestStartedAt,
        success: false,
        page: "login",
        component: "login_form",
        target: source,
        payload: {
          statusCode: response?.status,
        },
      });
      trackEvent({
        name: "kiosk.login_submit_failed",
        page: "login",
        component: "login_form",
        action: "submit_failed",
        target: source,
        payload: {
          reasonCategory: response ? "invalid_credentials" : "network_error",
          statusCode: response?.status,
          message: msg,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    void submitLogin("button");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      void submitLogin("keyboard");
    }
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
