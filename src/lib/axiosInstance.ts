import { authService } from "@/services/auth.service";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

console.log(import.meta.env.VITE_API_URL, "here is the baseURL");

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: attach auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken(); // or from a store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 logout & 403 refresh
// Response interceptor: handle 401 logout & 403 refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError & { config?: AxiosRequestConfig & { _retry?: boolean } }
  ) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // 401: Unauthorized → logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      authService.triggerLogout(); // or from store
      // Optionally redirect to login page
      // window.location.href = "/login";
      return Promise.reject(error);
    }

    // 403: Forbidden → try refresh token once
    /*  if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await authService.refreshToken();

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        authService.clear(); // or from store
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    } */

    return Promise.reject(error);
  }
);
