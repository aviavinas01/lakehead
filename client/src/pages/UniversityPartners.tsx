import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import HelpVideo from "../components/HelpVideo";
import {
  UNIVERSITIES,
  DESTINATIONS,
  countByCountry,
  countriesWithPartners,
  type University,
} from "../data/universities";
import CallbackStrip from "../components/CallbackStrip";

/**
 * University Partners — /university-partners.
 *
 * THE SLIDESHOW IS THE PAGE. A partner list is, at bottom, a grid of logos,
 * and a grid of logos is not a reason to build a page. What a student
 * actually wants to know is "where can you get me in, and what is it like
 * there" — so the destination photographs run full-bleed at the top with the
 * country name set enormous over them, and the logo wall sits underneath as
 * the reference material it is.
 *
 * WHAT THE SLIDESHOW HAS TO GET RIGHT. Auto-advance is the fastest way to
 * annoy someone reading, so it stops on hover, stops on focus, stops when
 * the section scrolls out of view, and never starts at all under
 * prefers-reduced-motion. Arrows, dots and the left/right keys all work, and
 * using any of them stops the timer for good — once you have taken hold of
 * it, it is yours.
 *
 * COUNTS ARE DERIVED, NEVER ASSERTED. The per-country tallies come from the
 * `country` field in data/universities.ts. Those fields are unset today
 * (the logos arrived without names), so the counts render as nothing rather
 * than as a confident zero, and they appear on their own as the data is
 * filled in. Nothing on this page claims a number we have not been given.
 *
 * PHOTOGRAPHY. The country photographs already exist and are the same ones
 * the home page's globe uses. /universities/hero.jpg does not exist yet;
 * `Shot` degrades it to the navy field the destination pages use.
 */

/** How long a slide holds before the next one, in ms. */
const SLIDE_MS = 6000;

const WHAT_IT_MEANS = [
  {
    title: "Applications go direct",
    text: "A partner institution takes our applications through their own channel rather than a public form. That does not make an offer more likely — nothing does but your file — but it does mean somebody reads it who can pick up the phone if a document is unclear.",
  },
  {
    title: "Decisions come back faster",
    text: "Weeks rather than months, in most cases, because there is a named admissions contact at the other end instead of a queue. It matters most when you are chasing an intake deadline.",
  },
  {
    title: "We know what they actually want",
    text: "Which grades they will flex on and which they will not, how they read a Nepali transcript, what a strong statement looks like to them. That is what a partnership is worth — it is knowledge, not a discount.",
  },
  {
    title: "And what a partnership is not",
    text: "It is not a reason to send you somewhere. Every institution on this page pays a commission, which is exactly why we tell you that here rather than hoping you never ask: our shortlist is built from your profile, and the partner list is checked afterwards, not first.",
  },
];

/**
 * One partner: the mark, on a card, and nothing else.
 *
 * A LOGO WALL RATHER THAN A CARD WITH A CAPTION. Institutions are recognised
 * by their crest, not read off a list — the mark IS the name, and setting it
 * twice makes the grid busier without making it clearer. It also survives
 * the awkward truth that these are all still called "University 1": a wall
 * of marks reads correctly today, where a wall of placeholder captions
 * reads as unfinished.
 *
 * THE NAME IS NOT LOST, it has just stopped being decoration. It is the
 * image's alt text, so a screen reader announces the institution rather than
 * skipping an unlabelled picture; it is the `title`, so a pointer can ask;
 * and it is what the search box matches on. If the file is missing the name
 * is what the card shows instead, so a typo degrades to a legible card
 * rather than a broken image.
 */
function Logo({ uni }: { uni: University }) {
  const [broken, setBroken] = useState(false);

  const mark = broken ? (
    <span className="unip-logo-fallback">{uni.name}</span>
  ) : (
    <img
      src={uni.logo}
      /* Named, not decorative: this is the only thing on the card, so an
         empty alt would leave a screen reader with an empty card. */
      alt={uni.name}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );

  /* Linked only when there is somewhere to go. A card that looks clickable
     and is not is worse than one that never suggested it. */
  return uni.url ? (
    <a
      className="unip-card"
      href={uni.url}
      target="_blank"
      rel="noopener noreferrer"
      title={uni.name}
    >
      {mark}
    </a>
  ) : (
    <div className="unip-card" title={uni.name}>
      {mark}
    </div>
  );
}

