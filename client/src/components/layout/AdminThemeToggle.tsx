import { useAdminTheme } from "../../context/AdminTheme";

/**
 * Light ↔ dark, for the admin.
 *
 * ONE CONTROL, TWO PLACES: the admin bar, and the sign-in page — which has no
 * bar of its own. Without the second one the sign-in screen would be stuck on
 * whatever the system said while everything behind it was dark, which reads
 * as a fault rather than a decision.
 *
 * THE ICON SHOWS WHAT PRESSING IT DOES, not what is currently on. A sun on a
 * dark screen means "make it light"; a moon on a light one means "make it
 * dark". The other convention — showing the current state — leaves people
 * pressing it to find out. The label says so in words for anyone who cannot
 * see the difference.
 */

const Sun = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
);

export default function AdminThemeToggle({
  className = "adm-theme",
}: {
  /** The sign-in page places it differently — see the stylesheet. */
  className?: string;
}) {
  const { theme, toggle } = useAdminTheme();
  const goingTo = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      title={`Switch to ${goingTo} mode`}
      aria-label={`Switch to ${goingTo} mode`}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
