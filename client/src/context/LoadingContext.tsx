import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import api from "../api/client";

/**
 * Tracks work in flight so the whole app can show one loading state.
 *
 * Every call made through the shared axios instance is counted here by way
 * of interceptors, so pages get this for free — no per-request wiring, and
 * no chance of a page forgetting to switch a flag back off.
 */

interface LoadingValue {
  /** True while at least one request is outstanding */
  busy: boolean;
  /** Manual control, for work that does not go through axios */
  begin: () => void;
  end: () => void;
}

const LoadingContext = createContext<LoadingValue>({
  busy: false,
  begin: () => {},
  end: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0);
  /* A ref as well, so interceptors registered once still see live values */
  const inc = useRef(() => setPending((n) => n + 1));
  const dec = useRef(() => setPending((n) => Math.max(0, n - 1)));

  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      /* Opt out per call with `{ quiet: true }` — used by polling or
         background refreshes that should not raise the curtain. */
      if (!config.quiet) {
        config.counted = true;
        inc.current();
      }
      return config;
    });

    const settle = (config?: { counted?: boolean }) => {
      if (config?.counted) dec.current();
    };
    const resId = api.interceptors.response.use(
      (res) => {
        settle(res.config);
        return res;
      },
      (err) => {
        settle(err?.config);
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, []);

  const value = useMemo<LoadingValue>(
    () => ({
      busy: pending > 0,
      begin: () => inc.current(),
      end: () => dec.current(),
    }),
    [pending]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}
