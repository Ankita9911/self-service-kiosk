import axios from "axios";

const kioskAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : "http://localhost:3000/api", //crash the app if base url not found
});

kioskAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("kiosk_token");
  if(!token){
     throw new Error("token not found");
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }//redirect to login\
  return config;
});

export default kioskAxios;