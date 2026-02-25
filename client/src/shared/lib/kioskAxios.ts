import axios from "axios";
import toast from "react-hot-toast";

const kioskAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : "http://localhost:3000/api",
});

kioskAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kiosk_token");

    if (!token) {
      toast.error("Kiosk not authenticated");
      return Promise.reject(new Error("Kiosk token missing"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }
);

kioskAxios.interceptors.response.use(
  (response) => {
    const message = response.data?.message;
    if (message && response.config.method !== "get") {
      toast.success(message, { id: message });
    }

    return response;
  },
  (error) => {
    let errorMessage = "Something went wrong";

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        errorMessage;
      if (error.response.status === 401) {
        localStorage.removeItem("kiosk_token");
        toast.error("Kiosk session expired");
        window.location.href = "/kiosk/login";
      }
    } else if (error.request) {
      errorMessage = "Kiosk offline. Check network.";
    }

    toast.error(errorMessage, { id: errorMessage });

    return Promise.reject(error);
  }
);

export default kioskAxios;