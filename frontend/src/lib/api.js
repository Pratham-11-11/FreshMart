import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://freshmart-backend-x3gy.onrender.com";

const api = axios.create({
  baseURL: API_URL.replace(/\/+$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fm_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle expired/invalid authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fm_token");
      localStorage.removeItem("fm_user");
    }

    return Promise.reject(error);
  },
);

export { api };
export default api;
