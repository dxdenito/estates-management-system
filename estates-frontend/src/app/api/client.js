import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const AUTH_PATHS = ["/auth/me", "/auth/login", "/auth/logout"];

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthCall = AUTH_PATHS.some((path) => url.endsWith(path));

    if (error.response?.status === 401 && !isAuthCall && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);