import type { CSSProperties, ReactNode, RefObject } from "react";

/**
 * Circular hero visual: a round photo or video with flag badges and planes
 * that revolve slowly around its circumference, all at the same pace.
 * The clip that fills the circle is NOT rendered here — see below.
 *
 * Resting on the circle opens that video out until it is the background of
 * the entire hero, and stepping off closes it again. The video has to be a
 * child of the SECTION for that — an element cannot escape its own
 * containing block — so Home.tsx owns the media layer and this component
 * contributes two things to it:
 *
 *  - `.hero-photo-slot`, an empty marker sitting exactly where the resting
 *    circle belongs. Home measures it and parks the media layer on top.
 *  - `.hero-orbit-hit`, the pointer target, which stays the size of that
 *    resting circle so the opened video can never trap the cursor: step off
 *    the small circle and it closes however far it has grown.
 *
 * Open/closed state is owned by Home, because the section changes with it —
 * the headline and body copy turn white as the video comes up behind them.
 *
 * The stylesheet gates all of this to screens with a real pointer and room
 * to spare, so it is a desktop flourish; on a phone the circle just sits
 * there as before.
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

const FlagJapan = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-jp">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-jp)">
      <rect width="32" height="32" fill="#fff" />
      <circle cx="16" cy="16" r="8.2" fill="#bc002d" />
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
export const ORBIT_ENTRIES: OrbitEntry[] = [
  /* The eight destinations, evenly spaced at 45 degrees and running roughly
     west to east from the top — the same order, and the same eight, as the
     map on the "Get Ready To Begin" band. Even spacing rather than the
     hand-picked angles this list used to carry: seven flags chosen for
     looks could sit wherever they balanced, but eight that mean something
     should not look as though one of them was squeezed in.

     All the same size, for the same reason. The old list shrank two of the
     seven to break up the ring; doing that here would be saying one
     destination matters less than another. */
  { angle: -90, kind: "flag", node: <FlagUS />, to: "/study-in-usa", label: "Study in the USA" },
  { angle: -45, kind: "flag", node: <FlagCanada />, to: "/study-in-canada", label: "Study in Canada" },
  { angle: 0, kind: "flag", node: <FlagUK />, to: "/study-in-uk", label: "Study in the UK" },
  { angle: 45, kind: "flag", node: <FlagEU />, to: "/study-in-europe", label: "Study in Europe" },
  { angle: 90, kind: "flag", node: <FlagSouthKorea />, to: "/study-in-south-korea", label: "Study in South Korea" },
  { angle: 135, kind: "flag", node: <FlagJapan />, to: "/study-in-japan", label: "Study in Japan" },
  { angle: 180, kind: "flag", node: <FlagAustralia />, to: "/study-in-australia", label: "Study in Australia" },
  { angle: -135, kind: "flag", node: <FlagNewZealand />, to: "/study-in-new-zealand", label: "Study in New Zealand" },
  /* Between the flags, not on them — the midpoints of four of the eight
     gaps, so the ring reads as travel between places rather than as a row
     of badges. */
  { angle: -112.5, kind: "plane" },
  { angle: -22.5, kind: "plane" },
  { angle: 67.5, kind: "plane" },
  { angle: 157.5, kind: "plane" },
];

export default function HeroOrbit({
  open,
  slotRef,
}: {
  /**
   * True while the video is opened out across the whole section. Driven by
   * how far the page has scrolled, not by the pointer — the orbit used to
   * open and close the film on pointerenter/leave, and those handlers are
   * gone with it. See the note in pages/Home.tsx.
   */
  open: boolean;
  /** Home measures this to park the media layer on the resting circle */
  slotRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className={`hero-orbit-wrap${open ? " is-open" : ""}`}
      aria-hidden="true"
    >
      <div className="hero-orbit-stage">
        <div className="hero-orbit-ring" />
        {/* Empty on purpose. The video that fills this circle is rendered by
            Home as a child of the section, because an element cannot escape
            its own containing block and this one has to open out to the full
            width of the hero. All this marks is where it sits at rest. */}
        <div className="hero-photo-slot" ref={slotRef} />
        <div className="hero-orbit">
          {ORBIT_ENTRIES.map((e) =>
            e.kind === "flag" ? (
              <span
                key={e.angle}
                className="orbit-item"
                style={{ "--angle": `${e.angle}deg` } as CSSProperties}
              >
                <span
                  className={`orbit-badge${e.small ? " orbit-badge-sm" : ""}`}
                >
                  {e.node}
                </span>
              </span>
            ) : (
              <span
                key={e.angle}
                className="orbit-item orbit-plane"
                style={{ "--angle": `${e.angle}deg` } as CSSProperties}
              >
                <PlaneIcon />
              </span>
            ),
          )}
        </div>
      </div>
      <div
        className="hero-orbit-hit"
      />
    </div>
  );
}
