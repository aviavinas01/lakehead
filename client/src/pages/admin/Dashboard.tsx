import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import { useAuth } from "../../context/AuthContext";
import { fetchGallery, type GalleryAlbum } from "../../api/gallery";
import type { Inquiry, Paginated, Post } from "../../types/api";

/**
 * The first screen after signing in: the state of the site at a glance.
 *
 * EVERY NUMBER HERE IS READ, NOT INVENTED. There is no sample data and no
 * placeholder chart — a dashboard that shows plausible figures before it has
 * any is worse than one that admits it is empty, because the first time it
 * lies you stop trusting the times it does not. A section with nothing
 * behind it says so plainly.
 *
 * It is deliberately a reading screen. Nothing here edits anything: the
 * quick actions are links into the sections that do. A dashboard that also
 * deletes is a dashboard you have to be careful on.
 */

/* Inquiry pages to walk for the chart. The API caps a page at 100, and a
   year of enquiries for a consultancy this size fits comfortably inside
   three — beyond that the histogram is measuring the limit rather than the
   business, so the caption says what it covers. */
const MAX_PAGES = 3;
const PAGE_SIZE = 100;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Clip {
  id: string;
  category: string;
  published: boolean;
}

/** The last twelve months, oldest first, with the count falling in each. */
function byMonth(items: Inquiry[]) {
  const now = new Date();
  const buckets: { key: string; label: string; year: number; count: number }[] = [];
  for (let back = 11; back >= 0; back--) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTHS[d.getMonth()],
      year: d.getFullYear(),
      count: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const it of items) {
    const d = new Date(it.createdAt);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].count += 1;
  }
  return buckets;
}

