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
  /* RELATIVE ON PURPOSE, AND IT MATTERS. vercel.json rewrites /api/* through
     to the Render service, so the browser talks to one origin and the session
     and gate cookies are first-party. Setting VITE_API_URL to the API's own
     host would make them third-party cookies — silently dropped by Safari,
     Brave, Chrome Incognito and anything with tracking protection — and
     sign-in would fail with "Invalid email or password" however correct the
     password was. See client/.env.example. */
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

/**
 * The message to show a person, plus the reference if the server sent one.
 *
 * Most errors say what went wrong. Sign-in deliberately does not — every
 * failure answers "Invalid email or password", so an attacker cannot tell a
 * real address from a wrong password. The reference is how somebody with
 * access to the server logs gets the real reason back: it is random and means
 * nothing on its own, but it appears in exactly one log line. Showing it
 * turns "it just says invalid" into a question that has an answer.
 */
export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string; ref?: string } | undefined;
    const message = data?.message ?? fallback;
    return data?.ref ? `${message} (ref ${data.ref})` : message;
  }
  return fallback;
};

export default api;
