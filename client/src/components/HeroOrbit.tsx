import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Circular hero visual: a round photo or video with flag badges and planes
 * that revolve slowly around its circumference, all at the same pace.
 * Pass a clip via `videoUrl` and it plays in the circle, muted and looping,
 * with `imageUrl` as its poster; without one the image is shown on its own.
 *
 * Resting on the circle blooms the whole orbit outward — the video included —
 * and stepping off settles it back. Two things make that behave:
 *
 *  - Only `.hero-orbit-stage` scales, and it scales with a transform, so the
 *    hero grid never reflows and the headline beside it never moves.
 *  - The pointer target is `.hero-orbit-hit`, which stays the size of the
 *    RESTING circle. The enlarged visual is inert, so it can never trap the
 *    cursor: step off the small circle and it collapses however big it got.
 *
 * The stylesheet gates the growth to screens with a real pointer and room to
 * spare, so this is a desktop flourish — on a phone the circle just sits
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
  imageUrl,
  videoUrl,
}: {
  imageUrl?: string;
  videoUrl?: string;
}) {
  /* A missing file falls back to the next option rather than a broken image:
     video → photo → the neutral circle. */
  const [broken, setBroken] = useState(false);
  const [videoBroken, setVideoBroken] = useState(false);
  /* Anyone who asks for less motion gets the still instead of the clip */
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showVideo = videoUrl && !videoBroken && !reduced;
  const showPhoto = imageUrl && !broken;

  const [big, setBig] = useState(false);
  /* Scrolling wins outright over hovering, and keeps winning briefly after,
     so the circle cannot bloom under a cursor that never moved — scrolling
     re-runs hit-testing and would otherwise fire a fresh pointerenter. */
  const settleAt = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      settleAt.current = Date.now() + 350;
      setBig(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Bound to pointermove as well as pointerenter: once the page is still
     again, the next flick of the mouse over the circle re-opens it without
     making anyone leave and come back. */
  const expand = () => {
    if (Date.now() < settleAt.current) return;
    setBig(true);
  };

  return (
    <div
      className={`hero-orbit-wrap${big ? " is-big" : ""}`}
      aria-hidden="true"
    >
      <div className="hero-orbit-stage">
        <div className="hero-orbit-ring" />
        <div className="hero-photo">
          {showVideo ? (
            <video
              src={videoUrl}
              poster={showPhoto ? imageUrl : undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoBroken(true)}
            />
          ) : showPhoto ? (
            <img src={imageUrl} alt="" onError={() => setBroken(true)} />
          ) : (
            <div className="hero-photo-placeholder" />
          )}
        </div>
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
        onPointerEnter={expand}
        onPointerMove={expand}
        onPointerLeave={() => setBig(false)}
      />
    </div>
  );
}
