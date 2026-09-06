import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Arrow, Shot } from "../components/destinationBits";
import { StarRow, GoogleG, SourceBadge } from "../components/reviewBits";
import { useReviewWall, type WallItem } from "../hooks/useReviewWall";
import { DESTINATIONS, type ReviewSource } from "../data/testimonials";
import { GOOGLE_MAPS_URL } from "../api/googleRating";
import HelpVideo from "../components/HelpVideo";

/**
 * Testimonials & Reviews — /testimonials.
 *
 * THE PROBLEM THIS PAGE SOLVES. What students say about us arrives in four
 * incompatible formats: Google reviews (a score, a relative date, a
 * photograph we may not host), YouTube testimonials (a video, a title, no
 * text), written notes sent to the office, and posts on social media. The
 * site used to scatter these — a carousel on the home page, a band above the
 * footer, a video shelf on Study Abroad — and there was nowhere to send
 * someone who simply wanted to read what people think.
 *
 * THE ANSWER IS ONE WALL, NOT FOUR SECTIONS. Four stacked sections make a
 * reader work out for themselves that it is all the same evidence. A single
 * faceted wall, where every card wears its source as a badge, reads as one
 * body of opinion you can slice — by source, or by destination — which is
 * the question people actually arrive with ("has anyone here been to
 * Canada?").
 *
 * WHAT IS LIVE AND WHAT IS NOT. Google and YouTube are fetched; written and
 * social entries are curated in data/testimonials.ts. Both network sources
 * fail soft to nothing, so the wall always has cards and the page is safe to
 * ship before the Places key and the testimonials playlist exist. The
 * summary panel only claims a Google score when Google actually answered —
 * `live` on the rating says whether it did.
 *
 * PHOTOGRAPHY. /testimonials/hero.jpg is referenced before it exists; `Shot`
 * degrades it to the navy field the destination pages use.
 */

/** Longer than this and the card shows an excerpt with a way to open it. */
const EXCERPT_LIMIT = 260;

const SOURCE_LABELS: Record<ReviewSource, string> = {
  google: "Google",
  video: "Video",
  written: "Written",
  social: "Social",
};

const SOURCE_ORDER: ReviewSource[] = ["google", "video", "written", "social"];

