import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { mediaSrc } from "../api/media";
import Loader from "../components/Loader";
import { Arrow } from "../components/destinationBits";
import { POST_PAGES, postPageLabel } from "../types/api";
import type { Paginated, PostPage, PostSummary } from "../types/api";

/**
 * Blog & Articles — /blog.
 *
 * Everything here comes from posts an editor wrote in the admin dashboard;
 * there is no hard-coded article. What changed is the shape: this used to be
 * a flat grid of nine identical cards, which gives a reader no way in and no
 * sense of which piece matters.
 *
 * SO THE FIRST POST IS TREATED AS THE LEAD. On page one, with no tag
 * filter, the newest post takes a wide card with its cover photograph and
 * standfirst, and the rest follow in the grid. On page two, or once a tag is
 * chosen, that stops — a "lead" article is only meaningful at the top of the
 * unfiltered list, and promoting an arbitrary post further in would be a
 * layout pretending to be an editorial decision.
 *
 * THE TAG FILTER LIVES IN THE URL. `?tag=visas` is passed to the API, which
 * has always supported it, and read back from the query string — so a
 * filtered list can be linked to, bookmarked and reached with the back
 * button, which a piece of component state cannot.
 *
 * Tags are collected from the posts on the page rather than from an endpoint
 * of their own. That means the chip row reflects what is actually here, and
 * it costs nothing.
 *
 * `?on=study-in-canada` IS THE SECOND FILTER, and it is placement rather
 * than subject — the list a destination guide's sidebar is showing three of.
 * It is where "All articles on this" from that sidebar lands, so the reader
 * gets the full list in the same order they saw the first three, with the
 * page it came from named at the top and one click back out of it.
 *
 * The two filters are deliberately not merged into one chip row. Tags are
 * whatever the writers invented; placement is a fixed list of pages, and a
 * row mixing "ielts" with "Study in Canada" would suggest they are the same
 * kind of thing and can be combined freely — which is a promise about
 * results this page cannot keep for every pair.
 */

const PER_PAGE = 9;

