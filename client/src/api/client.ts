import axios, { AxiosError } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Skip the global loading veil — for background or decorative fetches */
    quiet?: boolean;
    /** Set by LoadingContext so the response knows it was counted */
    counted?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
});

export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  if (err instanceof AxiosError) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
};

export default api;
