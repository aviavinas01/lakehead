import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/api";

/**
 * The gate in front of the admin screens.
 *
 * `user` here is not local state that can be forged — AuthContext gets it by
 * asking the server on load, and the server reads it from an httpOnly cookie
 * the page cannot see. So a signed-out visitor cannot arrive here by editing
 * anything in the browser.
 *
 * WHAT THIS IS AND IS NOT. It decides what the interface OFFERS. It is not
 * what makes anything safe — every route behind it is guarded again on the
 * server by `protect` and `requireRole`, and that is the check that counts.
 * A guard here that the API did not also enforce would be a lock painted on
 * a door.
 *
 * What it is for is the other failure: an editor following a link to a
 * screen they cannot use, filling in a form, and being refused on submit.
 * Better to say so before they start.
 */
export default function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();

  /* Until /auth/me answers we know nothing — and must not guess. Redirecting
     here would bounce a signed-in admin to the login screen on every reload. */
  if (loading) return <div className="container section">Loading…</div>;

  if (!user) return <Navigate to="/admin/login" replace />;

  /* Signed in, wrong role. Sent to the dashboard rather than to login: they
     are not being asked to prove who they are, they simply cannot use this
     screen, and bouncing them to a sign-in form they have already passed
     reads as the site being broken. */
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