function PostCard({ post, lead = false }: { post: PostSummary; lead?: boolean }) {
  const cover = post.coverImage ? mediaSrc(post.coverImage) : undefined;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={lead ? "blg-lead" : "blg-card"}
    >
      <div className={lead ? "blg-lead-shot" : "blg-card-shot"}>
        {cover ? (
          <img src={cover} alt="" loading={lead ? "eager" : "lazy"} decoding="async" />
        ) : (
          /* A post with no cover gets its initial set large on a tinted
             panel rather than a grey box — the grid stays even and the card
             still reads as deliberate. */
          <span className="blg-noshot" aria-hidden="true">
            {post.title.charAt(0)}
          </span>
        )}
      </div>
      <div className={lead ? "blg-lead-body" : "blg-card-body"}>
        {lead ? <p className="blg-lead-kicker">Latest</p> : null}
        <h2>{post.title}</h2>
        {post.excerpt ? <p className="blg-excerpt">{post.excerpt}</p> : null}
        <p className="blg-meta">
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          ) : null}
          {post.tags?.length ? (
            <span className="blg-card-tags">
              {post.tags.slice(0, 2).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          ) : null}
        </p>
        {lead ? (
          <span className="blg-lead-more">
            Read the article <Arrow />
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Paginated<PostSummary> | null>(null);
  const [error, setError] = useState("");

  const tag = params.get("tag") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  /* Ignored unless it is a real page key. A stale or hand-edited `?on=`
     should read as "no filter" and show the blog, not an empty grid that
     looks like the site lost its articles. */
  const onRaw = params.get("on") ?? "";
  const on = (POST_PAGES.find((p) => p.key === onRaw)?.key ?? "") as PostPage | "";

  useEffect(() => {
    const previous = document.title;
    document.title = "Blog & Articles | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");

    const query = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
    if (tag) query.set("tag", tag);
    if (on) query.set("on", on);

    api
      .get<Paginated<PostSummary>>(`/posts?${query}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load posts."));
      });

    return () => {
      cancelled = true;
    };
  }, [page, tag, on]);

  /* Every tag on the posts we can see, alphabetically. */
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of data?.items ?? []) for (const t of p.tags ?? []) set.add(t);
    return [...set].sort();
  }, [data]);

  /* Changing the filter always returns to page one — staying on page four of
     a list that no longer has four pages is how you land on an empty grid. */
  const setTag = (next: string) => {
    const q = new URLSearchParams();
    /* The page filter survives a tag change — someone reading the Canada
       list who then picks "visas" wants Canadian visa articles, not every
       visa article on the site. Dropping to page one is the same rule as
       before: page four of a shorter list is an empty grid. */
    if (on) q.set("on", on);
    if (next) q.set("tag", next);
    setParams(q);
  };

  const goToPage = (next: number) => {
    const q = new URLSearchParams(params);
    q.set("page", String(next));
    setParams(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const items = data?.items ?? [];
  /* The lead card only makes sense at the top of the unfiltered list. */
  const showLead = page === 1 && !tag && !on && items.length > 0;
  const lead = showLead ? items[0] : undefined;
  const rest = showLead ? items.slice(1) : items;

  return (
    <article className="dpage dpage-ruled blg">
      <header className="blg-head">
        <div className="container">
          <p className="dpage-eyebrow-sm">Blog &amp; articles</p>
          <h1 className="blg-title">
            <span className="blg-thin">Everything we know,</span>
            <span className="blg-fat">written down.</span>
          </h1>
          <p className="blg-lead-copy">
            Visa rule changes, intake deadlines, what a statement of purpose
            actually needs to say, and the questions students ask us most.
            Written by the counsellors who answer them.
          </p>

          {/* Where the reader came from, and the way back out. Named rather
              than shown as another chip, because it is not one of the tag
              chips below and must not look like one it can be swapped for. */}
          {on ? (
            <p className="blg-on">
              <span>Articles on <strong>{postPageLabel(on)}</strong></span>
              <button type="button" onClick={() => setParams(new URLSearchParams())}>
                Show every article
              </button>
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="blg-tags" role="group" aria-label="Filter by tag">
              <button
                type="button"
                className={`blg-tag${tag === "" ? " is-on" : ""}`}
                onClick={() => setTag("")}
                aria-pressed={tag === ""}
              >
                Everything
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`blg-tag${tag === t ? " is-on" : ""}`}
                  onClick={() => setTag(t)}
                  aria-pressed={tag === t}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <section className="blg-body">
        <div className="container">
          {error ? (
            <p className="blg-empty">{error}</p>
          ) : !data ? (
            <div className="loader-block">
              <Loader />
            </div>
          ) : items.length === 0 ? (
            <div className="blg-empty-card">
              <h2>
                {tag
                  ? `Nothing tagged “${tag}” yet`
                  : on
                    ? `Nothing on ${postPageLabel(on)} yet`
                    : "No articles yet"}
              </h2>
              <p>
                {tag
                  ? "That tag has no published articles at the moment. Try another, or read everything."
                  : on
                    ? "We haven’t placed an article on that page yet. Everything else we have written is one click away."
                    : "The first pieces are being written. In the meantime, the destination guides cover most of what students ask us."}
              </p>
              {tag || on ? (
                <button
                  type="button"
                  className="blg-reset"
                  onClick={() => setParams(new URLSearchParams())}
                >
                  Read everything <Arrow />
                </button>
              ) : (
                <Link className="blg-reset" to="/study-abroad">
                  Read the destination guides <Arrow />
                </Link>
              )}
            </div>
          ) : (
            <>
              {lead ? <PostCard post={lead} lead /> : null}
              {rest.length > 0 ? (
                <div className="blg-grid">
                  {rest.map((p) => (
                    <PostCard post={p} key={p._id} />
                  ))}
                </div>
              ) : null}

              {data.totalPages > 1 ? (
                <nav className="blg-pager" aria-label="Pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </article>
  );
}
