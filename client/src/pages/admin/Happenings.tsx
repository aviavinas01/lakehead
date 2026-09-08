import { Link, useLocation } from "react-router-dom";
import AdminNav from "./AdminNav";
import EventsPanel from "./EventsPanel";
import NewsPanel from "./NewsPanel";

/**
 * What is happening: events we are running, and news worth pointing at.
 *
 * ONE SECTION, TWO TABS — the same arrangement as Media, and for the same
 * reason. Both answer "what should the site be announcing right now", and
 * splitting them would put two more items in a nav that already has four,
 * so choosing between them would mean knowing in advance which kind of thing
 * you were about to add.
 *
 * They are genuinely different underneath, which is why they are tabs rather
 * than one list: an event is OURS — typed here, with a date and a place, and
 * a draft until it is confirmed. A news item is SOMEBODY ELSE'S — a link, a
 * borrowed picture, and live the moment it is saved.
 *
 * THE TAB IS THE URL, not component state, so /admin/events and /admin/news
 * can each be linked and bookmarked and the back button moves between them.
 */

const TABS = [
  { to: "/admin/events", label: "Events" },
  { to: "/admin/news", label: "News links" },
];

export default function Happenings() {
  const { pathname } = useLocation();
  const onNews = pathname.startsWith("/admin/news");

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>Events &amp; news</h1>
        </div>

        <nav className="adm-tabs">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={(t.to === "/admin/news") === onNews ? "is-on" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {onNews ? <NewsPanel /> : <EventsPanel />}
      </main>
    </div>
  );
}
