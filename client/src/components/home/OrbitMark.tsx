import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ORBIT_ENTRIES, PlaneIcon } from "./HeroOrbit";

/**
 * The flags-and-planes circle, with a photograph inside it.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS NOT `HeroOrbit`. That component draws the same ring but its
 * middle is deliberately EMPTY: the hero's film is rendered by Home as a
 * child of the section, because it opens out to full width and an element
 * cannot escape its own containing block. `HeroOrbit` only marks where the
 * circle sits so Home can park the video on it, and it takes `open` and
 * `slotRef` to do that.
 *
 * None of that applies here. This one owns its own picture, has no opened
 * state and nothing to measure. Reusing the hero component would have meant
 * passing a ref nobody reads and a flag that is always false, then absolutely
 * positioning an image over a slot designed to stay empty.
 *
 * The BADGES are shared — see ORBIT_ENTRIES — so the two rings cannot drift
 * apart. It is the layout around them that differs, which is exactly the
 * split that makes sharing worthwhile.
 * ------------------------------------------------------------------
 *
 * ------------------------------------------------------------------
 * THE FLAGS ARE LINKS; EVERYTHING ELSE IS DECORATION. Each badge opens that
 * country's guide. Three things had to change together for that to be safe:
 *
 *   · The wrapper KEEPS `pointer-events: none` and the badges alone get it
 *     back. This circle sits over a scroll-linked stage, and a decorative
 *     ring that swallowed a click meant for a step underneath would be a bug
 *     nobody would think to look for here. Only the eight badges are
 *     clickable; the ring, the photograph and the planes stay inert.
 *
 *   · `aria-hidden` moved OFF the wrapper and onto the parts that are still
 *     decorative. A focusable link inside an aria-hidden subtree is the
 *     worst of both worlds — reachable by keyboard, invisible to the screen
 *     reader announcing it — so the whole thing could no longer be hidden
 *     wholesale once any of it became interactive.
 *
 *   · Each link carries the country's name as its accessible label, because
 *     its visible content is a flag with no text in it.
 *
 * The panel this sits in already sets `inert` while it is off screen (see
 * inertWhenHidden in NextSteps), so the links are not reachable by keyboard
 * before the section is in play.
 * ------------------------------------------------------------------
 */

/** Swap this for the real photograph when there is one. */
const DEFAULT_IMAGE = "/about/counselling.jpg";

export default function OrbitMark({
  image = DEFAULT_IMAGE,
  /** Seconds for one revolution. Slow enough to be atmosphere, not motion. */
  duration = 55,
}: {
  image?: string;
  duration?: number;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <div
      className="omk"
      style={{ "--orbit-duration": `${duration}s` } as CSSProperties}
    >
      <div className="omk-ring" aria-hidden="true" />

      {/* Its own tinted disc underneath, so a missing or slow file leaves a
          deliberate circle rather than a hole in the middle of the ring. */}
      <div className="omk-photo" aria-hidden="true">
        {missing ? null : (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setMissing(true)}
          />
        )}
      </div>

      <div className="omk-spin">
        {ORBIT_ENTRIES.map((e) =>
          e.kind === "flag" ? (
            <span
              key={e.angle}
              className="orbit-item"
              style={{ "--angle": `${e.angle}deg` } as CSSProperties}
            >
              {/* A flag with a destination is a link; one without falls back
                  to the plain badge, so adding a flag to ORBIT_ENTRIES
                  before its guide exists degrades rather than 404s. */}
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
      </div>
    </div>
  );
}
