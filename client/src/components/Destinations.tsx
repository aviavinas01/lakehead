import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORLD_PATH } from "./worldMapPath";

/**
 * "Choose your destination" — a greyscale world map on the left with a pin on
 * every country we place students in, and a deck of country cards on the
 * right showing one at a time.
 *
 * The two halves are one control: the card on top is always the country whose
 * pin is lit, whether it got there on its own or because someone clicked the
 * pin. It advances every DWELL ms.
 *
 * Two things keep it cheap. The map is a single static path (see
 * worldMapPath.ts) — no request, no map library, no tiles. And the timer only
 * runs while the section is actually on screen, so a visitor reading the
 * footer is not quietly cycling images behind them.
 *
 * `pin` is the country's position in the map's own 1000x480 coordinates,
 * projected from its real latitude and longitude when the path was generated.
 */

const DWELL = 5000;

const DESTINATIONS: {
  name: string;
  blurb: string;
  image: string;
  pin: [number, number];
}[] = [
  { name: "USA", blurb: "World-ranked universities and OPT work rights", image: "/usa.jpg", pin: [248.3, 149.7] },
  { name: "UK", blurb: "One-year master's degrees and a two-year graduate visa", image: "/uk.jpg", pin: [496.4, 107.1] },
  { name: "Australia", blurb: "Strong post-study work rights across every state", image: "/australia.jpg", pin: [861.3, 357.6] },
  { name: "Canada", blurb: "Affordable tuition and a clear path to residency", image: "/canada.jpg", pin: [251.8, 98] },
  { name: "New Zealand", blurb: "Small class sizes and a welcoming visa system", image: "/newzealand.jpg", pin: [938.8, 409.3] },
  { name: "South Korea", blurb: "Scholarship-rich programmes taught in English", image: "/southkorea.jpg", pin: [832.3, 159.3] },
  { name: "Denmark", blurb: "Tuition-free public universities for EU students", image: "/denmark.jpg", pin: [523.4, 98] },
  { name: "India", blurb: "Globally recognised degrees close to home", image: "/india.jpg", pin: [714.5, 206.2] },
];

/** Depth of a card in the deck: 0 is the one on top. */
const depthOf = (index: number, active: number, total: number) =>
  (index - active + total) % total;

function CountryCard({
  name,
  blurb,
  image,
  depth,
}: {
  name: string;
  blurb: string;
  image: string;
  depth: number;
}) {
  /* A country without a photo yet shows a plain panel rather than a broken
     image — drop the file in client/public and it appears by itself. */
  const [missing, setMissing] = useState(false);

  return (
    <article
      className="dest-card"
      data-depth={depth > 3 ? "back" : depth}
      aria-hidden={depth !== 0}
    >
      {missing ? (
        <div className="dest-card-placeholder" />
      ) : (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setMissing(true)}
        />
      )}
      <div className="dest-card-body">
        <h3>{name}</h3>
        <p>{blurb}</p>
      </div>
    </article>
  );
}

export default function Destinations() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(false);

  const total = DESTINATIONS.length;
  const current = DESTINATIONS[active];

  /* The deck only turns while the section is in view. */
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    /* Nothing rotates on its own for a visitor who asked for less motion —
       the pins still work. */
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % total),
      DWELL
    );
    return () => window.clearInterval(id);
  }, [running, total]);

  return (
    <section className="destinations" ref={section}>
      <div className="container">
        <h2 className="destinations-title">
          Your Journey to Global Education{" "}
          <span className="h-accent">Starts Here</span>
        </h2>
        <p className="destinations-lead">
          Explore leading study destinations including Australia, the USA,
          Canada, the UK, and more. Our experts help you discover the right
          universities, scholarships, and opportunities to turn your
          study-abroad plans into reality.
        </p>

        <div
          className="dest-layout"
          /* Hovering holds whichever country you are looking at */
          onMouseEnter={() => setRunning(false)}
          onMouseLeave={() => setRunning(true)}
        >
          <div className="dest-map">
            <svg viewBox="0 0 1000 480" role="img" aria-label="World map of our study destinations">
              <path className="dest-land" d={WORLD_PATH} />
              {DESTINATIONS.map((d, i) => (
                <g key={d.name} className={i === active ? "dest-pin is-on" : "dest-pin"}>
                  {i === active && (
                    <circle className="dest-pin-halo" cx={d.pin[0]} cy={d.pin[1]} r="16" />
                  )}
                  <circle className="dest-pin-dot" cx={d.pin[0]} cy={d.pin[1]} r="6" />
                </g>
              ))}
            </svg>
            {/* The pins themselves are buttons in the layer above, so they
                stay real controls with real focus rings rather than SVG
                shapes pretending to be clickable. */}
            <div className="dest-pin-hits">
              {DESTINATIONS.map((d, i) => (
                <button
                  key={d.name}
                  type="button"
                  className={i === active ? "dest-hit is-on" : "dest-hit"}
                  style={{
                    left: `${(d.pin[0] / 1000) * 100}%`,
                    top: `${(d.pin[1] / 480) * 100}%`,
                  }}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  aria-label={`Show ${d.name}`}
                >
                  <span>{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dest-deck" aria-live="polite">
            {DESTINATIONS.map((d, i) => (
              <CountryCard
                key={d.name}
                name={d.name}
                blurb={d.blurb}
                image={d.image}
                depth={depthOf(i, active, total)}
              />
            ))}
            <Link className="dest-cta" to="/services">
              Explore {current.name}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
