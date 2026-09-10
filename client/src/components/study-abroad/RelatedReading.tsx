import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { mediaSrc } from "../../api/media";
import { Arrow } from "../shared/destinationBits";
import type { Paginated, PostPage, PostSummary } from "../../types/api";

/**
 * The articles rail that sits under the contents list on a destination
 * guide — see components/study-abroad/GuidePage.tsx and pages/study-abroad/StudyInUSA.tsx.
 *
 * WHICH ARTICLES: the ones an editor placed on this page, by ticking it in
 * the "Appears on" panel of the post editor. That is a stored field on the
 * post (`pages`) and not a guess made from the title or the tags, because a
 * piece about American visa interviews should appear on the USA guide and
 * the visa page and nowhere else, and no amount of keyword matching decides
 * that as well as the person who wrote it.
 *
 * WHEN THERE ARE NONE: the three newest published articles, under a heading
 * that says so. A guide with nothing placed on it yet is the normal state of
 * a new destination, and an empty box that says "no articles" is worse than
 * useless — it is a hole in the page advertising that the site is thin. The
 * heading changes honestly rather than passing general articles off as
 * related ones, and the footer link drops the filter to match.
 *
 * WHEN THERE ARE NONE OF EITHER — a site with no published posts at all —
 * this renders nothing. So does the moment before the request lands: a
 * sidebar that reserves space for a block that may never fill would push the
 * contents rail around as the page settles.
 *
 * BOTH REQUESTS ARE `quiet`. This is furniture beside an article, not the
 * article; it must never raise the global loading veil, and a failure here
 * is a missing sidebar block rather than an error a reader can do anything
 * about.
 */

const HOW_MANY = 3;

/* Asked for one more than we show. The extra is the room to drop the
   article a reader may already be on without ending up with two cards. */
const FETCH = HOW_MANY + 1;

interface Props {
  /** The page asking. Its key is also its route — see POST_PAGES. */
  page: PostPage;
  /** A slug to leave out, for when this is used beside an article. */
  exclude?: string;
}

function Card({ post }: { post: PostSummary }) {
  const cover = post.coverImage ? mediaSrc(post.coverImage) : undefined;

  return (
    <li>
      <Link className="rr-card" to={`/blog/${post.slug}`}>
        <span className="rr-shot">
          {cover ? (
            <img src={cover} alt="" loading="lazy" decoding="async" />
          ) : (
            /* Same treatment as the cards on /blog: an initial set large on
               a tinted panel, so a post with no cover still reads as a
               deliberate card rather than a broken one. */
            <span className="rr-noshot" aria-hidden="true">
              {post.title.charAt(0)}
            </span>
          )}
        </span>
        <span className="rr-copy">
          <span className="rr-title">{post.title}</span>
          {post.excerpt ? <span className="rr-excerpt">{post.excerpt}</span> : null}
        </span>
      </Link>
    </li>
  );
}

export default function RelatedReading({ page, exclude }: Props) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  /* Whether what we are showing was actually placed on this page, or is the
     newest-articles fallback. It changes the heading and the footer link,
     and it is the one thing about this block a reader can be misled by. */
  const [placed, setPlaced] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPosts([]);
    setPlaced(true);

    const trim = (items: PostSummary[]) =>
      items.filter((p) => p.slug !== exclude).slice(0, HOW_MANY);

    api
      .get<Paginated<PostSummary>>("/posts", {
        params: { on: page, limit: FETCH },
        quiet: true,
      })
      .then((res) => {
        if (cancelled) return null;
        const matched = trim(res.data.items);
        if (matched.length > 0) {
          setPosts(matched);
          return null;
        }
        /* Nothing placed here yet — fall back to the newest articles. */
        return api.get<Paginated<PostSummary>>("/posts", {
          params: { limit: FETCH },
          quiet: true,
        });
      })
      .then((res) => {
        if (cancelled || !res) return;
        setPlaced(false);
        setPosts(trim(res.data.items));
      })
      .catch(() => {
        /* No block. The guide is unaffected. */
      });

    return () => {
      cancelled = true;
    };
  }, [page, exclude]);

  if (posts.length === 0) return null;

  return (
    <section className="rr" aria-labelledby={`rr-h-${page}`}>
      <h2 className="rr-tag" id={`rr-h-${page}`}>
        {placed ? "Blog & news" : "From the blog"}
      </h2>
      <ul className="rr-list">
        {posts.map((p) => (
          <Card post={p} key={p._id} />
        ))}
      </ul>
      <Link className="rr-all" to={placed ? `/blog?on=${page}` : "/blog"}>
        {placed ? "All articles on this" : "All articles"} <Arrow />
      </Link>
    </section>
  );
}
