import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import AdminNav from "./AdminNav";
import InquiryChart from "./InquiryChart";
import { useAuth } from "../../context/AuthContext";
import { fetchGallery, type GalleryAlbum } from "../../api/gallery";
import {
  fetchAllEvents,
  fetchAllNews,
  type LakeheadEvent,
  type NewsItem,
} from "../../api/happenings";
import {
  asPercent,
  backlog,
  byMonth,
  byService,
  cumulative,
  daysSince,
  movement,
  oldestWaiting,
} from "../../lib/inquiryStats";
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
 * IT SHOWS BOTH SIDES OF THE ENQUIRIES, on purpose. What is coming in and
 * what people are asking for is the half that flatters you; how much of it
 * is still sitting unanswered is the half that changes what you do today.
 * Enquiries can climb every month while the unanswered pile climbs with
 * them, and a screen that only drew the first would call that a good month.
 * See lib/inquiryStats, where all the counting happens.
 *
 * It is deliberately a reading screen. Nothing here edits anything: the
 * quick actions are links into the sections that do. A dashboard that also
 * deletes is a dashboard you have to be careful on.
 */

/* Inquiry pages to walk. The API caps a page at 100, and a year of enquiries
   for a consultancy this size fits comfortably inside three — beyond that
   the chart is measuring the limit rather than the business, so the caption
   below says what it covers. */
const MAX_PAGES = 3;
const PAGE_SIZE = 100;

/** The windows the chart offers. */
const RANGES = [
  { months: 6, label: "6 months" },
  { months: 12, label: "12 months" },
] as const;

