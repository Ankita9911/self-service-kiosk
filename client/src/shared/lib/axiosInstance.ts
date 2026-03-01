import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send httpOnly cookie on every request
});

axiosInstance.interceptors.request.use((config) => {
  return config;
});

// Prevent multiple simultaneous 401/403 responses from spamming logout/toasts
let isLoggingOut = false;

axiosInstance.interceptors.response.use(
  (response) => {

    const message = response.data?.message;
    if (message && response.config.method !== "get") {
      toast.success(message);
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Only 401 means the session is gone — trigger logout once
        if (!isLoggingOut) {
          isLoggingOut = true;
          window.dispatchEvent(new Event("auth:logout"));
          setTimeout(() => { isLoggingOut = false; }, 3000);
        }
        // Silently swallow — the redirect to /login is enough feedback
        return Promise.reject(error);
      }

      const errorMessage =
        error.response.data?.message ||
        error.response.statusText ||
        "Something went wrong";
      toast.error(errorMessage);
    } else if (error.request) {
      toast.error("Server not reachable");
    } else {
      toast.error("Something went wrong");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;