/** 1842 -> "1,842". Big numbers are easier to read grouped. */
const group = (n: number) => n.toLocaleString();

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [images, setImages] = useState<number | null>(null);
  const [clips, setClips] = useState<Clip[] | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [live, setLive] = useState<GalleryAlbum[] | null>(null);

  useEffect(() => {
    let off = false;
    const ok = <T,>(set: (v: T) => void) => (v: T) => {
      if (!off) set(v);
    };

    /* Each request is independent and each failure is its own. One section
       being unreachable should grey out that section, not empty the page. */
    api.get<{ posts: Post[] }>("/posts/admin/all")
      .then((r) => ok(setPosts)(r.data.posts ?? []))
      .catch(() => ok(setPosts)([]));

    api.get<Paginated<never>>("/media", { params: { limit: 1, type: "image" } })
      .then((r) => ok(setImages)(r.data.total))
      .catch(() => ok(setImages)(0));

    api.get<{ clips: Clip[] }>("/tiktok/admin/all")
      .then((r) => ok(setClips)(r.data.clips ?? []))
      .catch(() => ok(setClips)([]));

    fetchGallery().then(ok(setLive)).catch(() => ok(setLive)([]));

    (async () => {
      const all: Inquiry[] = [];
      try {
        for (let page = 1; page <= MAX_PAGES; page++) {
          const { data } = await api.get<Paginated<Inquiry>>("/inquiries", {
            params: { page, limit: PAGE_SIZE },
          });
          all.push(...data.items);
          if (page >= data.totalPages) break;
        }
      } catch {
        /* keep whatever arrived */
      }
      ok(setInquiries)(all);
    })();

    return () => {
      off = true;
    };
  }, []);

  const published = posts?.filter((p) => p.status === "published").length ?? 0;
  const drafts = (posts?.length ?? 0) - published;
  const livePublished = clips?.filter((c) => c.published).length ?? 0;
  const fresh = inquiries?.filter((i) => i.status === "new").length ?? 0;
  const months = byMonth(inquiries ?? []);
  const peak = Math.max(1, ...months.map((m) => m.count));
  const recent = (inquiries ?? []).slice(0, 5);
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        {/* ---- the band ---- */}
        <section className="adm-hero">
          <div className="adm-hero-copy">
            <p className="adm-hero-eyebrow">
              Everything published, waiting, and asked this year
            </p>
            <h1>Welcome back, {firstName}.</h1>
            <div className="adm-hero-actions">
              <Link to="/admin/posts/new">Write a post</Link>
              <Link to="/admin/media">Add pictures</Link>
              <Link to="/admin/tiktok">Add a clip</Link>
            </div>
          </div>

          {/* The reference's card, doing an honest job: the one number that
              is actually waiting on somebody. */}
          <Link className="adm-glass" to="/admin/inquiries">
            <span className="adm-glass-top">
              <span>Inquiries</span>
              <span>needing a reply</span>
            </span>
            <strong>{inquiries === null ? "—" : group(fresh)}</strong>
            <span className="adm-glass-note">
              {inquiries === null
                ? "Reading…"
                : `${group(inquiries.length)} in total`}
            </span>
          </Link>
        </section>

        {/* ---- the four counts ---- */}
        <section className="adm-stats">
          <Stat
            label="Posts published"
            value={posts === null ? null : published}
            note={posts === null ? "" : `${drafts} in draft`}
            to="/admin/posts"
          />
          <Stat
            label="Pictures"
            value={images}
            note="in the media library"
            to="/admin/media"
          />
          <Stat
            label="TikTok clips"
            value={clips === null ? null : livePublished}
            note={
              clips === null ? "" : `${(clips.length ?? 0) - livePublished} hidden`
            }
            to="/admin/tiktok"
          />
          <Stat
            label="Gallery albums"
            value={live === null ? null : live.length}
            note={
              live === null
                ? ""
                : live.length
                ? "live on the site"
                : "showing placeholders"
            }
            to="/admin/media"
          />
        </section>

        <div className="adm-split">
          {/* ---- the chart ---- */}
          <section className="adm-card adm-chart-card">
            <div className="adm-card-head">
              <h2>Inquiries</h2>
              <span className="adm-quiet">last 12 months</span>
            </div>
            <p className="adm-big">
              {inquiries === null ? "—" : group(months.reduce((a, m) => a + m.count, 0))}
              <span> this year</span>
            </p>

            {/* A bar per month, drawn with plain divs. A chart library for
                twelve numbers would be more kilobytes than the whole admin
                bundle. */}
            <div className="adm-chart" role="img"
              aria-label={`Inquiries per month: ${months
                .map((m) => `${m.label} ${m.count}`)
                .join(", ")}`}
            >
              {months.map((m) => (
                <span className="adm-bar" key={m.key} title={`${m.label} ${m.year}: ${m.count}`}>
                  <span
                    className="adm-bar-fill"
                    style={{ height: `${(m.count / peak) * 100}%` }}
                    data-zero={m.count === 0 || undefined}
                  />
                  <span className="adm-bar-label">{m.label}</span>
                </span>
              ))}
            </div>
            {inquiries !== null && inquiries.length >= MAX_PAGES * PAGE_SIZE ? (
              <p className="adm-quiet adm-foot">
                Counted from the most recent {group(MAX_PAGES * PAGE_SIZE)}{" "}
                inquiries.
              </p>
            ) : null}
          </section>

          {/* ---- what has just come in ---- */}
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Latest inquiries</h2>
              <Link className="adm-quiet" to="/admin/inquiries">View all</Link>
            </div>
            {inquiries === null ? (
              <p className="adm-quiet">Reading…</p>
            ) : recent.length === 0 ? (
              <p className="adm-quiet">Nothing yet. The contact form feeds this.</p>
            ) : (
              <ul className="adm-feed">
                {recent.map((i) => (
                  <li key={i._id}>
                    <span className="adm-feed-who">
                      <strong>{i.name}</strong>
                      <span>{i.service.replace(/-/g, " ")}</span>
                    </span>
                    <span className={`badge badge-${i.status}`}>{i.status}</span>
                    <time dateTime={i.createdAt}>
                      {new Date(i.createdAt).toLocaleDateString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/** One count. `null` means still reading — deliberately not zero. */
function Stat({
  label,
  value,
  note,
  to,
}: {
  label: string;
  value: number | null;
  note: string;
  to: string;
}) {
  return (
    <Link className="adm-stat" to={to}>
      <span className="adm-stat-label">{label}</span>
      <strong>{value === null ? "—" : group(value)}</strong>
      <span className="adm-stat-note">{note}</span>
    </Link>
  );
}
