import axios from "axios";
import toast from "react-hot-toast";
import { clearKioskSession, getKioskToken } from "@/shared/lib/kioskSession";

const kioskAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : "http://localhost:3000/api",
});

kioskAxios.interceptors.request.use((config) => {
  const token = getKioskToken();

  if (!token) {
    toast.error("Kiosk not authenticated");
    return Promise.reject(new Error("Kiosk token missing"));
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let kioskRedirecting = false;

function redirectKioskToLogin(message: string) {
  if (kioskRedirecting) return;
  kioskRedirecting = true;
  clearKioskSession();
  toast.error(message);
  window.location.href = "/kiosk/login";
}

kioskAxios.interceptors.response.use(
  (response) => {
    const message = response.data?.message;
    if (message && response.config.method !== "get") {
      toast.success(message, { id: message });
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        redirectKioskToLogin("Kiosk session expired.");
        return Promise.reject(error);
      }

      if (status === 403) {
        redirectKioskToLogin("This device has been deactivated.");
        return Promise.reject(error);
      }

      const errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        "Something went wrong";
      toast.error(errorMessage, { id: errorMessage });
    } else if (error.request) {
      toast.error("Kiosk offline. Check network.", { id: "kiosk-offline" });
    }

    return Promise.reject(error);
  },
);

export default kioskAxios;
