import { useRef, useState } from "react";
import { WRITTEN } from "../data/testimonials";

/**
 * Student testimonials on the home page — one story is shown at a time, with
 * the neighbouring students' photos faded out on either side.
 *
 * The stories themselves live in data/testimonials.ts, which the reviews
 * page (/testimonials) also reads. Adding one there puts it in both places;
 * keeping a second copy here is how the two quietly drift apart.
 */
const TESTIMONIALS = WRITTEN;

/** How many faded photos sit either side of the student being read. */
const SIDE_COUNT = 2;

/** Distance (px) a swipe must cover before it counts as prev/next. */
const SWIPE_THRESHOLD = 45;

/**
 * Where one student's photo sits relative to the story being read. Every
 * photo stays mounted at all times and only its slot changes, so the whole
 * row glides between stories instead of snapping to a new set of circles.
 *
 * `depth` is how far out from the middle the photo sits (0 = active) and
 * `dir` which side it is on. Photos past the visible ring are marked
 * `hidden`: they wait just off the row at zero opacity and fade in as they
 * come round, so nothing ever appears or disappears on the spot.
 */
function slotFor(index: number, active: number, total: number) {
  const ring = Math.min(SIDE_COUNT, Math.floor((total - 1) / 2));
  const half = Math.floor(total / 2);

  /* Shortest way round the loop, so a photo always drifts toward the
     nearer edge rather than travelling the length of the row. */
  let offset = index - active;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  const distance = Math.abs(offset);
  return {
    depth: Math.min(distance, ring),
    dir: offset === 0 ? "c" : offset < 0 ? "l" : "r",
    hidden: distance > ring,
  };
}

function Arrow({ dir }: { dir: -1 | 1 }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d={dir === -1 ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const total = TESTIMONIALS.length;
  const step = (dir: -1 | 1) => setActive((i) => (i + dir + total) % total);
  const current = TESTIMONIALS[active];

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1);
  };

  if (total === 0) return null;

  return (
    <section className="testimonials section">
      {/* Watermark: a dashed flight path looping its way off to the left,
          behind the content. The viewBox is cropped to the path's own bounds
          so the artwork fills the box the CSS gives it. */}
      <svg
        className="testimonials-decor"
        viewBox="0 84 300 92"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Solid through the loops, easing off at either tail */}
          <linearGradient id="testimonials-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="0.15" stopColor="currentColor" stopOpacity="1" />
            <stop offset="0.87" stopColor="currentColor" stopOpacity="1" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M296 170c-28-2-46-6-60-16-22-14-34-44-18-60 14-14 38-4 34 22-4 24-36 38-62 42-24 4-44 2-64-8-20-10-26-34-13-45 11-9 27 0 23 18-4 16-26 25-48 27-30 3-60-2-84-12"
          stroke="url(#testimonials-trail)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="7 9"
        />
      </svg>
      <div className="container">
        <div className="testimonials-head">
          <h2 className="testimonials-title">
            What Our <span className="h-teal">Students</span> Say
          </h2>
        </div>

        <div
          className="testimonial-stage"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="testimonial-arrow testimonial-arrow-prev"
            onClick={() => step(-1)}
            aria-label="Previous student"
          >
            <Arrow dir={-1} />
          </button>

          <div className="testimonial-faces">
            {TESTIMONIALS.map((t, index) => {
              const { depth, dir, hidden } = slotFor(index, active, total);
              const isActive = index === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  className="testimonial-face"
                  data-depth={depth}
                  data-dir={dir}
                  data-hidden={hidden || undefined}
                  onClick={() => setActive(index)}
                  aria-label={`Read the story from ${t.name}`}
                  aria-current={isActive || undefined}
                  aria-hidden={hidden || undefined}
                  tabIndex={isActive || hidden ? -1 : 0}
                >
                  {t.image ? (
                    <img src={t.image} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="testimonial-initial" aria-hidden="true">
                      {t.name.charAt(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="testimonial-arrow testimonial-arrow-next"
            onClick={() => step(1)}
            aria-label="Next student"
          >
            <Arrow dir={1} />
          </button>
        </div>

        {/* The wrapper stays put so screen readers announce each new story;
            the figure inside is remounted so the copy fades in with the photo */}
        <div aria-live="polite">
          <figure className="testimonial-story" key={active}>
            <figcaption className="testimonial-who">
              <strong>{current.name}</strong>
              <span>{current.country}</span>
            </figcaption>
            <blockquote>{current.quote}</blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
}
