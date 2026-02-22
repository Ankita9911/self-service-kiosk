import axios from "axios";

const kioskAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : "http://localhost:3000/api",
});

kioskAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("kiosk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default kioskAxios;