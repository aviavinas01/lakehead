import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { mediaSrc } from "../api/media";
import { Arrow } from "./destinationBits";
import type { Paginated, PostSummary } from "../types/api";

/**
 * The latest articles, as a row of cards above the footer on the home page.
 *
 * A HORIZONTAL ROW, NOT A GRID. The point of this band is "there is writing
 * here, and it is recent" — it is a trailer for /blog, not a replacement for
 * it. A grid that reflowed into three rows would be a second blog page
 * bolted onto the bottom of the home page; a single row that scrolls
 * sideways on a narrow screen stays a strip whatever the width.
 *
 * IT RENDERS NOTHING UNTIL THERE IS SOMETHING TO SHOW. Not a heading over an
 * empty rail, not a "coming soon" — the whole section, heading included, is
 * absent until a post exists. A site should not advertise the parts of
 * itself that have not been written yet.
 *
 * The request is `quiet`, so it never raises the global loading veil: this
 * is one band at the foot of a page that is already readable, and a failure
 * here should cost the band, not the page.
 *
 * WHY IT IS ONLY ON THE HOME PAGE. It was tempting to put this in Layout and
 * have it everywhere. That would put it on /blog directly above the full
 * list of the same posts, which reads as a bug, and on the director's
 * message and the contact page, where it is an interruption rather than an
 * offer. One deliberate placement is worth more than eight incidental ones.
 */

/** Five is the most that fits the rail at full width without crowding. */
const HOW_MANY = 5;

export default function BlogStrip() {
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Paginated<PostSummary>>("/posts", {
        params: { limit: HOW_MANY },
        quiet: true,
      })
      .then((res) => {
        if (!cancelled) setPosts(res.data.items);
      })
      .catch(() => {
        /* No band. The rest of the page is unaffected. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="bstrip" aria-labelledby="bstrip-h">
      <div className="container">
        <div className="bstrip-head">
          <div>
            <p className="dpage-eyebrow-sm">Blog &amp; articles</p>
            <h2 id="bstrip-h">
              Latest from <span className="h-accent">our counsellors</span>
            </h2>
          </div>
          <Link className="bstrip-all" to="/blog">
            All articles <Arrow />
          </Link>
        </div>

        <ul className="bstrip-rail">
          {posts.map((p) => (
            <li key={p._id}>
              <article className="bstrip-card">
                <div className="bstrip-shot">
                  {p.coverImage ? (
                    <img
                      src={mediaSrc(p.coverImage)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    /* The same fallback as every other card on the site with
                       no picture: an initial set large on a tint, so the rail
                       stays even instead of dropping a grey rectangle in. */
                    <span className="bstrip-noshot" aria-hidden="true">
                      {p.title.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="bstrip-body">
                  {p.publishedAt ? (
                    <time className="bstrip-date" dateTime={p.publishedAt}>
                      {new Date(p.publishedAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  ) : null}
                  <h3>{p.title}</h3>
                  {p.excerpt ? <p>{p.excerpt}</p> : null}
                  {/* The whole card is not the link. A "Read more" that is
                      the only clickable thing gives the row one obvious
                      target per card and keeps the title selectable, which a
                      card-wide anchor takes away. */}
                  <Link className="bstrip-more" to={`/blog/${p.slug}`}>
                    Read more <Arrow />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
