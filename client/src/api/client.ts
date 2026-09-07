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
  /* THE CSRF DEFENCE, CLIENT HALF. The API refuses any POST/PUT/PATCH/DELETE
     that does not carry this header — see server middleware/csrf.ts for why
     that works. It is set here once rather than per call, so a request
     written later cannot forget it.

     If you ever call the API without axios, this header has to come with
     you or the request is rejected. */
  headers: { "X-Requested-By": "lakehead-admin" },
});

export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  if (err instanceof AxiosError) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
};

export default api;