interface Clip {
  id: string;
  category: string;
  published: boolean;
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
  const [events, setEvents] = useState<LakeheadEvent[] | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);

  /* Chart controls. Two questions about the same numbers: "how busy was each
     month" and "how has the total grown" — one is a rate and the other is an
     accumulation, and neither answers the other. */
  const [range, setRange] = useState<number>(12);
  const [asTotal, setAsTotal] = useState(false);

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
    fetchAllEvents().then(ok(setEvents)).catch(() => ok(setEvents)([]));
    fetchAllNews().then(ok(setNews)).catch(() => ok(setNews)([]));

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
  const eventsLive = events?.filter((e) => e.published).length ?? 0;
  const newsLive = news?.filter((n) => n.published).length ?? 0;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";

  /* Recomputed only when the list or a control changes — every one of these
     walks the whole array, and they would otherwise run on each keystroke
     the chart's arrow keys generate. */
  const list = useMemo(() => inquiries ?? [], [inquiries]);
  const month = useMemo(() => movement(list, 30), [list]);
  const buckets = useMemo(() => {
    const raw = byMonth(list, range);
    return asTotal ? cumulative(raw) : raw;
  }, [list, range, asTotal]);
  const demand = useMemo(() => byService(list, 90), [list]);
  const stand = useMemo(() => backlog(list), [list]);
  const waiting = useMemo(() => oldestWaiting(list), [list]);

  const recent = list.slice(0, 5);
  const capped = inquiries !== null && inquiries.length >= MAX_PAGES * PAGE_SIZE;

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
              <Link to="/admin/events">Add an event</Link>
            </div>
          </div>

          {/* The one number that is actually waiting on somebody. */}
          <Link className="adm-glass" to="/admin/inquiries">
            <span className="adm-glass-top">
              <span>Inquiries</span>
              <span>needing a reply</span>
            </span>
            <strong>{inquiries === null ? "—" : group(stand.counts.new)}</strong>
            <span className="adm-glass-note">
              {inquiries === null
                ? "Reading…"
                : `${group(list.length)} in total · ${Math.round(
                    stand.answeredShare * 100
                  )}% answered`}
            </span>
          </Link>
        </section>

        {/* ---- the counts ---- */}
        <section className="adm-stats">
          <Stat
            label="Inquiries this month"
            value={inquiries === null ? null : month.now}
            note={
              inquiries === null
                ? ""
                : month.delta === null
                ? "nothing in the month before"
                : `${asPercent(month.delta)} on the 30 days before`
            }
            trend={month.delta}
            to="/admin/inquiries"
          />
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
            note={clips === null ? "" : `${(clips.length ?? 0) - livePublished} hidden`}
            to="/admin/tiktok"
          />
          <Stat
            label="Events"
            value={events === null ? null : eventsLive}
            note={events === null ? "" : `${(events.length ?? 0) - eventsLive} in draft`}
            to="/admin/events"
          />
          <Stat
            label="News links"
            value={news === null ? null : newsLive}
            note={news === null ? "" : `${(news.length ?? 0) - newsLive} hidden`}
            to="/admin/news"
          />
          <Stat
            label="Gallery albums"
            value={live === null ? null : live.length}
            note={
              live === null ? "" : live.length ? "live on the site" : "showing placeholders"
            }
            to="/admin/media"
          />
        </section>

        {/* ---- the graph ---- */}
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>Inquiries over time</h2>
            <div className="adm-toggles">
              {RANGES.map((r) => (
                <button
                  key={r.months}
                  type="button"
                  className={range === r.months ? "is-on" : undefined}
                  aria-pressed={range === r.months}
                  onClick={() => setRange(r.months)}
                >
                  {r.label}
                </button>
              ))}
              <span className="adm-toggle-gap" aria-hidden="true" />
              <button
                type="button"
                className={!asTotal ? "is-on" : undefined}
                aria-pressed={!asTotal}
                onClick={() => setAsTotal(false)}
              >
                Each month
              </button>
              <button
                type="button"
                className={asTotal ? "is-on" : undefined}
                aria-pressed={asTotal}
                onClick={() => setAsTotal(true)}
              >
                Running total
              </button>
            </div>
          </div>

          {inquiries === null ? (
            <p className="adm-quiet">Reading…</p>
          ) : list.length === 0 ? (
            <p className="adm-quiet">
              No inquiries yet. The contact form on the site feeds this.
            </p>
          ) : (
            <InquiryChart buckets={buckets} cumulative={asTotal} />
          )}

          {capped ? (
            <p className="adm-quiet adm-foot">
              Counted from the most recent {group(MAX_PAGES * PAGE_SIZE)} inquiries.
            </p>
          ) : null}
        </section>

        <div className="adm-split">
          {/* ---- demand ---- */}
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>What people are asking for</h2>
              <span className="adm-quiet">last 90 days</span>
            </div>

            {inquiries === null ? (
              <p className="adm-quiet">Reading…</p>
            ) : demand.length === 0 ? (
              <p className="adm-quiet">Nothing in the last 90 days.</p>
            ) : (
              <ul className="adm-demand">
                {demand.map((d) => (
                  <li key={d.service}>
                    <span className="adm-demand-top">
                      <span className="adm-demand-name">{d.label}</span>
                      <span className="adm-demand-n">
                        {group(d.count)}
                        <em>{Math.round(d.share * 100)}%</em>
                      </span>
                    </span>
                    {/* The bar is scaled to the LEADER, not to the total —
                        at five services a share bar is a row of stubs, and
                        the comparison that matters is with the top one. */}
                    <span className="adm-demand-bar">
                      <span
                        style={{ width: `${(d.count / demand[0].count) * 100}%` }}
                      />
                    </span>
                    <span className="adm-demand-move" data-dir={dir(d.delta)}>
                      {d.delta === null
                        ? "new this quarter"
                        : `${asPercent(d.delta)} on the quarter before`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ---- supply: what we have done about it ---- */}
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Where they stand</h2>
              <Link className="adm-quiet" to="/admin/inquiries">
                Open
              </Link>
            </div>

            {inquiries === null ? (
              <p className="adm-quiet">Reading…</p>
            ) : list.length === 0 ? (
              <p className="adm-quiet">Nothing to answer yet.</p>
            ) : (
              <>
                <p className="adm-big">
                  {Math.round(stand.answeredShare * 100)}%
                  <span> picked up</span>
                </p>

                {/* One bar, three parts — the split reads faster as a single
                    line than as three separate figures to hold in your head. */}
                <div
                  className="adm-split-bar"
                  role="img"
                  aria-label={`${stand.counts.new} new, ${stand.counts.contacted} contacted, ${stand.counts.closed} closed`}
                >
                  {(["new", "contacted", "closed"] as const).map((k) =>
                    stand.counts[k] > 0 ? (
                      <span
                        key={k}
                        data-part={k}
                        style={{ width: `${(stand.counts[k] / stand.total) * 100}%` }}
                        title={`${k}: ${stand.counts[k]}`}
                      />
                    ) : null
                  )}
                </div>

                <ul className="adm-legend">
                  {(["new", "contacted", "closed"] as const).map((k) => (
                    <li key={k}>
                      <span data-part={k} aria-hidden="true" />
                      <strong>{group(stand.counts[k])}</strong> {k}
                    </li>
                  ))}
                </ul>

                {waiting ? (
                  <p className="adm-oldest">
                    Longest wait: <strong>{waiting.name}</strong> —{" "}
                    {daysSince(waiting.createdAt)} day
                    {daysSince(waiting.createdAt) === 1 ? "" : "s"} without a reply.
                  </p>
                ) : (
                  <p className="adm-oldest adm-oldest-clear">
                    Nothing is waiting. Every inquiry has been picked up.
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        {/* ---- what has just come in ---- */}
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>Latest inquiries</h2>
            <Link className="adm-quiet" to="/admin/inquiries">
              View all
            </Link>
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
      </main>
    </div>
  );
}

/** "up" | "down" | "flat" — drives the colour, so the CSS holds no logic. */
const dir = (delta: number | null) =>
  delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down";

/** One count. `null` means still reading — deliberately not zero. */
function Stat({
  label,
  value,
  note,
  to,
  trend,
}: {
  label: string;
  value: number | null;
  note: string;
  to: string;
  /** Optional: tints the note and adds an arrow when there is a direction. */
  trend?: number | null;
}) {
  return (
    <Link className="adm-stat" to={to}>
      <span className="adm-stat-label">{label}</span>
      <strong>{value === null ? "—" : group(value)}</strong>
      <span
        className="adm-stat-note"
        data-dir={trend === undefined ? undefined : dir(trend)}
      >
        {/* An arrow as well as the colour: red and green alone carry no
            meaning for a reader who cannot tell them apart. */}
        {trend !== undefined && trend !== null && trend !== 0 ? (
          <span aria-hidden="true">{trend > 0 ? "▲" : "▼"} </span>
        ) : null}
        {note}
      </span>
    </Link>
  );
}
