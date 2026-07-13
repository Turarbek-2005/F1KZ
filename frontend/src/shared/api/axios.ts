import axios from "axios";
import { clearStoredToken, getStoredToken } from "@/shared/lib/token";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const axiosClient = axios.create({
  baseURL,
  timeout: 20000,
});

export const axiosAuthClient = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
});

// Attach the stored token on every authenticated request. `withCredentials`
// still sends the cookie when the browser keeps it (local dev, same-site
// deploys); this header is what actually carries the session in production.
axiosAuthClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A rejected token is dead — drop it so we stop replaying it on every request.
axiosAuthClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken();
    }
    return Promise.reject(error);
  },
);
