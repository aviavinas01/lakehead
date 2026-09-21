import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Circular hero visual: the hero's film playing inside a disc, with flag
 * badges and planes revolving slowly round it, all at the same pace.
 *
 * ------------------------------------------------------------------
 * THE FILM LIVES INSIDE THE CIRCLE AND STAYS THERE. It has been two other
 * things: a circle that opened out to fill the whole hero on hover (later on
 * scroll), and then a full-bleed background with no circle at all. Both are
 * gone. The opening version needed Home to measure an empty marker here on
 * every resize and park an absolutely positioned layer on top of it, because
 * an element that grows past its parent cannot live inside that parent.
 *
 * A circle that never grows has no such problem, so the media is simply a
 * child of the disc — `children` — clipped by its own `border-radius`.
 * Nothing is measured, nothing is published as a CSS variable, and there is
 * no open or closed state for anything else on the page to follow.
 *
 * Home still decides WHAT goes in the disc (film, photograph, or a tinted
 * placeholder), because that choice depends on the visitor's connection and
 * motion settings, which are Home's business rather than the ring's.
 * ------------------------------------------------------------------
 *
 * THE FLAGS ARE LINKS; EVERYTHING ELSE IS DECORATION. Each one opens that
 * country's guide. This used to be true only of the copy of this ring in the
 * journey section (OrbitMark); that circle has come out, and the links came
 * here rather than disappearing with it. See OrbitItems below for the three
 * things that had to change together to make that safe.
 */

const FlagUS = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-us">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-us)">
      <rect width="32" height="32" fill="#fff" />
      {[0, 4.9, 9.8, 14.8, 19.7, 24.6, 29.5].map((y) => (
        <rect key={y} y={y} width="32" height="2.5" fill="#d0342c" />
      ))}
      <rect width="15" height="14" fill="#26408b" />
    </g>
  </svg>
);

/**
 * A five-pointed star, points up, as one path.
 *
 * Three of these flags are mostly stars, and a star drawn as a polygon of
 * ten hand-typed points is ten chances to fat-finger a coordinate. Generated
 * from an angle instead, so every star on every flag is the same shape at
 * whatever size it is asked for.
 */
