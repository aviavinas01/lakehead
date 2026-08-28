import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Globe from "./Globe";

/**
 * "Your Journey to Global Education" — a turning globe on the left with a pin
 * on every country we place students in, and a deck of photos on the right
 * with the country's details underneath.
 *
 * The globe drives the cards, not a timer: whichever country is facing the
 * viewer is the one whose photo shows. So they arrive in the order the globe
 * actually brings them round — Canada, the USA, the UK, South Korea,
 * Australia, New Zealand — and each gets a spell as long as the gap to its
 * neighbour, which is why close pairs like Canada and the USA each get a
 * short one. Dragging the globe or picking a pin moves the cards
 * the same way, because it moves what is facing.
 *
 * Below the width in the stylesheet where the layout stacks, the globe is
 * dropped entirely and only the photo deck remains — a globe that small is
 * unreadable and awkward to drag on a touch screen, and it would be pulling
 * a coastline through an animation frame on the weakest devices we serve.
 *
 * `at` is the country's real longitude and latitude; the globe projects it.
 */

/* The single source of truth for what the globe shows. countryShapes.ts
   still carries outlines for a few countries that are not listed here —
   leaving them costs nothing and means a country can be restored by adding
   one line back to this array. Keep the list in longitude order: the deck
   follows whatever the globe brings round next. */
const DESTINATIONS: {
  name: string;
  blurb: string;
  image: string;
  at: [number, number];
  /* Where "Know more" goes. Countries without a page of their own yet fall
     back to the services page — give one a `to` as its page is built. */
  to?: string;
}[] = [
  { name: "Canada", blurb: "Affordable tuition and a clear path to residency.", image: "/canada.jpg", at: [-106, 56], to: "/study-in-canada" },
  { name: "USA", blurb: "World-ranked universities and OPT work rights after you graduate.", image: "/usa.jpg", at: [-98, 39.5], to: "/study-in-usa" },
  { name: "UK", blurb: "One-year master's degrees and a two-year graduate visa.", image: "/uk.jpg", at: [-1.5, 53], to: "/study-in-uk" },
  { name: "South Korea", blurb: "Scholarship-rich programmes taught in English.", image: "/southkorea.jpg", at: [127.8, 36.5], to: "/study-in-south-korea" },
  { name: "Australia", blurb: "Strong post-study work rights in every state.", image: "/australia.jpg", at: [134, -25], to: "/study-in-australia" },
  { name: "New Zealand", blurb: "Small class sizes and a welcoming visa system.", image: "/newzealand.jpg", at: [172, -41], to: "/study-in-new-zealand" },
];


/**
 * Where a photo sits relative to the one showing: 0 is the middle, +1 is the
 * country next in line (waiting above), -1 the one just shown (leaving
 * below). Everything else is out of sight. Taking the shorter way round the
 * list keeps the queue moving one way as the globe turns.
 */
function offsetOf(index: number, active: number, total: number) {
  let rel = index - active;
  if (rel > total / 2) rel -= total;
  if (rel < -total / 2) rel += total;
  return rel;
}

function Photo({ src, name, offset }: { src: string; name: string; offset: number }) {
  /* A country without a photo yet shows a plain panel rather than a broken
     image — drop the file in client/public and it appears by itself. */
  const [missing, setMissing] = useState(false);
  const slot = Math.abs(offset) > 1 ? "away" : String(offset);
  return (
    <div className="dest-photo" data-slot={slot} aria-hidden={offset !== 0}>
      {missing ? (
        <div className="dest-photo-placeholder" />
      ) : (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setMissing(true)} />
      )}
      {/* The name rides on the card rather than sitting in the text below it,
          so it travels with its own photo as the deck turns — and it still
          names the country while the photo is only half in view. */}
      <p className="dest-photo-name">{name}</p>
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

        {/* Nothing here pauses on hover: the globe keeps turning while the
            pointer is over it, and the cards keep following it round. */}
        <div className="dest-layout">
          <div className="dest-globe">
            <Globe
              points={DESTINATIONS.map((d) => ({ name: d.name, at: d.at }))}
              active={active}
              spinning={running}
              onSelect={setActive}
              onFacing={setActive}
            />
            <p className="dest-hint">Drag the globe, or tap a pin</p>
          </div>

          <div className="dest-side">
            <div className="dest-deck">
              {DESTINATIONS.map((d, i) => (
                <Photo
                  key={d.name}
                  src={d.image}
                  name={d.name}
                  offset={offsetOf(i, active, total)}
                />
              ))}
            </div>
            <div className="dest-info" aria-live="polite">
              {/* The name is shown on the card now, but it still has to be in
                  the live region: without it the announcement is a blurb with
                  no country attached to it. */}
              <h3 className="dest-info-country">{current.name}</h3>
              <p>{current.blurb}</p>
              <Link className="dest-more" to={current.to ?? "/services"}>
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