function Avatar({ item }: { item: WallItem }) {
  if (item.avatar) {
    return (
      <img
        className="rev-avatar"
        src={item.avatar}
        alt=""
        loading="lazy"
        decoding="async"
        /* Google serves reviewer photos from lh3.googleusercontent.com and
           refuses them when a referrer is sent. */
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span className="rev-avatar rev-avatar-initial" aria-hidden="true">
      {item.author.charAt(0)}
    </span>
  );
}

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

/**
 * One card on the wall. A video card, or a review long enough to be
 * truncated, becomes a button that opens the reader; everything else is
 * static, because a card with nothing more to show should not look clickable.
 */
function ReviewCard({ item, onOpen }: { item: WallItem; onOpen: () => void }) {
  const isVideo = item.source === "video";
  const truncated = !isVideo && item.text.length > EXCERPT_LIMIT;
  const openable = isVideo || truncated;

  const body = (
    <>
      <div className="rev-card-top">
        <Avatar item={item} />
        <div className="rev-who">
          <strong>{item.author}</strong>
          <span>
            {item.handle ? `@${item.handle}` : null}
            {item.handle && item.when ? " · " : null}
            {item.when}
          </span>
        </div>
        <SourceBadge source={item.source} platform={item.platform} />
      </div>

      {isVideo ? (
        <div className="rev-video">
          {/* Never the iframe until it is asked for: a YouTube player is
              about a megabyte of their code, and a wall of them would undo
              everything else on this page. */}
          <img
            className="rev-video-thumb"
            src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="rev-video-play" aria-hidden="true">
            <PlayIcon />
          </span>
          <span className="rev-video-title">{item.videoTitle}</span>
        </div>
      ) : (
        <>
          {item.rating ? <StarRow score={item.rating} /> : null}
          <p className="rev-text">
            {truncated ? `${item.text.slice(0, EXCERPT_LIMIT).trimEnd()}…` : item.text}
          </p>
        </>
      )}

      {/* A short review with no destination has nothing to put down here, so
          the row is left out rather than adding an empty band of padding. */}
      {item.destination || openable ? (
        <div className="rev-card-foot">
          {item.destination ? (
            <span className="rev-tag">{item.destination}</span>
          ) : (
            <span />
          )}
          {openable ? (
            <span className="rev-more">
              {isVideo ? "Watch" : "Read in full"} <Arrow />
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (!openable) {
    return <article className="rev-card">{body}</article>;
  }

  return (
    <article className="rev-card rev-card-open">
      <button
        type="button"
        className="rev-card-btn"
        onClick={onOpen}
        aria-label={
          isVideo
            ? `Play the video testimonial from ${item.author}`
            : `Read the full review from ${item.author}`
        }
      >
        {body}
      </button>
    </article>
  );
}

/** The reader: a full review, or the video, over a dimmed page. */
function Reader({ item, onClose }: { item: WallItem; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    /* The page behind must not scroll while this is open, or a phone drags
       the wall around under the dialog. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="rev-reader"
      role="dialog"
      aria-modal="true"
      aria-label={`Testimonial from ${item.author}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rev-reader-panel">
        <button
          type="button"
          className="rev-reader-close"
          onClick={onClose}
          ref={closeBtn}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {item.source === "video" ? (
          <div className="rev-reader-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={item.videoTitle ?? `Testimonial from ${item.author}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null}

        <div className="rev-reader-body">
          <div className="rev-card-top">
            <Avatar item={item} />
            <div className="rev-who">
              <strong>{item.author}</strong>
              <span>{item.when}</span>
            </div>
            <SourceBadge source={item.source} platform={item.platform} />
          </div>
          {item.rating ? <StarRow score={item.rating} size={18} /> : null}
          {item.source === "video" ? (
            <p className="rev-text">{item.videoTitle}</p>
          ) : (
            <blockquote className="rev-reader-quote">{item.text}</blockquote>
          )}
          {item.href ? (
            <a
              className="rev-reader-link"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              See the original <Arrow />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { items, google, counts } = useReviewWall();
  const [source, setSource] = useState<ReviewSource | "all">("all");
  const [destination, setDestination] = useState<string>("all");
  const [reading, setReading] = useState<WallItem | null>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Testimonials & Reviews | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  const shown = useMemo(
    () =>
      items.filter(
        (i) =>
          (source === "all" || i.source === source) &&
          (destination === "all" || i.destination === destination)
      ),
    [items, source, destination]
  );

  /* A destination filter only narrows the curated sources — Google and
     YouTube do not tell us where anybody went. Saying so on the chip row is
     better than letting someone pick "Canada" and wonder where the videos
     went. */
  const destinationNarrows = destination !== "all";

  /* The spotlight is the longest written testimonial: it is the one with
     enough in it to be worth setting at display size. */
  const spotlight = useMemo(
    () =>
      items
        .filter((i) => i.source === "written")
        .sort((a, b) => b.text.length - a.text.length)[0],
    [items]
  );

  const googleUrl = google?.url ?? GOOGLE_MAPS_URL;

  return (
    <article className="dpage rev">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/testimonials/hero.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <span className="svc-crumb">Testimonials &amp; Reviews</span>
            </p>
            <h1 className="rev-title">
              <span className="rev-thin">Not our word for it.</span>
              <span className="rev-fat">Theirs.</span>
            </h1>
            <p className="dpage-lead">
              Everything students have said about us, in one place and
              unedited — reviews left on Google, videos they recorded
              themselves, notes sent to the office, and what they posted the
              day the offer letter arrived.
            </p>
            <div className="dpage-hero-actions">
              <a className="btn btn-outline" href="#wall">Read the wall →</a>
              <a
                className="dpage-jump"
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Leave a review on Google <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ---- the summary strip ---- */}
      <section className="rev-summary-band">
        <div className="container rev-summary">
          {/* Only claimed when Google actually answered; `live` is false when
              the server fell back to its static score. */}
          {google?.live ? (
            <a
              className="rev-score"
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="rev-score-mark"><GoogleG size={22} /></span>
              <strong>{google.rating.toFixed(1)}</strong>
              <span className="rev-score-meta">
                <StarRow score={google.rating} />
                <span>
                  {google.total > 0
                    ? `${google.total.toLocaleString()} reviews on Google`
                    : "Rated on Google"}
                </span>
              </span>
            </a>
          ) : (
            <div className="rev-score rev-score-quiet">
              <span className="rev-score-mark"><GoogleG size={22} /></span>
              <span className="rev-score-meta">
                <strong>Rated on Google</strong>
                <span>Open our listing to read and leave reviews</span>
              </span>
            </div>
          )}

          <dl className="rev-tallies">
            {SOURCE_ORDER.filter((s) => counts[s] > 0).map((s) => (
              <div key={s}>
                <dt>{counts[s]}</dt>
                <dd>{SOURCE_LABELS[s]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- the spotlight ---- */}
      {spotlight ? (
        <section className="rev-spotlight">
          <div className="container">
            <figure>
              <blockquote>{spotlight.text}</blockquote>
              <figcaption>
                <Avatar item={spotlight} />
                <span>
                  <strong>{spotlight.author}</strong>
                  {spotlight.destination ? <span>{spotlight.destination}</span> : null}
                </span>
              </figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      {/* ---- the wall ---- */}
      <section className="dpage-section rev-wall-section" id="wall">
        <div className="container">
          <h2 className="dpage-title rev-h2">
            Everything, <span className="h-accent">in one place</span>
          </h2>
          <p className="dpage-section-lead">
            Filter by where it was said, or by where the student ended up.
            Nothing here has been rewritten — the Google reviews and the
            videos come straight from the source.
          </p>

          <div className="rev-filters">
            <div className="rev-chiprow" role="group" aria-label="Filter by source">
              <button
                type="button"
                className={`rev-chip${source === "all" ? " is-on" : ""}`}
                onClick={() => setSource("all")}
                aria-pressed={source === "all"}
              >
                All <span>{items.length}</span>
              </button>
              {SOURCE_ORDER.filter((s) => counts[s] > 0).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rev-chip${source === s ? " is-on" : ""}`}
                  onClick={() => setSource(s)}
                  aria-pressed={source === s}
                >
                  {SOURCE_LABELS[s]} <span>{counts[s]}</span>
                </button>
              ))}
            </div>

            <div className="rev-chiprow rev-chiprow-sm" role="group" aria-label="Filter by destination">
              <button
                type="button"
                className={`rev-chip rev-chip-sm${destination === "all" ? " is-on" : ""}`}
                onClick={() => setDestination("all")}
                aria-pressed={destination === "all"}
              >
                Everywhere
              </button>
              {DESTINATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`rev-chip rev-chip-sm${destination === d ? " is-on" : ""}`}
                  onClick={() => setDestination(d)}
                  aria-pressed={destination === d}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {destinationNarrows ? (
            <p className="rev-filter-note">
              Google reviews and video testimonials are not tagged with a
              destination, so they sit outside this filter.
            </p>
          ) : null}

          {/* Announced rather than silently swapped, since the chips change
              what is underneath them without moving focus. */}
          <p className="rev-count" aria-live="polite">
            {shown.length === 0
              ? "Nothing matches that combination yet."
              : `Showing ${shown.length} of ${items.length}`}
          </p>

          <div className="rev-wall">
            {shown.map((item) => (
              <ReviewCard key={item.id} item={item} onOpen={() => setReading(item)} />
            ))}
          </div>

          {shown.length === 0 ? (
            <button
              type="button"
              className="rev-reset"
              onClick={() => {
                setSource("all");
                setDestination("all");
              }}
            >
              Clear the filters <Arrow />
            </button>
          ) : null}
        </div>
      </section>

      {/* ---- add yours ---- */}
      <section className="dpage-section dpage-tint rev-add">
        <div className="container rev-add-inner">
          <div>
            <h2 className="dpage-title rev-h2">
              Been through it with us? <span className="h-outline">Say so.</span>
            </h2>
            <p className="dpage-section-lead">
              A review from someone who has actually sat in the chair is worth
              more to the next student than anything we could write about
              ourselves. It takes two minutes.
            </p>
          </div>
          <div className="rev-add-actions">
            <a
              className="rev-add-btn rev-add-google"
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoogleG size={20} />
              Write a Google review
            </a>
            <Link className="rev-add-btn" to="/contact">
              Send us your story <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Want to be on this page?</h2>
            <p>It starts with an hour, a transcript, and an honest conversation.</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />

      {reading ? <Reader item={reading} onClose={() => setReading(null)} /> : null}
    </article>
  );
}
