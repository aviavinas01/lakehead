import { Link, useLocation } from "react-router-dom";
import AdminNav from "./AdminNav";
import DirectorPanel from "./DirectorPanel";
import StaffPanel from "./StaffPanel";

/**
 * The people behind the consultancy.
 *
 * ONE SECTION, TWO TABS — the same arrangement as Media and Events & news,
 * and for the same reason: both answer "who are we, on the website", and
 * splitting them would put two more items in a nav that already has five.
 *
 * They are genuinely different underneath, which is why they are tabs rather
 * than one list: the director is ONE record with a long statement and a page
 * of its own; the team is a LIST of short cards on the About page.
 *
 * THE TAB IS THE URL, so /admin/people and /admin/people/staff can each be
 * linked and bookmarked and the back button moves between them — the same
 * rule the other two-tab sections follow.
 *
 * This screen is reached from the account disc in the admin bar as well as
 * from its own nav pill; see AdminNav for why that disc leads here.
 */

const TABS = [
  { to: "/admin/people", label: "Director's message" },
  { to: "/admin/people/staff", label: "The team" },
];

export default function People() {
  const { pathname } = useLocation();
  const onStaff = pathname.startsWith("/admin/people/staff");

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>Our people</h1>
        </div>

        <nav className="adm-tabs">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={
                (t.to === "/admin/people/staff") === onStaff ? "is-on" : undefined
              }
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {onStaff ? <StaffPanel /> : <DirectorPanel />}
      </main>
    </div>
  );
}
