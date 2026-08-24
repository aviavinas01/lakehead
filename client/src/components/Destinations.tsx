import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Globe from "./Globe";

/**
 * "Your Journey to Global Education" — a turning globe on the left with a pin
 * on every country we place students in, and a deck of photos on the right
 * with the country's details underneath.
 *
 * The two halves are one control: the photo on top is always the country
 * whose pin is lit, whether it got there on its own, because the pin was
 * clicked, or because the globe was dragged round to it. It advances every
 * DWELL ms, and the globe swings the new country to the front each time.
 *
 * Below the width in the stylesheet where the layout stacks, the globe is
 * dropped entirely and only the photo deck remains — a globe that small is
 * unreadable and awkward to drag on a touch screen, and it would be pulling
 * a coastline through an animation frame on the weakest devices we serve.
 *
 * `at` is the country's real longitude and latitude; the globe projects it.
 */

const DWELL = 5000;

const DESTINATIONS: {
  name: string;
  blurb: string;
  image: string;
  at: [number, number];
}[] = [
  { name: "USA", blurb: "World-ranked universities and OPT work rights after you graduate.", image: "/usa.jpg", at: [-98, 39.5] },
  { name: "UK", blurb: "One-year master's degrees and a two-year graduate visa.", image: "/uk.jpg", at: [-1.5, 53] },
  { name: "Australia", blurb: "Strong post-study work rights in every state.", image: "/australia.jpg", at: [134, -25] },
  { name: "Canada", blurb: "Affordable tuition and a clear path to residency.", image: "/canada.jpg", at: [-106, 56] },
  { name: "New Zealand", blurb: "Small class sizes and a welcoming visa system.", image: "/newzealand.jpg", at: [172, -41] },
  { name: "South Korea", blurb: "Scholarship-rich programmes taught in English.", image: "/southkorea.jpg", at: [127.8, 36.5] },
  { name: "Denmark", blurb: "Tuition-free public universities and paid internships.", image: "/denmark.jpg", at: [10, 56] },
  { name: "India", blurb: "Globally recognised degrees close to home.", image: "/india.jpg", at: [79, 22] },
];

/** Depth of a photo in the deck: 0 is the one on top. */
const depthOf = (index: number, active: number, total: number) =>
  (index - active + total) % total;

function Photo({ src, depth }: { src: string; depth: number }) {
  /* A country without a photo yet shows a plain panel rather than a broken
     image — drop the file in client/public and it appears by itself. */
  const [missing, setMissing] = useState(false);
  return (
    <div className="dest-photo" data-depth={depth > 3 ? "back" : depth} aria-hidden={depth !== 0}>
      {missing ? (
        <div className="dest-photo-placeholder" />
      ) : (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setMissing(true)} />
      )}
    </div>
  );
}

export default function Destinations() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(false);

  const total = DESTINATIONS.length;
  const current = DESTINATIONS[active];

  /* The globe turns and the deck advances only while the section is in view. */
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    /* Nothing moves on its own for a visitor who asked for less motion —
       the pins and the drag still work. */
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => setActive((i) => (i + 1) % total), DWELL);
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
          <div className="dest-globe">
            <Globe
              points={DESTINATIONS.map((d) => ({ name: d.name, at: d.at }))}
              active={active}
              spinning={running}
              onSelect={setActive}
            />
            <p className="dest-hint">Drag the globe, or tap a pin</p>
          </div>

          <div className="dest-side">
            <div className="dest-deck">
              {DESTINATIONS.map((d, i) => (
                <Photo key={d.name} src={d.image} depth={depthOf(i, active, total)} />
              ))}
            </div>
            <div className="dest-info" aria-live="polite">
              <h3>{current.name}</h3>
              <p>{current.blurb}</p>
              <Link className="dest-more" to="/services">
                Know more
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
