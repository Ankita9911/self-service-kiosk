import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send httpOnly cookie on every request
});

// Prevent multiple simultaneous 401/403 responses from spamming logout/toasts
let isLoggingOut = false;

function hasToastHeader(headers: unknown, key: string): boolean {
  if (!headers || typeof headers !== "object") return false;
  const record = headers as Record<string, unknown>;
  const val = record[key] ?? record[key.toLowerCase()];
  return val === true || val === "true";
}

axiosInstance.interceptors.response.use(
  (response) => {
    const message = response.data?.message;
    const skipSuccessToast = hasToastHeader(
      response.config.headers,
      "x-skip-success-toast",
    );
    if (message && response.config.method !== "get" && !skipSuccessToast) {
      toast.success(message);
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;

      if (
        status === 401 ||
        (status === 403 && errorCode === "ACCOUNT_INACTIVE")
      ) {
        // Session is gone or account was deactivated — trigger logout once
        if (!isLoggingOut) {
          isLoggingOut = true;
          window.dispatchEvent(new Event("auth:logout"));
          setTimeout(() => {
            isLoggingOut = false;
          }, 3000);
        }
        return Promise.reject(error);
      }

      const skipErrorToast = hasToastHeader(
        error.config?.headers,
        "x-skip-error-toast",
      );
      if (skipErrorToast) return Promise.reject(error);

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
  },
);

export default axiosInstance;
