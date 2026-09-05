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

const FlagIndia = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-in">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-in)">
      <rect width="32" height="10.7" fill="#ff9933" />
      <rect y="10.7" width="32" height="10.6" fill="#fff" />
      <rect y="21.3" width="32" height="10.7" fill="#138808" />
      <circle
        cx="16"
        cy="16"
        r="3"
        fill="none"
        stroke="#054187"
        strokeWidth="1.4"
      />
    </g>
  </svg>
);

const FlagSweden = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-se">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-se)">
      <rect width="32" height="32" fill="#0a6aa1" />
      <rect x="9.5" width="5.5" height="32" fill="#fecc02" />
      <rect y="13.3" width="32" height="5.5" fill="#fecc02" />
    </g>
  </svg>
);

const FlagSpain = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-es">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-es)">
      <rect width="32" height="32" fill="#c60b1e" />
      <rect y="8" width="32" height="16" fill="#ffc400" />
    </g>
  </svg>
);

const FlagItaly = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-it">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-it)">
      <rect width="10.7" height="32" fill="#169b62" />
      <rect x="10.7" width="10.6" height="32" fill="#fff" />
      <rect x="21.3" width="10.7" height="32" fill="#d62828" />
    </g>
  </svg>
);

const FlagBelgium = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <clipPath id="flag-be">
      <circle cx="16" cy="16" r="16" />
    </clipPath>
    <g clipPath="url(#flag-be)">
      <rect width="10.7" height="32" fill="#2d2926" />
      <rect x="10.7" width="10.6" height="32" fill="#ffd90c" />
      <rect x="21.3" width="10.7" height="32" fill="#f31830" />
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
}

const entries: OrbitEntry[] = [
  { angle: -90, kind: "flag", node: <FlagUS /> },
  { angle: -30, kind: "flag", node: <FlagSweden /> },
  { angle: 15, kind: "flag", small: true, node: <FlagItaly /> },
  { angle: 95, kind: "flag", node: <FlagUK /> },
  { angle: 150, kind: "flag", node: <FlagBelgium /> },
  { angle: 185, kind: "flag", small: true, node: <FlagSpain /> },
  { angle: -145, kind: "flag", node: <FlagIndia /> },
  { angle: -120, kind: "plane" },
  { angle: -55, kind: "plane" },
  { angle: 55, kind: "plane" },
  { angle: 215, kind: "plane" },
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
          {entries.map((e) =>
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
