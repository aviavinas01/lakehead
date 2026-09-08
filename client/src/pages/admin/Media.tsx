import { Link, useLocation } from "react-router-dom";
import AdminNav from "./AdminNav";
import MediaPanel from "./MediaLibrary";
import ClipsPanel from "./TikTokClips";
import YouTubeClipsPanel from "./YouTubeClips";

/**
 * Everything the site shows that is not writing: pictures and TikTok clips,
 * under one heading with two tabs.
 *
 * THEY WERE TWO SECTIONS AND SHOULD NOT HAVE BEEN. Both answer the same
 * question — what appears on the site, and where — and splitting them put
 * two items in the nav for one job, so choosing between them meant knowing
 * in advance which kind of thing you were looking for. One section, two
 * tabs.
 *
 * THE TAB IS THE URL, not component state. /admin/media and /admin/tiktok
 * both land here and each opens its own tab, which means every link and
 * bookmark that existed before this merge still works, the back button moves
 * between tabs, and a tab can be linked to directly.
 */

const TABS = [
  { to: "/admin/media", label: "Pictures & albums" },
  { to: "/admin/tiktok", label: "TikTok clips" },
  { to: "/admin/youtube", label: "YouTube videos" },
];

export default function Media() {
  const { pathname } = useLocation();
  const onClips = pathname.startsWith("/admin/tiktok");
  const onTube = pathname.startsWith("/admin/youtube");

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>Media</h1>
        </div>

        <nav className="adm-tabs">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={pathname.startsWith(t.to) ? "is-on" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {onTube ? <YouTubeClipsPanel /> : onClips ? <ClipsPanel /> : <MediaPanel />}
      </main>
    </div>
  );
}