export default function UniversityPartners() {
  const [slide, setSlide] = useState(0);
  /* Set the moment anyone touches a control, and never cleared — the timer
     does not get to take the wheel back off someone who has used it. */
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [country, setCountry] = useState<string>("all");
  const [query, setQuery] = useState("");

  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "University Partners | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  const total = DESTINATIONS.length;
  const go = useCallback(
    (dir: -1 | 1) => {
      setTaken(true);
      setSlide((i) => (i + dir + total) % total);
    },
    [total]
  );

  /* Only run while the stage is actually on screen. A slideshow ticking away
     three sections above where someone is reading is pure battery. */
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
    const id = window.setInterval(
      () => setSlide((i) => (i + 1) % total),
      SLIDE_MS
    );
    return () => window.clearInterval(id);
  }, [taken, paused, onScreen, total]);

  const counts = useMemo(() => countByCountry(), []);
  const countries = useMemo(() => countriesWithPartners(), []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNIVERSITIES.filter(
      (u) =>
        (country === "all" || u.country === country) &&
        (q === "" ||
          u.name.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q))
    );
  }, [country, query]);

  const current = DESTINATIONS[slide];

  return (
    <article className="dpage dpage-ruled unip">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/universities/hero.jpg" alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <span className="svc-crumb">University Partners</span>
            </p>
            <h1 className="unip-title">
              <span className="unip-thin">Every partnership on this page</span>
              <span className="unip-fat">exists for one reason.</span>
              <span className="unip-accent">It gets a student in.</span>
            </h1>
            <p className="dpage-lead">
              We hold direct agreements with institutions across six
              destinations — which means an application desk that answers,
              admissions staff who know how to read a Nepali transcript, and
              decisions that come back in weeks.
            </p>
            <div className="dpage-hero-actions">
              <a className="btn btn-outline" href="#list">See the list →</a>
              <Link className="dpage-jump" to="/contact">
                Ask about a specific university <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ---- the slideshow ----
          Full-bleed, and the only place on the site where a single word is
          allowed to be the largest thing on screen. */}
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
        {/* Every slide stays mounted and cross-fades. Swapping the src
            instead would show a blank frame each time a photograph that is
            not in cache is fetched. */}
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
                    {/* The bar fills over the slide's own duration, so the
                        dots double as the timer. Paused when it is. */}
                    <span
                      className="unip-dot-fill"
                      style={{
                        animationDuration: `${SLIDE_MS}ms`,
                        animationPlayState:
                          i === slide && !taken && !paused && onScreen
                            ? "running"
                            : "paused",
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

      {/* ---- what a partnership means ---- */}
      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title unip-h2">
              What a partnership <span className="h-accent">actually buys you</span>
            </h2>
            <p className="dpage-section-lead">
              The word gets used loosely in this industry, so here is exactly
              what it means when we say it — including the part most
              consultancies leave off the page.
            </p>
            <div className="unip-means">
              {WHAT_IT_MEANS.map((m, i) => (
                <div className="unip-mean" key={m.title}>
                  <span className="unip-mean-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="dpage-callout">
            <h3>Not on the list?</h3>
            <p>
              We apply to non-partner institutions constantly — the agreement
              is a convenience, not a boundary. If you have a university in
              mind, bring it and we will tell you honestly what your chances
              look like.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Ask about it <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      {/* ---- the list ---- */}
      <section className="dpage-section dpage-tint" id="list">
        <div className="container">
          <h2 className="dpage-title unip-h2">
            The <span className="h-outline">institutions</span>
          </h2>
          <p className="dpage-section-lead">
            Everyone we hold a direct agreement with. It grows most years, so
            if the university you are after is not here, ask anyway.
          </p>

          <div className="unip-tools">
            <label className="unip-search">
              <span className="unip-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search institutions"
                aria-label="Search partner institutions"
              />
            </label>

            {/* Only offered once at least one partner carries a country —
                a filter row with a single "Everywhere" chip is furniture. */}
            {countries.length > 1 ? (
              <div className="unip-chiprow" role="group" aria-label="Filter by destination">
                <button
                  type="button"
                  className={`unip-chip${country === "all" ? " is-on" : ""}`}
                  onClick={() => setCountry("all")}
                  aria-pressed={country === "all"}
                >
                  Everywhere <span>{UNIVERSITIES.length}</span>
                </button>
                {countries.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`unip-chip${country === c ? " is-on" : ""}`}
                    onClick={() => setCountry(c)}
                    aria-pressed={country === c}
                  >
                    {c} <span>{counts[c]}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <p className="unip-count" aria-live="polite">
            {shown.length === 0
              ? "No institution matches that search."
              : `Showing ${shown.length} of ${UNIVERSITIES.length}`}
          </p>

          <div className="unip-grid">
            {shown.map((u) => (
              <Logo uni={u} key={u.id} />
            ))}
          </div>

          {shown.length === 0 ? (
            <button
              type="button"
              className="unip-reset"
              onClick={() => { setQuery(""); setCountry("all"); }}
            >
              Clear the search <Arrow />
            </button>
          ) : null}

          <ul className="dpage-checks unip-promises">
            <li>
              <span aria-hidden="true"><Check /></span>
              We will apply to any institution you ask about, partner or not
            </li>
            <li>
              <span aria-hidden="true"><Check /></span>
              Your shortlist is built from your profile before the partner list is opened
            </li>
            <li>
              <span aria-hidden="true"><Check /></span>
              Nothing is submitted anywhere without your sign-off
            </li>
          </ul>
        </div>
      </section>

      <CallbackStrip service="study-abroad" />

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Which one is right for you?</h2>
            <p>That answer starts with your transcript, not with this list.</p>
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