const star = (cx: number, cy: number, outer: number): string => {
  const inner = outer * 0.382;
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (-90 + i * 36) * (Math.PI / 180);
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(2)} ${(
      cy +
      r * Math.sin(a)
    ).toFixed(2)}`;
  }
  return d + "Z";
};

/**
 * The Union canton, shared by Australia and New Zealand.
 *
 * Their flags differ only in the stars to the right of it, so the canton is
 * drawn once. At badge size the two are meant to be near-identical — they
 * are near-identical in real life — and what separates them here is the same
 * thing that separates them on a flagpole: Australia's stars are white and
 * include the large Commonwealth star under the canton, New Zealand's are
 * four red stars with a white edge.
 */
const UnionCanton = () => (
  <g>
    <rect width="16" height="10.5" fill="#26408b" />
    <path d="M0 0l16 10.5M16 0L0 10.5" stroke="#fff" strokeWidth="2.6" />
    <path d="M0 0l16 10.5M16 0L0 10.5" stroke="#d0342c" strokeWidth="1.1" />
    <path d="M8 0v10.5M0 5.25h16" stroke="#fff" strokeWidth="3.6" />
    <path d="M8 0v10.5M0 5.25h16" stroke="#d0342c" strokeWidth="2" />
  </g>
);

const FlagAustralia = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-au">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-au)">
      <rect width="32" height="32" fill="#26408b" />
      <UnionCanton />
      <path d={star(7.5, 21.5, 4.2)} fill="#fff" />
      <g fill="#fff">
        <path d={star(24, 7.5, 2.5)} />
        <path d={star(28, 15, 2.5)} />
        <path d={star(22.5, 21, 2.5)} />
        <path d={star(19.5, 14, 2.1)} />
        <path d={star(26, 25.5, 1.5)} />
      </g>
    </g>
  </svg>
);

const FlagNewZealand = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-nz">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-nz)">
      <rect width="32" height="32" fill="#26408b" />
      <UnionCanton />
      {/* A white star with a smaller red one on top — which is how the flag
          itself draws them, and cheaper than stroking a star path. */}
      {([
        [25, 8.5, 3],
        [28.5, 17, 2.7],
        [22, 21.5, 2.7],
        [24.5, 14.5, 2.4],
      ] as const).map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <path d={star(x, y, r)} fill="#fff" />
          <path d={star(x, y, r * 0.6)} fill="#d0342c" />
        </g>
      ))}
    </g>
  </svg>
);

const FlagCanada = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-ca">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-ca)">
      <rect width="32" height="32" fill="#fff" />
      <rect width="8" height="32" fill="#d0342c" />
      <rect x="24" width="8" height="32" fill="#d0342c" />
      {/* A simplified maple leaf. Eleven points rather than the flag's
          proper eleven-point geometry with its precise notches — at thirty
          pixels the notches are sub-pixel, and what has to survive is the
          silhouette and the stem. */}
      <path
        d="M16 6.4l1.5 4.4 2.7-.8-.6 2.8 2.1-.5-.6 2 3.4 2.4-.9.8.9 2.2-4-.4v1.5l-3.1-.5.6 4.3h-1.6l.6-4.3-3.1.5v-1.5l-4 .4.9-2.2-.9-.8 3.4-2.4-.6-2 2.1.5-.6-2.8 2.7.8z"
        fill="#d0342c"
      />
    </g>
  </svg>
);

const FlagSouthKorea = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-kr">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-kr)">
      <rect width="32" height="32" fill="#fff" />
      {/* The taegeuk is set on a diagonal on the real flag, so the whole
          circle is rotated rather than the halves being redrawn.

          THREE ARCS, NOT TWO. The red half is the big semicircle over the
          top, then a half-size arc down to the centre and another half-size
          arc back out — that S is what makes it a taegeuk. With the middle
          arc missing the path asks for a radius-3.5 curve across fourteen
          units, which is impossible, so the browser silently inflates the
          radius and the red disappears under the blue. */}
      <g transform="rotate(-33.7 16 16)">
        <circle cx="16" cy="16" r="7" fill="#0047a0" />
        <path
          d="M9 16A7 7 0 0123 16A3.5 3.5 0 0116 16A3.5 3.5 0 009 16z"
          fill="#cd2e3a"
        />
      </g>
      {/* The four trigrams, three bars each. At this size they are dark
          ticks rather than readable symbols — but without them the flag is
          a circle on white, which is Japan's.

          EACH GROUP IS ROTATED PERPENDICULAR TO ITS OWN RADIUS, which is
          how they sit on the flag: a corner at angle θ from the centre gets
          θ + 90. Get the sign the wrong way round and all four turn to face
          the middle, crossing the taegeuk in an X. */}
      <g fill="#1a1a1a">
        {([
          [23.5, 8.5, 45],
          [8.5, 8.5, -45],
          [8.5, 23.5, 45],
          [23.5, 23.5, -45],
        ] as const).map(([x, y, rot]) => (
          <g key={`${x}-${y}`} transform={`rotate(${rot} ${x} ${y})`}>
            <rect x={x - 2.6} y={y - 2} width="5.2" height="0.95" />
            <rect x={x - 2.6} y={y - 0.475} width="5.2" height="0.95" />
            <rect x={x - 2.6} y={y + 1.05} width="5.2" height="0.95" />
          </g>
        ))}
      </g>
    </g>
  </svg>
);

/**
 * The European emblem — twelve gold stars in a ring on blue.
 *
 * Twelve, in a circle, always: the number is fixed and has nothing to do
 * with how many members there are. Generated from an angle for the same
 * reason as the stars above.
 */
const FlagEU = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-eu">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-eu)">
      <rect width="32" height="32" fill="#003399" />
      <g fill="#ffcc00">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (-90 + i * 30) * (Math.PI / 180);
          return (
            <path
              key={i}
              d={star(16 + 9.2 * Math.cos(a), 16 + 9.2 * Math.sin(a), 2.4)}
            />
          );
        })}
      </g>
    </g>
  </svg>
);

const FlagUK = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-uk">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-uk)">
      <rect width="32" height="32" fill="#26408b" />
      <path d="M0 0l32 32M32 0L0 32" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l32 32M32 0L0 32" stroke="#d0342c" strokeWidth="2.4" />
      <path d="M16 0v32M0 16h32" stroke="#fff" strokeWidth="9" />
      <path d="M16 0v32M0 16h32" stroke="#d0342c" strokeWidth="5" />
    </g>
  </svg>
);

export const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

interface OrbitEntry {
  angle: number;
  kind: "flag" | "plane";
  small?: boolean;
  node?: ReactNode;
  /** The guide this flag opens. Flags carry one; planes do not. */
  to?: string;
  /** Named for a screen reader and for the tooltip — see OrbitMark. */
  label?: string;
}

/**
 * The badges and their angles, exported so the ring is defined once.
 *
 * OrbitMark draws the same circle in the steps section. Duplicating this
 * list would mean the two rings quietly drifting apart — a flag added to the
 * hero and not to the other, or the same flag at two different angles — and
 * the whole point of the mark is that it is recognisably the same object.
 */
/* The destinations, in the order they run round the ring: roughly west to
   east from the top, matching the map on the "Get Ready To Begin" band.

   ORDER IS ALL THIS LIST CARRIES — the angles are worked out below rather
   than written beside each flag. That was a nicety until Japan came off the
   site, at which point it was not: a hand-written ring of eight at 45
   degrees leaves a 90-degree hole the moment one of them goes, and the hole
   is on the home page. Add or remove a destination here and the circle
   re-spaces itself, in both places that draw it.

   All the same size, deliberately. An earlier version shrank two badges to
   break the ring up; doing that here would be saying one destination
   matters less than another. */
const DESTINATIONS: { node: ReactNode; to: string; label: string }[] = [
  { node: <FlagUS />, to: "/study-in-usa", label: "Study in the USA" },
  { node: <FlagCanada />, to: "/study-in-canada", label: "Study in Canada" },
  { node: <FlagUK />, to: "/study-in-uk", label: "Study in the UK" },
  { node: <FlagEU />, to: "/study-in-europe", label: "Study in Europe" },
  { node: <FlagSouthKorea />, to: "/study-in-south-korea", label: "Study in South Korea" },
  { node: <FlagAustralia />, to: "/study-in-australia", label: "Study in Australia" },
  { node: <FlagNewZealand />, to: "/study-in-new-zealand", label: "Study in New Zealand" },
];

/* The first flag sits straight up; everything else follows from it. */
const FIRST_ANGLE = -90;
const STEP = 360 / DESTINATIONS.length;
/* Rounded, because these end up as a CSS custom property on every badge and
   51.42857142857143deg is noise in the inspector. Three places is finer
   than a pixel at this radius. */
const at = (turns: number) =>
  Math.round((FIRST_ANGLE + turns * STEP) * 1000) / 1000;

/**
 * The badges and their angles, exported so the ring is defined once.
 *
 * OrbitMark draws the same circle in the steps section. Duplicating this
 * list would mean the two rings quietly drifting apart — a flag added to the
 * hero and not to the other, or the same flag at two different angles — and
 * the whole point of the mark is that it is recognisably the same object.
 */
export const ORBIT_ENTRIES: OrbitEntry[] = [
  ...DESTINATIONS.map(
    (d, i): OrbitEntry => ({
      angle: at(i),
      kind: "flag",
      node: d.node,
      to: d.to,
      label: d.label,
    })
  ),
  /* A plane in the middle of every gap, so the ring reads as travel between
     places rather than as a row of badges.

     EVERY GAP, where it used to be every other one, and the count is what
     forced that. Eight flags could take planes in alternate gaps and still
     come back round to where they started. Seven cannot: three planes in
     seven gaps leaves one stretch with two bare gaps side by side, which
     reads as something missing rather than as a rhythm. Filling all of them
     keeps it flag-plane-flag-plane the whole way round, which is what the
     arrangement was for. */
  ...DESTINATIONS.map((_, i): OrbitEntry => ({ angle: at(i + 0.5), kind: "plane" })),
];

/**
 * The revolving badges — flags and the planes between them — for any ring
 * that draws this circle.
 *
 * ONE RENDERER, not a loop in each ring. The entries were already shared
 * (ORBIT_ENTRIES) so the two rings could not drift apart; the markup around
 * each entry is shared now too, because it is where the link, its label and
 * its accessibility live, and two copies of that would drift just as surely.
 *
 * Three things had to change together for the flags to be safely clickable:
 *
 *   · The ring's stage KEEPS `pointer-events: none` and the badges alone get
 *     it back (see `.orbit-badge-link`). The ring, the disc and the planes
 *     stay inert, so the circle never swallows a click meant for something
 *     beside or beneath it.
 *
 *   · `aria-hidden` sits on the decorative parts, never on a wrapper above a
 *     link. A focusable link inside an aria-hidden subtree is the worst of
 *     both worlds — reachable by keyboard, invisible to the screen reader
 *     announcing it.
 *
 *   · Each link carries the country's name as its accessible label and its
 *     tooltip, because its visible content is a flag with no text in it.
 *
 * A flag with no destination falls back to the plain badge, so adding one to
 * ORBIT_ENTRIES before its guide exists degrades rather than 404s.
 */
export function OrbitItems() {
  return (
    <>
      {ORBIT_ENTRIES.map((e) =>
        e.kind === "flag" ? (
          <span
            key={e.angle}
            className="orbit-item"
            style={{ "--angle": `${e.angle}deg` } as CSSProperties}
          >
            {e.to ? (
              <Link
                to={e.to}
                className={`orbit-badge orbit-badge-link${e.small ? " orbit-badge-sm" : ""}`}
                aria-label={e.label}
                title={e.label}
              >
                {e.node}
              </Link>
            ) : (
              <span
                className={`orbit-badge${e.small ? " orbit-badge-sm" : ""}`}
                aria-hidden="true"
              >
                {e.node}
              </span>
            )}
          </span>
        ) : (
          <span
            key={e.angle}
            className="orbit-item orbit-plane"
            style={{ "--angle": `${e.angle}deg` } as CSSProperties}
            aria-hidden="true"
          >
            <PlaneIcon />
          </span>
        )
      )}
    </>
  );
}

export default function HeroOrbit({
  children,
}: {
  /** What plays in the disc — Home's choice of film, photograph or
      placeholder. Clipped to the circle by the disc itself. */
  children: ReactNode;
}) {
  return (
    <div className="hero-orbit-wrap">
      <div className="hero-orbit-stage">
        <div className="hero-orbit-ring" aria-hidden="true" />
        <div className="hero-orbit-media" aria-hidden="true">
          {children}
        </div>
        <div className="hero-orbit">
          <OrbitItems />
        </div>
      </div>
    </div>
  );
}
