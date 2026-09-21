import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Arrow, Shot } from "../shared/destinationBits";
import { DESTINATIONS, countByCountry } from "../../data/universities";

/**
 * The destination slideshow — full-bleed photographs, one per country, with
 * the country name set enormous over them and how many of our partners are
 * there.
 *
 * ------------------------------------------------------------------
 * MOVED, NOT REWRITTEN. This was the top of the University Partners page;
 * that page is gone and its two useful parts — this, and the partner list —
 * now sit on /study-abroad. The behaviour is exactly what it was.
 *
 * WHAT A SLIDESHOW HAS TO GET RIGHT. Auto-advance is the fastest way to
 * annoy someone reading, so it stops on hover, stops on focus, stops when the
 * section scrolls out of view, and never starts at all under
 * prefers-reduced-motion. Arrows, dots and the left/right keys all work, and
 * using any of them stops the timer for good — once you have taken hold of
 * it, it is yours.
 *
 * COUNTS ARE DERIVED, NEVER ASSERTED. "N partners here" comes from the
 * `country` field on each entry in data/universities.ts. A country with none
 * shows nothing rather than a confident zero.
 * ------------------------------------------------------------------
 */

/** How long a slide holds before the next one, in ms. */
const SLIDE_MS = 6000;

export default function PartnerSlideshow() {
  const [slide, setSlide] = useState(0);
  /* Set the moment anyone touches a control, and never cleared — the timer
     does not get to take the wheel back off someone who has used it. */
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const stage = useRef<HTMLElement>(null);

  const counts = useMemo(() => countByCountry(), []);
  const total = DESTINATIONS.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setTaken(true);
      setSlide((i) => (i + dir + total) % total);
    },
    [total]
  );

  /* Only run while the stage is actually on screen. A slideshow ticking away
     sections above where someone is reading is pure battery. */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (taken || paused || !onScreen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSlide((i) => (i + 1) % total), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [taken, paused, onScreen, total]);

  const current = DESTINATIONS[slide];
  if (!current) return null;

  return (
    <section
      className="unip-stage"
      ref={stage}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      }}
      aria-roledescription="carousel"
      aria-label="Where our partner institutions are"
    >
      {/* Every slide stays mounted and cross-fades. Swapping the src instead
          would show a blank frame each time a photograph that is not in cache
          is fetched. */}
      {DESTINATIONS.map((d, i) => (
        <div
          className="unip-slide"
          key={d.name}
          data-on={i === slide || undefined}
          aria-hidden={i !== slide}
        >
          <Shot src={d.image} alt="" />
        </div>
      ))}
      <div className="unip-stage-scrim" aria-hidden="true" />

      <div className="container unip-stage-inner">
        {/* Remounted per slide so the copy re-runs its entrance */}
        <div className="unip-slide-copy" key={current.name}>
          <p className="unip-slide-kicker">
            Destination {String(slide + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <h2 className="unip-slide-name">{current.display ?? current.name}</h2>
          <p className="unip-slide-blurb">{current.blurb}</p>
          <div className="unip-slide-actions">
            <Link className="unip-slide-btn" to={current.to}>
              Read the {current.name} guide <Arrow />
            </Link>
            {counts[current.name] ? (
              <span className="unip-slide-count">
                <strong>{counts[current.name]}</strong> partner
                {counts[current.name] === 1 ? "" : "s"} here
              </span>
            ) : null}
          </div>
        </div>

        <div className="unip-controls">
          <button type="button" onClick={() => go(-1)} aria-label="Previous destination">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <ol className="unip-dots">
            {DESTINATIONS.map((d, i) => (
              <li key={d.name}>
                <button
                  type="button"
                  className={i === slide ? "is-on" : undefined}
                  onClick={() => { setTaken(true); setSlide(i); }}
                  aria-label={d.name}
                  aria-current={i === slide || undefined}
                >
                  {/* The bar fills over the slide's own duration, so the dots
                      double as the timer. Paused when it is. */}
                  <span
                    className="unip-dot-fill"
                    style={{
                      animationDuration: `${SLIDE_MS}ms`,
                      animationPlayState:
                        i === slide && !taken && !paused && onScreen ? "running" : "paused",
                    }}
                  />
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => go(1)} aria-label="Next destination">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
