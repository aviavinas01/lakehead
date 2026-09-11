/**
 * The shape of the answer, drawn while the answer loads.
 *
 * ------------------------------------------------------------------
 * WHAT THESE REPLACED. Every surface here used to render nothing at all
 * until its fetch resolved, with the global spinner veil over the top. So a
 * reader got a dark overlay, then a blank, then the whole section arriving
 * at once and pushing everything below it down the page. The skeleton
 * removes all three: the page keeps its shape, the shape is the real one,
 * and nothing jumps when the data lands.
 *
 * THEY WEAR THE REAL CARD'S CLASSES. A skeleton blog card carries
 * `.blg-card` as well as `.blg-card-skel`, so its border, radius, padding
 * and grid placement come from the rules the real card uses — not from a
 * second set of numbers that has to be kept in step and silently will not
 * be. Only the contents are stand-ins. This is the whole reason the swap
 * does not reflow.
 *
 * THE COUNTS ARE DELIBERATE, not round numbers. Each matches what that
 * surface actually asks the API for, so the placeholder occupies roughly
 * the space the answer will. Where the real count is unknowable — a blog
 * page holds up to nine posts but may hold two — the skeleton shows less
 * rather than more: a section that shrinks when it loads looks like a
 * miscount, one that grows looks like it is still arriving.
 *
 * NONE OF IT IS READ ALOUD. The shapes are inert decoration and are marked
 * `aria-hidden`; each container is a single polite live region with one
 * short sentence, so a screen reader hears "Loading articles" once instead
 * of counting forty empty boxes. `aria-busy` says the same thing to
 * anything driving the page programmatically.
 *
 * NOTHING HERE DECIDES WHEN TO APPEAR. Each caller owns that, because each
 * caller knows the difference between "still loading" and "genuinely
 * empty" — a distinction several of them had to gain a `null` state to be
 * able to make. An empty answer must still render whatever that surface
 * already rendered for empty, which in most cases is nothing at all.
 * ------------------------------------------------------------------
 */

import type { ReactNode } from "react";

/** Repeats a shape n times with stable keys. */
const times = (n: number, make: (i: number) => ReactNode): ReactNode[] =>
  Array.from({ length: n }, (_, i) => make(i));

/**
 * The live-region attributes every skeleton container needs.
 *
 * Spread onto the caller's own container rather than supplied as a wrapper
 * component, on purpose: a wrapping <div> would become the grid item in
 * `.blg-grid` or `.stf-grid` and collapse every card into a single column.
 * The attributes have to land ON the grid, so this hands them over instead
 * of imposing a box.
 */
const busy = (label: string) => ({
  role: "status" as const,
  "aria-busy": true,
  "aria-label": label,
});

/* A single bar. Nothing here takes a size — the class says what it is and
   the stylesheet says how big, which is the same bargain the site's loading
   mark makes. See Loader.tsx. */
const Line = ({ className = "" }: { className?: string }) => (
  <span className={`skel skel-line ${className}`} />
);

/* ---------------------------------------------------------------- */
/* Blog list — pages/blog/Blog.tsx                                    */
/* ---------------------------------------------------------------- */

/** Six, not nine. See the note on counts above. */
const BLOG_CARDS = 6;

export function BlogLeadSkeleton() {
  return (
    <div className="blg-lead blg-lead-skel" aria-hidden="true">
      <div className="blg-lead-shot">
        <span className="skel skel-fill" />
      </div>
      <div className="blg-lead-body">
        <span className="skel skel-pill" />
        <span
          className="skel skel-head skel-head-wide"
          style={{ marginTop: "0.85rem" }}
        />
        <div style={{ marginTop: "0.85rem" }}>
          <Line />
          <Line className="skel-line-mid" />
          <Line className="skel-line-last" />
        </div>
        <span className="skel skel-pill" style={{ marginTop: "1.5rem" }} />
      </div>
    </div>
  );
}

