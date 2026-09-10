import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import { mediaSrc } from "../../api/media";
import Loader from "../../components/shared/Loader";
import { Arrow } from "../../components/shared/destinationBits";
import { renderArticle, readingTime } from "../../lib/richText";
import type { Paginated, Post, PostSummary } from "../../types/api";
import HelpVideo from "../../components/shared/HelpVideo";

/**
 * A single article — /blog/:slug.
 *
 * The body is drawn by lib/richText.tsx, which understands a small subset of
 * Markdown and never sets HTML. See that file for why.
 *
 * WHAT AN ARTICLE PAGE OWES A READER, in the order it is provided here:
 * whether this is worth their time (the reading estimate, before the first
 * paragraph); a measure they can actually read (the column is capped in
 * `ch`, not in pixels, so it holds ~68 characters at every size); a way to
 * pass it on
 * (share, including a copy-link that confirms it worked); and somewhere to
 * go at the end (related posts, chosen by shared tag).
 *
 * RELATED POSTS ARE A SECOND, CHEAP REQUEST. The API has always taken a
 * `tag` filter, so the first tag on this post fetches four more and the
 * article itself is dropped from them. No tags, no request, and the section
 * simply does not render — which is also what happens when nothing else
 * shares them.
 */

const ShareIcon = {
  link: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1 1" />
      <path d="M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1-1" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.7c0-.9.26-1.55 1.6-1.55h1.7V4.3c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.2h2.7V22h3.4z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M6.4 8.6H3.2V21h3.2V8.6zM4.8 3a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM13 8.6H9.9V21H13v-6.5c0-1.8.8-2.9 2.3-2.9 1.4 0 2 1 2 2.9V21h3.2v-7.2c0-3.2-1.7-5.4-4.5-5.4-1.6 0-2.6.7-3 1.6V8.6z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.6 14.1c-.24.66-1.4 1.27-1.93 1.31-.5.05-.98.23-3.3-.69-2.78-1.1-4.55-3.94-4.69-4.13-.14-.19-1.12-1.49-1.12-2.84 0-1.35.7-2.01.95-2.29a1 1 0 01.72-.33h.52c.16 0 .39-.06.6.46l.83 2c.07.14.11.3.02.48l-.31.5c-.1.14-.21.3-.09.51.12.21.54.9 1.16 1.45.8.71 1.47.93 1.68 1.04.21.1.33.09.46-.05l.66-.77c.16-.21.31-.16.52-.09l1.9.9c.21.1.35.14.4.22.05.09.05.5-.19 1.16z" />
    </svg>
  ),
};

function Share({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : window.location.href;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard access is refused in some browsers and over plain http.
         The other three buttons still work, so nothing is announced. */
    }
  };

  const enc = encodeURIComponent;

  return (
    <div className="art-share">
      <span className="art-share-label">Share</span>
      <button type="button" onClick={copy} aria-label="Copy link to this article">
        {ShareIcon.link}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
      >
        {ShareIcon.facebook}
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"
      >
        {ShareIcon.linkedin}
      </a>
      <a
        href={`https://wa.me/?text=${enc(`${title} ${url}`)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
      >
        {ShareIcon.whatsapp}
      </a>
      {/* Announced politely rather than shown as a tooltip — a copy that
          silently succeeded is indistinguishable from one that failed. */}
      <span className="art-share-done" role="status" data-on={copied || undefined}>
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<PostSummary[]>([]);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setPost(null);
    setRelated([]);
    setError("");

    api
      .get<{ post: Post }>(`/posts/slug/${slug}`)
      .then((res) => {
        if (cancelled) return;
        setPost(res.data.post);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Post not found."));
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const previous = document.title;
    document.title = `${post.title} | Lakehead Education`;
    return () => {
      document.title = previous;
    };
  }, [post]);

  /* Related posts, once we know the tags. Quiet, because an article that
     loaded fine should not raise an error banner over a sidebar. */
  useEffect(() => {
    const tag = post?.tags?.[0];
    if (!tag || !post) return;
    let cancelled = false;

    api
      .get<Paginated<PostSummary>>("/posts", {
        params: { tag, limit: 4 },
        quiet: true,
      })
      .then((res) => {
        if (cancelled) return;
        setRelated(res.data.items.filter((p) => p.slug !== post.slug).slice(0, 3));
      })
      .catch(() => {
        /* No related strip. The article is unaffected. */
      });

    return () => {
      cancelled = true;
    };
  }, [post]);

  const rendered = useMemo(
    () => (post ? renderArticle(post.content) : null),
    [post]
  );

  if (error) {
    return (
      <div className="container section art-missing">
        <h1>We couldn&rsquo;t find that article</h1>
        <p>{error}</p>
        <Link className="art-back" to="/blog">
          <Arrow /> All articles
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="loader-block">
        <Loader />
      </div>
    );
  }

  const cover = post.coverImage ? mediaSrc(post.coverImage) : undefined;
  const minutes = readingTime(post.content);

  return (
    <article className="dpage dpage-ruled art">
      <header className={`art-head${cover ? " has-cover" : ""}`}>
        {cover ? (
          <div className="art-cover">
            <img src={cover} alt="" />
          </div>
        ) : null}
        <div className="container art-head-inner">
          <Link className="art-crumb" to="/blog">
            All articles
          </Link>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="art-standfirst">{post.excerpt}</p> : null}
          <p className="art-meta">
            {post.author?.name ? <span>{post.author.name}</span> : null}
            {post.publishedAt ? (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            ) : null}
            <span>{minutes} min read</span>
          </p>
        </div>
      </header>

      <div className="container art-body">
        <div className="art-prose">{rendered}</div>

        {post.tags?.length ? (
          <ul className="art-tags">
            {post.tags.map((t) => (
              <li key={t}>
                <Link to={`/blog?tag=${encodeURIComponent(t)}`}>{t}</Link>
              </li>
            ))}
          </ul>
        ) : null}

        <Share title={post.title} />
      </div>

      {related.length > 0 ? (
        <section className="art-related">
          <div className="container">
            <h2 className="art-related-title">Keep reading</h2>
            <div className="art-related-grid">
              {related.map((r) => (
                <Link className="art-related-card" to={`/blog/${r.slug}`} key={r._id}>
                  {r.coverImage ? (
                    <img src={mediaSrc(r.coverImage)} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="art-related-noshot" aria-hidden="true">
                      {r.title.charAt(0)}
                    </span>
                  )}
                  <h3>{r.title}</h3>
                  {r.excerpt ? <p>{r.excerpt}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Question this didn&rsquo;t answer?</h2>
            <p>Ask a counsellor directly. The first consultation is free.</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />
    </article>
  );
}
