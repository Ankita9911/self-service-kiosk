import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {

    const message = response.data?.message;
    if (message && response.config.method !== "get") {
      toast.success(message);
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
    } else if (error.request) {
      errorMessage = "Server not reachable";
    }
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default axiosInstance;