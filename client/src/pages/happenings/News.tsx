import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "../../components/shared/destinationBits";
import { NewsListSkeleton } from "../../components/shared/Skeletons";
import { fetchNews, type NewsItem } from "../../api/happenings";
import { mediaSrc } from "../../api/media";
import { formatDay, hostOf } from "../../lib/datetime";
import CallbackStrip from "../../components/shared/CallbackStrip";

/**
 * News — /news.
 *
 * EVERY CARD LEAVES THE SITE, and the page is honest about it. These are
 * articles other people wrote — a visa rule change, an intake announcement,
 * a partner university in the papers — chosen because they matter to
 * somebody applying from Nepal. What is shown is a headline, a line of ours
 * saying why it matters, and where it came from; the article itself stays
 * where it was published.
 *
 * Like /events, this is built around having nothing on it. The office adds
 * links in bursts, and an empty run of weeks is ordinary rather than a
 * fault — so the empty state is a finished design and points at the two
 * places that are never empty.
 */

export default function News() {
  /* null while loading — distinct from an empty array, which is a real
     answer this page has a design for. */
  const [items, setItems] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "News | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    let off = false;
    /* A failed fetch reads as "nothing here yet" rather than as an error:
       the empty state is useful and an apology is not. */
    fetchNews()
      .then((list) => !off && setItems(list))
      .catch(() => !off && setItems([]));
    return () => {
      off = true;
    };
  }, []);

  const empty = (items?.length ?? 0) === 0;

  return (
    <article className="dpage dpage-ruled evt">
      <header className="evt-head">
        <div className="container">
          <p className="dpage-eyebrow-sm">News</p>
          <h1 className="evt-title">
            <span className="evt-thin">Worth</span>
            <span className="evt-fat">knowing about.</span>
          </h1>
          <p className="evt-lead">
            Rule changes, intake announcements and reporting that affects
            students applying from Nepal. Each one links to whoever published
            it — we add a line on what it means for you and nothing more.
          </p>
        </div>
      </header>

      <section className="news-section">
        <div className="container">
          {items === null ? (
            <NewsListSkeleton />
          ) : empty ? (
            <div className="news-empty">
              <h2>Nothing here at the moment</h2>
              <p>
                We add links when something changes that genuinely affects an
                application — not to keep a page busy. In the meantime the
                blog has our own writing, and a counsellor can tell you how a
                rule change affects your case specifically.
              </p>
              <div className="evt-empty-actions">
                <Link className="evt-btn" to="/blog">
                  Read the blog <Arrow />
                </Link>
                <Link className="evt-btn evt-btn-quiet" to="/contact">
                  Ask a counsellor <Arrow />
                </Link>
              </div>
            </div>
          ) : (
            <ul className="news-list">
              {items.map((n) => (
                <li className="news-card" key={n._id}>
                  {/* The whole card is the link. `noopener` is not optional
                      on a target="_blank" to a site we do not control. */}
                  <a href={n.url} target="_blank" rel="noopener noreferrer">
                    <span className="news-shot" aria-hidden="true">
                      {n.image ? (
                        <img src={mediaSrc(n.image)} alt="" loading="lazy" decoding="async" />
                      ) : null}
                    </span>
                    <span className="news-body">
                      <span className="news-meta">
                        {/* The source is stated even when it was left blank,
                            falling back to the hostname — a card that does
                            not say where it goes is a card you should not
                            click. */}
                        <span>{n.source || hostOf(n.url)}</span>
                        {n.publishedAt ? <span>{formatDay(n.publishedAt)}</span> : null}
                      </span>
                      <strong className="news-title">{n.title}</strong>
                      <span className="news-summary">{n.summary}</span>
                      <span className="news-go">
                        Read at {hostOf(n.url) || "the source"} <Arrow />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CallbackStrip service="other" />
    </article>
  );
}
