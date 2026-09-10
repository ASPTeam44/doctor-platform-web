import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/lib/auth/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach Bearer JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize Error Messages & Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      // Clear token and broadcast session expiration
      tokenStorage.clearAuth();
      window.dispatchEvent(new CustomEvent("doctalk:unauthorized"));
    }

    // Standardize error message
    const message =
      error.response?.data?.message ||
      (status === 404
        ? "Requested resource was not found"
        : status === 403
        ? "You do not have permission to access this resource"
        : status === 500
        ? "A server error occurred. Please try again later."
        : error.message || "Network error. Please check your connection.");

    const normalizedError = new Error(message);
    (normalizedError as any).statusCode = status;
    (normalizedError as any).originalError = error;

    return Promise.reject(normalizedError);
  }
);
