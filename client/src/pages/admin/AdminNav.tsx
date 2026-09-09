import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * The admin bar: the mark on the left, a pill rail in the middle, identity
 * on the right.
 *
 * THE MARK LEAVES THE ADMIN rather than going to the dashboard. It replaced
 * a separate "View site" link, which was a second control pointing where the
 * logo already looked like it pointed. It is an ordinary in-app navigation
 * and not a new tab: the session survives, so coming back is one click.
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
  { to: "/admin/media", label: "Media", match: ["/admin/media", "/admin/tiktok", "/admin/youtube"] },
  /* Same arrangement: one pill, two addresses. See pages/admin/Happenings. */
  {
    to: "/admin/events",
    label: "Events & news",
    match: ["/admin/events", "/admin/news"],
  },
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
        {/* THE MARK IS THE WAY OUT TO THE SITE, which is why there is no
            longer a "View site" button beside the account: two controls for
            one destination, and the logo was the one people reach for. The
            dashboard is still one click away on the first pill. */}
        <Link to="/" className="adm-mark" aria-label="Go to the Lakehead website">
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
          {/* THE DISC IS THE WAY INTO "OUR PEOPLE", and the only one. It used
              to be decoration — an initial in a circle that looked like
              every account menu on the internet and did nothing when you
              pressed it. It now opens the director's message and the team,
              which is the right home for it: those are the pages about
              whoever is signed in, not another content type.

              There is deliberately no pill for it in the rail beside
              Posts and Media. That rail is for the things the site
              publishes; this is closer to an account screen, and giving it
              both entrances made it look like a sixth content section. */}
          <Link
            to="/admin/people"
            className="adm-who"
            title={`${user?.name ?? "Account"} — the director's message and the team`}
          >
            {initial(user?.name)}
          </Link>
          <button className="adm-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