export function BlogGridSkeleton() {
  return (
    <div className="blg-grid" {...busy("Loading articles")}>
      {times(BLOG_CARDS, (i) => (
        <div className="blg-card blg-card-skel" key={i} aria-hidden="true">
          <div className="blg-card-shot">
            <span className="skel skel-fill" />
          </div>
          <div className="blg-card-body">
            <span className="skel skel-head skel-head-wide" />
            <div style={{ marginTop: "0.7rem" }}>
              <Line />
              <Line className="skel-line-last" />
            </div>
            <div className="skel-meta">
              <span className="skel skel-pill" />
              <span className="skel skel-pill" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Events — pages/happenings/Events.tsx                               */
/* ---------------------------------------------------------------- */

const EVENT_CARDS = 3;

/**
 * The events headline and standfirst, as bars.
 *
 * THIS ONE EXISTS TO KILL A FLICKER THE PAGE ALREADY HAD. The events
 * headline reads either "Nothing on right now." or "Coming up at Lakehead."
 * and the standfirst changes with it, so the page cannot write its own
 * header until the fetch has answered. It used to assume "nothing on" and
 * flip if it was wrong — a deliberate trade, taken because empty is the
 * commoner answer, but still a flip.
 *
 * Now neither is asserted until one is known. That also removes the
 * contradiction a list skeleton would otherwise have created on its own: a
 * row of shimmering event cards sitting under the words "Nothing on right
 * now" reads as a page arguing with itself.
 *
 * The eyebrow is NOT a bar. "Events" is true in every branch, so replacing
 * it with a placeholder would be hiding a word the page already knows.
 *
 * IT IS DECORATION, NOT A SECOND LIVE REGION. The list skeleton below is
 * already announcing "Loading events" on the same page, and two regions
 * saying the same sentence means a screen reader says it twice for one
 * wait. Only one of the pair speaks, and it is the one over the content.
 */
export function EventHeadSkeleton() {
  return (
    <div aria-hidden="true">
      <div>
        <span
          className="skel skel-head"
          style={{ height: "2.25rem", width: "min(42%, 15ch)", display: "block" }}
        />
        <span
          className="skel skel-head"
          style={{
            height: "2.25rem",
            width: "min(64%, 22ch)",
            display: "block",
            marginTop: "0.5rem",
          }}
        />
      </div>
      <div style={{ maxWidth: "62ch", marginTop: "1.25rem" }}>
        <Line />
        <Line className="skel-line-mid" />
      </div>
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="evt-list" {...busy("Loading events")}>
      {times(EVENT_CARDS, (i) => (
        <div className="evt-card evt-card-skel" key={i} aria-hidden="true">
          <div className="evt-card-when">
            <span className="skel skel-line skel-line-mid" />
            <span className="skel skel-pill" />
          </div>
          <div className="evt-card-body">
            <span className="skel skel-head" />
            <div style={{ marginTop: "0.6rem" }}>
              <Line />
              <Line className="skel-line-last" />
            </div>
            <span className="skel skel-pill" style={{ marginTop: "1rem" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* News — pages/happenings/News.tsx                                   */
/* ---------------------------------------------------------------- */

const NEWS_CARDS = 3;

export function NewsListSkeleton() {
  return (
    <div className="news-list" {...busy("Loading news")}>
      {times(NEWS_CARDS, (i) => (
        <div className="news-card" key={i} aria-hidden="true">
          <div className="news-card-skel">
            <span className="news-shot">
              <span className="skel skel-fill" />
            </span>
            <span className="news-body">
              <span className="skel skel-pill" />
              <span
                className="skel skel-head skel-head-wide"
                style={{ marginTop: "0.45rem" }}
              />
              <span style={{ display: "block", marginTop: "0.45rem" }}>
                <Line />
                <Line className="skel-line-last" />
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Staff — components/about/StaffGrid.tsx                             */
/* ---------------------------------------------------------------- */

const STAFF_CARDS = 4;

export function StaffGridSkeleton() {
  return (
    <div className="stf-grid" {...busy("Loading the team")}>
      {times(STAFF_CARDS, (i) => (
        <div className="stf-card stf-card-skel" key={i} aria-hidden="true">
          <div className="stf-shot">
            <span className="skel skel-fill" />
          </div>
          <div className="stf-copy">
            <span className="skel skel-head skel-head-wide" />
            <span
              className="skel skel-line skel-line-short"
              style={{ marginTop: "0.55rem" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Home rail — components/home/BlogStrip.tsx                          */
/* ---------------------------------------------------------------- */

/** Matches HOW_MANY in BlogStrip exactly — this one IS knowable. */
const STRIP_CARDS = 5;

export function BlogStripSkeleton() {
  return (
    <div className="bstrip-rail" {...busy("Loading articles")}>
      {times(STRIP_CARDS, (i) => (
        <div key={i} aria-hidden="true">
          <div className="bstrip-card bstrip-card-skel">
            <div className="bstrip-shot">
              <span className="skel skel-fill" />
            </div>
            <div className="bstrip-body">
              <span className="skel skel-head skel-head-wide" />
              <span
                className="skel skel-line skel-line-short"
                style={{ marginTop: "0.6rem" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Related reading — components/study-abroad/RelatedReading.tsx       */
/* ---------------------------------------------------------------- */

/** Matches HOW_MANY in RelatedReading. */
const RELATED_CARDS = 3;

export function RelatedReadingSkeleton() {
  return (
    <div className="rr-list" {...busy("Loading related articles")}>
      {times(RELATED_CARDS, (i) => (
        <div className="rr-card rr-card-skel" key={i} aria-hidden="true">
          <span className="skel skel-head skel-head-wide" />
          <span className="skel skel-line skel-line-short" />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Google reviews — components/layout/GoogleReviews.tsx               */
/* ---------------------------------------------------------------- */

const REVIEW_CARDS = 3;

export function GoogleReviewsSkeleton() {
  return (
    <div className="greviews-grid" {...busy("Loading reviews")}>
      {times(REVIEW_CARDS, (i) => (
        <div className="greview greview-skel" key={i} aria-hidden="true">
          <div className="greview-head">
            <span className="skel skel-round greview-avatar" />
            <div style={{ flex: 1 }}>
              <span className="skel skel-line skel-line-short" />
              <span className="skel skel-pill" style={{ marginTop: "0.4rem" }} />
            </div>
          </div>
          <div>
            <Line />
            <Line />
            <Line className="skel-line-last" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* The director's message — pages/about/Director.tsx                  */
/* ---------------------------------------------------------------- */

export function DirectorSkeleton() {
  return (
    <div className="container section dir-skel" {...busy("Loading the message")}>
      <div aria-hidden="true">
        <span className="skel skel-pill" />
        <span
          className="skel skel-head skel-head-wide"
          style={{ height: "2rem", marginTop: "0.9rem", maxWidth: "28ch" }}
        />
      </div>
      <div className="skel dir-skel-shot" aria-hidden="true" />
      <div className="dir-skel-body" aria-hidden="true">
        <Line />
        <Line />
        <Line className="skel-line-mid" />
        <Line />
        <Line className="skel-line-last" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Gallery — pages/about/Gallery.tsx                                  */
/* ---------------------------------------------------------------- */

const GALLERY_TILES = 8;

export function GallerySkeleton() {
  return (
    <div className="container gal-skel-grid" {...busy("Loading photographs")}>
      {times(GALLERY_TILES, (i) => (
        <span className="skel gal-skel-tile" key={i} aria-hidden="true" />
      ))}
    </div>
  );
}
