import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Outlet } from "react-router-dom";

/**
 * Light or dark, for the admin only.
 *
 * ------------------------------------------------------------------
 * THE PUBLIC SITE CANNOT BE AFFECTED, and that is the design constraint the
 * rest of this follows from.
 *
 * The theme is expressed as one attribute on <html>, and this component is a
 * layout route wrapping the admin routes — so the attribute exists only while
 * an admin page is mounted and is removed the moment one is not. Click the
 * logo in the admin bar to go to the site and the attribute goes with the
 * unmount, in the same tick, before anything public paints. There is no
 * window in which a dark token is live on a public page.
 *
 * It is on <html> rather than on the admin wrapper because the page
 * background belongs to <body>, which is outside every admin root — and there
 * are three of those (`.adm`, `.alog`, `.ed`), so there is no single element
 * to hang it on anyway.
 *
 * LIGHT IS THE DEFAULT, ALWAYS. This briefly followed the operating system
 * instead, which meant anybody whose laptop was in dark mode opened the
 * dashboard and found it unrecognisable without having asked for anything.
 * A theme is a preference, and an unrequested one is a surprise — so the
 * admin opens exactly as it always has, and only changes if somebody presses
 * the toggle. That choice is then remembered for that browser.
 *
 * The consequence, deliberately accepted: somebody who prefers dark has to
 * ask for it once per browser. That is a far smaller cost than the reverse.
 *
 * STORAGE IS BEST-EFFORT. Private windows and locked-down browsers throw on
 * localStorage access rather than returning null, so every read and write is
 * wrapped. Losing the preference is a small annoyance; an admin screen that
 * throws on load is not.
 * ------------------------------------------------------------------
 */

export type Theme = "light" | "dark";

const KEY = "lakehead:admin-theme";
const ATTR = "data-admin-theme";

interface Value {
  theme: Theme;
  toggle: () => void;
}

const AdminThemeContext = createContext<Value>({
  theme: "light",
  toggle: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

/** Dark only if this browser was explicitly told so. Anything else — no
    value, a corrupted one, storage that throws — is light. */
const readStored = (): Theme => {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

/**
 * A layout route. Wrap the admin routes in it — see App.tsx.
 */
export default function AdminTheme() {
  const [theme, setTheme] = useState<Theme>(readStored);

  /* THE WHOLE CONTAINMENT STORY IS THIS EFFECT. It sets the attribute while
     an admin route is mounted and removes it on the way out, so nothing
     public ever sees an admin token. */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(ATTR, theme);
    return () => root.removeAttribute(ATTR);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* Not storable in this browser. The choice still applies for this
           visit; it simply will not be remembered. */
      }
      return next;
    });
  }, []);

  return (
    <AdminThemeContext.Provider value={{ theme, toggle }}>
      <Outlet />
    </AdminThemeContext.Provider>
  );
}
