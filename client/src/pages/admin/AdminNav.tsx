import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * The admin bar: a pill rail in the middle, identity on the right.
 *
 * `NavLink` rather than `Link` so the current section carries the filled
 * pill without any page having to say which one it is — the router already
 * knows, and a page that had to announce itself is a page that can be wrong.
 *
 * `end` on the dashboard link only: without it, "/admin" counts as a prefix
 * of every admin route and every screen would light up the first pill.
 */

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  /** Extra path prefixes that should also light this pill. */
  match?: string[];
}

const LINKS: NavItem[] = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/posts", label: "Posts" },
  /* One pill for both media tabs. `match` is the prefix list that lights it
     up, because the section answers to two addresses. */
  { to: "/admin/media", label: "Media", match: ["/admin/media", "/admin/tiktok"] },
  { to: "/admin/inquiries", label: "Inquiries" },
];

/** The signed-in account's initial, for the corner disc. */
const initial = (name?: string) => (name?.trim()?.[0] ?? "L").toUpperCase();

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <header className="adm-bar">
      <div className="adm-bar-inner">
        <Link to="/admin" className="adm-mark" aria-label="Lakehead admin">
          <img src="/logo.png" alt="" />
        </Link>

        <nav className="adm-pills">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                isActive || l.match?.some((m) => pathname.startsWith(m))
                  ? "is-on"
                  : undefined
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="adm-bar-end">
          <Link className="adm-ghost" to="/" target="_blank" rel="noreferrer">
            View site
          </Link>
          <span className="adm-who" title={user?.name}>
            {initial(user?.name)}
          </span>
          <button className="adm-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
