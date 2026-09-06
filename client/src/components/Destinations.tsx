import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * "Your Journey to Global Education" — the destinations grid on the home
 * page: one tile per country, and a last tile that sends you to the form.
 *
 * Each tile is a single link covering the whole card. Resting on it puts the
 * photograph out of focus and brings up what that country actually offers on
 * top of it; clicking anywhere goes to that country's page. One link rather
 * than a second one buried in the detail panel is what keeps this usable by
 * keyboard and on a touch screen.
 *
 * On a touch screen the detail panel is dropped entirely (see the
 * stylesheet) and the name stays on the front where it always is, because a
 * card that only gives up its content on hover gives up nothing to a thumb.
 *
 * This replaced a turning globe carrying the same six countries. The globe
 * and its coastline data went with it; `git log` has them if the idea ever
 * comes back.
 */

const DESTINATIONS: {
  name: string;
  /** What the back of the card says. One sentence. */
  blurb: string;
  /** Two short facts, listed under the blurb. */
  facts: string[];
  /** Path under client/public. */
  image: string;
  to: string;
}[] = [
  {
    name: "Australia",
    blurb: "Strong post-study work rights in every state, and a straight run from campus to a skilled visa.",
    facts: ["2–4 year post-study work visa", "February and July intakes"],
    image: "/australia.jpg",
    to: "/study-in-australia",
  },
  {
    name: "New Zealand",
    blurb: "Small class sizes and a welcoming visa system, with the shortest queues of any destination we place into.",
    facts: ["Up to 3 years post-study work", "Partner and dependant visas"],
    image: "/newzealand.jpg",
    to: "/study-in-new-zealand",
  },
  {
    name: "United States",
    blurb: "World-ranked universities and OPT work rights, with more scholarship money than anywhere else on this list.",
    facts: ["12–36 months of OPT", "Fall and Spring intakes"],
    image: "/usa.jpg",
    to: "/study-in-usa",
  },
  {
    name: "United Kingdom",
    blurb: "One-year master's degrees and a two-year graduate visa — the fastest route from application to working abroad.",
    facts: ["1-year master's degrees", "2-year Graduate Route visa"],
    image: "/uk.jpg",
    to: "/study-in-uk",
  },
  {
    name: "Canada",
    blurb: "Affordable tuition and the clearest path to permanent residency of any country we work with.",
    facts: ["Up to 3 years of PGWP", "A named route to residency"],
    image: "/canada.jpg",
    to: "/study-in-canada",
  },
  {
    name: "South Korea",
    blurb: "Scholarship-rich programmes taught in English, at a cost of living well below the west.",
    facts: ["Government scholarships", "Taught in English"],
    image: "/southkorea.jpg",
    to: "/study-in-south-korea",
  },
];

const Arrow = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Tile({ destination }: { destination: (typeof DESTINATIONS)[number] }) {
  /* A country without a photo yet shows a plain field rather than a broken
     image — drop the file in client/public and it appears by itself. */
  const [missing, setMissing] = useState(false);

  return (
    <Link className="dtile" to={destination.to}>
      {/* Both layers share one box: the photograph beneath, the detail over
          it. The link itself is left out of all of it, so its shadow and its
          focus ring are never caught up in what happens inside. */}
      <span className="dtile-turn">
        <span className="dtile-face dtile-front">
          {missing ? (
            <span className="dtile-blank" aria-hidden="true" />
          ) : (
            <img
              src={destination.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setMissing(true)}
            />
          )}
          <span className="dtile-scrim" aria-hidden="true" />
          <span className="dtile-name">{destination.name}</span>
        </span>

        {/* aria-hidden: the same country said twice is noise. The front's
            name and the link's own destination already say where this goes,
            and these facts are a flourish rather than the only copy — every
            one of them is on the country's own page. */}
        <span className="dtile-face dtile-back" aria-hidden="true">
          <span className="dtile-back-name">{destination.name}</span>
          <span className="dtile-back-blurb">{destination.blurb}</span>
          <span className="dtile-facts">
            {destination.facts.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </span>
          <span className="dtile-more">
            Explore {destination.name} <Arrow size={16} />
          </span>
        </span>
      </span>
    </Link>
  );
}

export default function Destinations() {
  return (
    <section className="destinations">
      <div className="container dest-head">
        <h2 className="destinations-title">
          Your Journey to Global Education{" "}
          <span className="h-accent">Starts Here</span>
        </h2>
      </div>

      <div className="container">
        <div className="dest-grid">
          {DESTINATIONS.map((d) => (
            <Tile key={d.name} destination={d} />
          ))}

          {/* The way out of the grid. It spans whatever is left of its row,
              so the block ends square however many columns the width has
              given us — six countries and this make seven, which never
              divides evenly on its own. */}
          <Link className="dtile dtile-cta" to="/contact">
            <Arrow size={30} />
            <strong>
              Begin your
              <br />
              journey
            </strong>
            <span>Free counselling, no obligation</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
